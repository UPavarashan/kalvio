import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="min-h-screen bg-surface paper-texture flex items-center justify-center">
        <p className="font-label text-sm text-on-surface-variant">Loading…</p>
      </div>
    );
  }

  if (!user) return <Login />;
  return children;
}
