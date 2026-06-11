import { useState, type FormEvent } from "react";
import { TEST_USERS } from "../config/testUsers";
import { useAuth } from "../context/AuthContext";
import { inputClass } from "../utils/formClasses";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (login(username, password)) return;

    setError("Incorrect username or password");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-surface paper-texture flex items-center justify-center p-6">
      <div className="hand-drawn-border charcoal-shadow-lg bg-surface-container w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <h1 className="font-headline text-3xl font-semibold text-primary">Kalvio</h1>
          <p className="font-body text-sm text-on-surface-variant mt-2">
            Sign in to save your attendance and GPA data.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-username"
              className="font-label text-[10px] text-on-surface-variant block mb-1"
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              className={inputClass}
              placeholder="test1"
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
              autoComplete="current-password"
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

          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-error text-on-error hand-drawn-border font-label text-xs charcoal-shadow hover:opacity-90 transition-opacity"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-outline-variant">
          <p className="font-label text-[10px] text-on-surface-variant mb-2">Test accounts</p>
          <ul className="space-y-1">
            {TEST_USERS.map((user) => (
              <li key={user.id} className="font-label text-[10px] text-on-surface-variant">
                <span className="text-on-surface">{user.username}</span>
                <span className="text-on-surface-variant/70"> / test123</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
