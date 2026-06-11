import { navItems } from "../config/navItems";
import { BottomNavLink } from "./AppNavLink";

export default function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t-2 border-primary bg-surface-container shadow-[0_-4px_12px_-4px_rgba(51,75,70,0.15)]"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around gap-0.5 px-1 pt-1">
        {navItems.map((item) => (
          <BottomNavLink key={item.to} item={item} />
        ))}
      </div>
    </nav>
  );
}
