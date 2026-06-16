import { useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import WhatsNewModal from "./WhatsNewModal";
import { hasSeenCurrentChangelog } from "../config/changelog";

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, isReady } = useAuth();
  const [showWhatsNew, setShowWhatsNew] = useState(() => !hasSeenCurrentChangelog());

  if (!isReady) {
    return (
      <div className="min-h-screen bg-surface paper-texture flex items-center justify-center pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="font-label text-sm text-on-surface-variant">Loading…</p>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <>
      {children}
      {showWhatsNew && <WhatsNewModal onClose={() => setShowWhatsNew(false)} />}
    </>
  );
}
