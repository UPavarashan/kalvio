import { useState, type FormEvent } from "react";
import {
  getAccessCode,
  grantAccess,
  isAccessGranted,
  verifyAccessCode,
} from "../config/accessGate";
import { inputClass } from "../utils/formClasses";

interface AccessGateProps {
  children: React.ReactNode;
}

export default function AccessGate({ children }: AccessGateProps) {
  const [unlocked, setUnlocked] = useState(isAccessGranted);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const accessConfigured = Boolean(getAccessCode());

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!accessConfigured) {
      setError("Access code is not configured. Set VITE_ACCESS_CODE in .env");
      return;
    }

    if (verifyAccessCode(code)) {
      grantAccess();
      setUnlocked(true);
      return;
    }

    setError("Incorrect access code. Try again.");
    setCode("");
  };

  if (unlocked) return children;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <h1 className="font-headline text-2xl font-semibold text-primary">Kalvio</h1>
          <p className="font-body text-sm text-on-surface-variant mt-2">
            Private beta — enter your access code to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="access-code"
              className="font-label text-[10px] text-on-surface-variant block mb-1"
            >
              Access code
            </label>
            <input
              id="access-code"
              type="password"
              autoComplete="off"
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError("");
              }}
              className={inputClass}
              placeholder="Enter code"
            />
          </div>

          {error && (
            <p className="font-label text-xs text-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
