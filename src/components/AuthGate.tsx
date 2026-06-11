import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, isReady } = useAuth();

  if (!isReady) return null;
  if (!user) return <Login />;
  return children;
}
