import { Link } from "react-router-dom";
import { navItems } from "../config/navItems";
import { TopNavLink } from "./AppNavLink";
import KalvioLogo from "./KalvioLogo";
import { useAuth } from "../context/AuthContext";

export default function TopNav() {
  const { user, logout } = useAuth();
  const userLabel = user?.name || user?.email || "";

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b border-outline-variant/30 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div
          className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-2 py-2 sm:min-h-14 sm:py-0"
        >
          <Link
            to="/"
            className="flex items-center gap-2 min-w-0 justify-self-start"
            title="Kalvio home"
          >
            <KalvioLogo size="sm" className="shrink-0" />
            <span className="font-headline text-lg font-semibold text-primary truncate">
              Kalvio
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-1.5 justify-end min-w-0 justify-self-end max-w-full">
            <div
              className="flex w-8 h-8 rounded-full bg-primary-container items-center justify-center text-on-primary-container border border-primary/30 shrink-0"
              title={userLabel}
            >
              <span className="material-symbols-outlined text-sm">person</span>
            </div>
            {user?.name ? (
              <span
                className="font-label text-[10px] sm:text-[11px] text-on-surface truncate max-w-[4.5rem] sm:max-w-[7rem] md:max-w-[10rem] min-w-0"
                title={user.name}
              >
                {user.name}
              </span>
            ) : null}
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="min-w-[2.75rem] min-h-[2.75rem] md:min-w-0 md:min-h-0 px-2.5 py-1.5 text-on-surface-variant rounded-lg hover:bg-surface-container-high transition-colors font-label text-[11px] flex items-center justify-center gap-1 shrink-0"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>

          <nav
            className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 flex items-center justify-center gap-0.5 sm:gap-1 w-full min-w-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <TopNavLink key={item.to} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
