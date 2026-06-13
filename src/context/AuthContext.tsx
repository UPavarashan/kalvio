import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
      const message =
        error.message.toLowerCase().includes("email not confirmed")
          ? "This account was created before email confirmation was turned off. Delete it in Supabase and sign up again, or ask Pavarashan to confirm it manually."
          : error.message;
      return { ok: false as const, message };
    }
    return { ok: true as const };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string, course: string) => {
      const { data, error } = await requireSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            course: course.trim(),
          },
        },
      });

      if (error) {
        return { ok: false as const, message: error.message };
      }

      if (data.user?.identities?.length === 0) {
        return {
          ok: false as const,
          message: "This email is already registered. Try signing in instead.",
        };
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
