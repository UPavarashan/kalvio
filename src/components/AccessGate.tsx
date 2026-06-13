import { useState, type FormEvent } from "react";
import { grantAccess, isAccessGranted, isAccessCodeConfigured, verifyAccessCode } from "../config/accessGate";
import { KalvioBrand } from "./KalvioLogo";
import { inputClass } from "../utils/formClasses";

interface AccessGateProps {
  children: React.ReactNode;
}

export default function AccessGate({ children }: AccessGateProps) {
  const [unlocked, setUnlocked] = useState(isAccessGranted);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (verifyAccessCode(code)) {
      grantAccess();
      setUnlocked(true);
      return;
    }

    setError("Incorrect access code");
    setCode("");
  };

  if (unlocked) return children;

  if (!isAccessCodeConfigured()) {
    return (
      <div className="min-h-screen bg-surface paper-texture flex items-center justify-center p-6">
        <div className="hand-drawn-border charcoal-shadow-lg bg-surface-container w-full max-w-sm p-8 text-center">
          <KalvioBrand size="lg" className="mb-6" />
          <p className="font-body text-sm text-error">
            Access code is not configured. Set <code className="font-mono text-xs">VITE_ACCESS_CODE</code> in
            your environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface paper-texture flex items-center justify-center p-6">
      <div className="hand-drawn-border charcoal-shadow-lg bg-surface-container w-full max-w-sm p-8">
        <KalvioBrand size="lg" className="mb-6" />
        <p className="font-body text-sm text-on-surface-variant text-center -mt-4 mb-6">
          Enter your access code to continue.
        </p>

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
            className="w-full px-4 py-2.5 bg-error text-on-error hand-drawn-border font-label text-xs charcoal-shadow hover:opacity-90 transition-opacity"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
