import { useEffect, useState, type FormEvent } from "react";
import { hasAuthCallbackInUrl } from "../config/auth";
import { KalvioBrand } from "../components/KalvioLogo";
import { useAuth } from "../context/AuthContext";
import { inputClass } from "../utils/formClasses";

type AuthMode = "signin" | "signup";

export default function Login() {
  const { login, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hasAuthCallbackInUrl()) return;

    setInfo("Finishing sign-in from your email link…");
    setMode("signin");
    setError("");
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    try {
      if (mode === "signin") {
        const result = await login(email, password);
        if (!result.ok) {
          setError(result.message);
          setPassword("");
          return;
        }
        setInfo("Signed in. Loading your dashboard…");
        return;
      }

      const result = await signUp(email, password, name, course);
      if (!result.ok) {
        setError(result.message);
        setPassword("");
        return;
      }

      if (result.signedIn) {
        setInfo("Account created. Welcome to Kalvio!");
        return;
      }

      setInfo("Account created. Sign in with your email and password.");
      setMode("signin");
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface paper-texture flex items-center justify-center p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="hand-drawn-border charcoal-shadow-lg bg-surface-container w-full max-w-sm p-6 sm:p-8">
        <KalvioBrand size="lg" className="mb-6" />
        <p className="font-body text-sm text-on-surface-variant text-center -mt-4 mb-6">
          &ldquo;Thanks for testing Kalvio with me — it&apos;s still in the early stages, so things
          might not work exactly as they should. Honest feedback is always welcome. Thank you!&rdquo;
          <span className="block mt-2 text-on-surface">— Pavarashan</span>
        </p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setInfo("");
            }}
            className={`flex-1 px-3 py-2 hand-drawn-border font-label text-xs transition-colors ${
              mode === "signin"
                ? "bg-primary text-on-primary"
                : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setInfo("");
            }}
            className={`flex-1 px-3 py-2 hand-drawn-border font-label text-xs transition-colors ${
              mode === "signup"
                ? "bg-primary text-on-primary"
                : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label
                  htmlFor="login-name"
                  className="font-label text-[10px] text-on-surface-variant block mb-1"
                >
                  Name
                </label>
                <input
                  id="login-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="login-course"
                  className="font-label text-[10px] text-on-surface-variant block mb-1"
                >
                  Course
                </label>
                <input
                  id="login-course"
                  type="text"
                  required
                  value={course}
                  onChange={(e) => {
                    setCourse(e.target.value);
                    if (error) setError("");
                  }}
                  className={inputClass}
                  placeholder="e.g. Computer Science"
                />
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="login-email"
              className="font-label text-[10px] text-on-surface-variant block mb-1"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className={inputClass}
              placeholder="you@university.edu"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="font-label text-[10px] text-on-surface-variant block mb-1"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="font-label text-xs text-error" role="alert">
              {error}
            </p>
          )}

          {info && (
            <p className="font-label text-xs text-primary" role="status">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2.5 bg-error text-on-error hand-drawn-border font-label text-xs charcoal-shadow hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
