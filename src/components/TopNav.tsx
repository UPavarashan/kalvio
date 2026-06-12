import { Link } from "react-router-dom";
import { navItems } from "../config/navItems";
import { TopNavLink } from "./AppNavLink";
import KalvioLogo from "./KalvioLogo";
import { useAuth } from "../context/AuthContext";

export default function TopNav() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-sm border-b border-outline-variant/30 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="relative flex flex-col gap-2 py-2 sm:min-h-14 sm:justify-center sm:py-0">
          <div className="flex items-center justify-between sm:absolute sm:inset-y-0 sm:left-0 sm:right-0 sm:pointer-events-none">
            <Link
              to="/"
              className="relative z-10 flex items-center gap-2 min-w-0 pointer-events-auto sm:flex-1"
              title="Kalvio home"
            >
              <KalvioLogo size="sm" />
              <span className="font-headline text-lg font-semibold text-primary truncate">
                Kalvio
              </span>
            </Link>

            <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 shrink-0 pointer-events-auto sm:flex-1 sm:justify-end">
              <div
                className="hidden md:flex w-8 h-8 rounded-full bg-primary-container items-center justify-center text-on-primary-container border border-primary/30"
                title={user?.name}
              >
                <span className="material-symbols-outlined text-sm">person</span>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="min-w-[2.75rem] min-h-[2.75rem] sm:min-w-0 sm:min-h-0 px-2.5 py-1.5 text-on-surface-variant rounded-lg hover:bg-surface-container-high transition-colors font-label text-[10px] sm:text-[11px] flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>

          <nav
            className="relative z-20 flex items-center justify-center gap-0.5 sm:gap-1 w-full sm:absolute sm:left-1/2 sm:top-1/2 sm:w-auto sm:-translate-x-1/2 sm:-translate-y-1/2 max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pointer-events-auto"
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
