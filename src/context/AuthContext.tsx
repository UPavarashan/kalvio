import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { requireSupabase } from "../utils/supabaseClient";
import { getEmailRedirectUrl } from "../config/auth";
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
  ) => Promise<{ ok: true; needsConfirmation: boolean } | { ok: false; message: string }>;
  resendConfirmation: (email: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatAuthError(message: string, status?: number): string {
  const lower = message.toLowerCase();
  if (status === 429 || lower.includes("rate limit")) {
    return "Email rate limit reached. Supabase's built-in email only allows a few messages per hour. Wait and try again, or set up custom SMTP in Supabase.";
  }
  if (lower.includes("redirect") || lower.includes("invalid")) {
    return `${message} Add https://www.kalvio.org to Supabase → Authentication → URL Configuration → Redirect URLs.`;
  }
  return message;
}

function signUpOptions(name: string, course: string) {
  return {
    emailRedirectTo: getEmailRedirectUrl(),
    data: {
      name: name.trim(),
      course: course.trim(),
    },
  };
}

async function fetchProfile(userId: string): Promise<AppUser | null> {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("id, email, name, course")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email ?? "",
    name: data.name,
    course: data.course,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const { data } = await requireSupabase().auth.getSession();
      if (!mounted) return;

      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id);
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
        const profile = await fetchProfile(session.user.id);
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
    const { error } = await requireSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { ok: false as const, message: error.message };
    }
    return { ok: true as const };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string, course: string) => {
      const { data, error } = await requireSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: signUpOptions(name, course),
      });

      if (error) {
        return { ok: false as const, message: formatAuthError(error.message, error.status) };
      }

      if (data.user?.identities?.length === 0) {
        return {
          ok: false as const,
          message:
            "This email is already registered. Try signing in, or use Resend confirmation below.",
        };
      }

      return {
        ok: true as const,
        needsConfirmation: !data.session,
      };
    },
    []
  );

  const resendConfirmation = useCallback(async (email: string) => {
    const { error } = await requireSupabase().auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: getEmailRedirectUrl(),
      },
    });

    if (error) {
      return { ok: false as const, message: formatAuthError(error.message, error.status) };
    }
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await requireSupabase().auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, signUp, resendConfirmation, logout }),
    [user, isReady, login, signUp, resendConfirmation, logout]
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
