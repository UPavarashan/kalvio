import { NavLink } from "react-router-dom";
import type { NavItem } from "../config/navItems";

function topNavLinkClass(isActive: boolean): string {
  return `flex items-center justify-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-lg transition-all font-label text-[10px] sm:text-[11px] tracking-wide whitespace-nowrap shrink-0 min-w-[2.75rem] min-h-[2.75rem] sm:min-w-0 sm:min-h-0 ${
    isActive
      ? "text-primary bg-primary-fixed/80 font-bold"
      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
  }`;
}

export function TopNavLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      title={item.label}
      className={({ isActive }) => topNavLinkClass(isActive)}
    >
      <span className="material-symbols-outlined text-[20px] sm:text-[18px]">{item.icon}</span>
      <span className="hidden sm:inline">{item.shortLabel ?? item.label}</span>
    </NavLink>
  );
}
