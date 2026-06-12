export interface NavItem {
  to: string;
  icon: string;
  label: string;
  shortLabel?: string;
}

export const navItems: NavItem[] = [
  { to: "/", icon: "dashboard", label: "Dashboard", shortLabel: "Home" },
  { to: "/ledger", icon: "menu_book", label: "Attendance", shortLabel: "Attend" },
  { to: "/gpa", icon: "grade", label: "GPA" },
  { to: "/past-papers", icon: "description", label: "Past Papers", shortLabel: "Papers" },
  { to: "/skill-roadmap", icon: "map", label: "Skill Roadmap", shortLabel: "Roadmap" },
];
