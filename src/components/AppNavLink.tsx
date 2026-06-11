import { NavLink } from "react-router-dom";
import type { NavItem } from "../config/navItems";

function sidebarLinkClass(isActive: boolean): string {
  return `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all font-label text-[11px] tracking-wide ${
    isActive
      ? "text-primary font-bold bg-primary-fixed border border-primary"
      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
  }`;
}

function bottomLinkClass(isActive: boolean): string {
  return `flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 px-1 py-1.5 rounded-lg transition-all font-label text-[9px] tracking-wide ${
    isActive
      ? "text-primary font-bold bg-primary-fixed border border-primary"
      : "text-on-surface-variant"
  }`;
}

export function SidebarNavLink({ item }: { item: NavItem }) {
  return (
    <NavLink to={item.to} end={item.to === "/"} className={({ isActive }) => sidebarLinkClass(isActive)}>
      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}

export function BottomNavLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) => bottomLinkClass(isActive)}
    >
      <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
      <span className="truncate max-w-full leading-tight text-center">
        {item.shortLabel ?? item.label}
      </span>
    </NavLink>
  );
}
