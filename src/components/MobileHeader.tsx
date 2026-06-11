import { useAuth } from "../context/AuthContext";

export default function MobileHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-40 border-b-2 border-primary bg-surface-container px-4 py-3 shadow-[0_4px_12px_-4px_rgba(51,75,70,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-headline text-lg font-semibold text-on-surface leading-tight">
            Kalvio
          </h1>
          <p className="font-label text-[10px] text-on-surface-variant tracking-wider mt-0.5 truncate">
            {user?.name ?? "Semester 5"}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="shrink-0 px-2 py-1 border border-outline text-on-surface-variant hand-drawn-border font-label text-[10px] hover:bg-surface-variant transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
