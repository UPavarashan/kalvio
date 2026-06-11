import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", icon: "dashboard", label: "Dashboard" },
  { to: "/ledger", icon: "menu_book", label: "Ledger" },
  { to: "/gpa", icon: "grade", label: "GPA" },
  { to: "/past-papers", icon: "description", label: "Past Papers" },
  { to: "/skill-roadmap", icon: "map", label: "Skill Roadmap" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col h-screen w-52 fixed left-0 top-0 border-r-2 border-primary bg-surface-container p-3 gap-1.5 shadow-[8px_0px_12px_-4px_rgba(51,75,70,0.15)] z-50">
      <div className="mb-6 px-1">
        <h1 className="font-headline text-xl font-semibold text-on-surface leading-tight">
          Kalvio
        </h1>
        <p className="font-label text-[10px] text-on-surface-variant tracking-wider mt-0.5">
          Semester 5
        </p>
      </div>

      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all font-label text-[11px] tracking-wide ${
                isActive
                  ? "text-primary font-bold bg-primary-fixed border border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-2 border-t border-outline-variant flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container border-2 border-primary overflow-hidden shrink-0">
          <span className="material-symbols-outlined text-sm">person</span>
        </div>
        <div className="min-w-0">
          <p className="font-label text-[11px] text-on-surface truncate">Alex Mercer</p>
          <p className="text-[9px] text-on-surface-variant truncate">Computer Science</p>
        </div>
      </div>
    </aside>
  );
}
