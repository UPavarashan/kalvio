import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { findTestUser, findTestUserById, type TestUser } from "../config/testUsers";
import {
  clearCurrentUserId,
  getCurrentUserId,
  setCurrentUserId,
} from "../utils/userStorage";

interface AuthContextValue {
  user: TestUser | null;
  isReady: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): TestUser | null {
  const userId = getCurrentUserId();
  if (!userId) return null;
  return findTestUserById(userId);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TestUser | null>(() => readStoredUser());
  const [isReady] = useState(true);

  const login = useCallback((username: string, password: string) => {
    const match = findTestUser(username, password);
    if (!match) return false;
    setCurrentUserId(match.id);
    setUser(match);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearCurrentUserId();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, logout }),
    [user, isReady, login, logout]
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
