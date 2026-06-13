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
  return message;
}

async function fetchProfile(userId: string): Promise<AppUser | null> {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("id, email, name, course")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile:", error.message);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    email: data.email ?? "",
    name: data.name,
    course: data.course,
  };
}

async function ensureUserFromSession(session: Session): Promise<AppUser | null> {
  const existing = await fetchProfile(session.user.id);
  if (existing) return existing;

  const meta = session.user.user_metadata ?? {};
  const email = session.user.email ?? "";
  const name = typeof meta.name === "string" ? meta.name : "";
  const course = typeof meta.course === "string" ? meta.course : "";

  const { error: insertError } = await requireSupabase().from("profiles").insert({
    id: session.user.id,
    email,
    name,
    course,
  });

  if (insertError) {
    console.error("Failed to create profile:", insertError.message);
    const retry = await fetchProfile(session.user.id);
    if (retry) return retry;

    if (name || course || email) {
      return { id: session.user.id, email, name, course };
    }

    return null;
  }

  return fetchProfile(session.user.id);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isReady, setIsReady] = useState(false);

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
        const profile = await ensureUserFromSession(data.session);
        if (!mounted) return;
        setUser(profile);
      } else {
        setUser(null);
      }

      setIsReady(true);
    }

    initSession();

    const { data: listener } = requireSupabase().auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        const profile = await ensureUserFromSession(session);
        if (!mounted) return;
        setUser(profile);
      } else {
        setUser(null);
      }

      setIsReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

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

    const profile = await ensureUserFromSession(data.session);
    if (!profile) {
      return {
        ok: false as const,
        message:
          "Signed in, but your profile could not be loaded. Make sure setup.sql was run in Supabase, then try again.",
      };
    }

    setUser(profile);
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
        const profile = await ensureUserFromSession(data.session);
        if (profile) setUser(profile);
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
