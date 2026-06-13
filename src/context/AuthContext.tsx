import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getSiteUrl } from "../config/auth";
import { requireSupabase } from "../utils/supabaseClient";
import type { AppUser } from "../types/user";

interface AuthContextValue {
  user: AppUser | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    course: string
  ) => Promise<{ ok: true; signedIn: boolean } | { ok: false; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("signups are disabled") || lower.includes("signup is disabled")) {
    return "Sign ups are disabled in Supabase. Enable Email provider and turn on “Allow new users to sign up” under Authentication → Providers → Email.";
  }
  if (lower.includes("email provider") && lower.includes("disabled")) {
    return "Email login is disabled in Supabase. Turn on the Email provider under Authentication → Providers → Email.";
  }
  if (lower.includes("rate limit") && lower.includes("email")) {
    return "Supabase email limit reached (~2/hour on the free built-in mailer). Turn off “Confirm email” under Authentication → Providers → Email, wait about an hour, then try again.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Wrong email or password. If you just signed up, use the same email and password from sign up.";
  }
  if (lower.includes("database error saving new user")) {
    return "Database setup issue on signup. Run supabase/sql/migrate_program_to_course.sql in the Supabase SQL Editor, then try again.";
  }
  return message;
}

function userFromSession(session: Session): AppUser {
  const meta = session.user.user_metadata ?? {};
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: typeof meta.name === "string" ? meta.name : "",
    course: typeof meta.course === "string" ? meta.course : "",
  };
}

type ProfileRow = {
  id: string;
  email: string | null;
  name: string;
  course?: string;
  program?: string;
};

async function fetchProfile(userId: string): Promise<AppUser | null> {
  const supabase = requireSupabase();

  const withCourse = await supabase
    .from("profiles")
    .select("id, email, name, course")
    .eq("id", userId)
    .maybeSingle();

  if (!withCourse.error && withCourse.data) {
    return profileRowToUser(withCourse.data);
  }

  const courseMissing = withCourse.error?.message.toLowerCase().includes("course");
  if (!courseMissing) {
    if (withCourse.error) console.error("Failed to load profile:", withCourse.error.message);
    return null;
  }

  const withProgram = await supabase
    .from("profiles")
    .select("id, email, name, program")
    .eq("id", userId)
    .maybeSingle();

  if (withProgram.error) {
    console.error("Failed to load profile:", withProgram.error.message);
    return null;
  }

  if (!withProgram.data) return null;
  return profileRowToUser(withProgram.data);
}

function profileRowToUser(row: ProfileRow): AppUser {
  return {
    id: row.id,
    email: row.email ?? "",
    name: row.name,
    course: row.course ?? row.program ?? "",
  };
}

async function syncProfileInBackground(session: Session, baseUser: AppUser): Promise<void> {
  const profile = await fetchProfile(session.user.id);
  if (profile) return;

  const { error } = await requireSupabase().from("profiles").insert({
    id: baseUser.id,
    email: baseUser.email,
    name: baseUser.name,
    course: baseUser.course,
  });

  if (error) {
    const { error: legacyError } = await requireSupabase().from("profiles").insert({
      id: baseUser.id,
      email: baseUser.email,
      name: baseUser.name,
      program: baseUser.course,
    });

    if (legacyError && !legacyError.message.toLowerCase().includes("duplicate")) {
      console.error("Failed to create profile:", legacyError.message);
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const applySession = useCallback((session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      return;
    }

    const nextUser = userFromSession(session);
    setUser(nextUser);
    void syncProfileInBackground(session, nextUser);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const supabase = requireSupabase();
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("Failed to restore session:", error.message);
        setUser(null);
        setIsReady(true);
        return;
      }

      if (data.session?.user) {
        setUser(userFromSession(data.session));
        void syncProfileInBackground(data.session, userFromSession(data.session));
      } else {
        setUser(null);
      }

      setIsReady(true);
    }

    initSession();

    const { data: listener } = requireSupabase().auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      applySession(session);
      setIsReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [applySession]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await requireSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const message = formatAuthError(
        error.message.toLowerCase().includes("email not confirmed")
          ? "This account was created before email confirmation was turned off. Delete it in Supabase and sign up again, or ask Pavarashan to confirm it manually."
          : error.message
      );
      return { ok: false as const, message };
    }

    if (!data.session) {
      return { ok: false as const, message: "Sign in succeeded but no session was created. Try again." };
    }

    const nextUser = userFromSession(data.session);
    setUser(nextUser);
    void syncProfileInBackground(data.session, nextUser);
    return { ok: true as const };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string, course: string) => {
      const { data, error } = await requireSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: getSiteUrl(),
          data: {
            name: name.trim(),
            course: course.trim(),
          },
        },
      });

      if (error) {
        return { ok: false as const, message: formatAuthError(error.message) };
      }

      if (data.user?.identities?.length === 0) {
        return {
          ok: false as const,
          message: "This email is already registered. Try signing in instead.",
        };
      }

      if (data.session) {
        const nextUser = userFromSession(data.session);
        setUser(nextUser);
        void syncProfileInBackground(data.session, nextUser);
      }

      return {
        ok: true as const,
        signedIn: Boolean(data.session),
      };
    },
    []
  );

  const logout = useCallback(async () => {
    await requireSupabase().auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, signUp, logout }),
    [user, isReady, login, signUp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
