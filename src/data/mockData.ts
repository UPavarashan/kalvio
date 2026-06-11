export interface Module {
  id: string;
  name: string;
  credits: number;
  grade: string;
  icon: string;
  iconBg: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagStyle: string;
  date: string;
  highlight?: boolean;
}

export interface SubjectAttendance {
  id: string;
  name: string;
  icon: string;
  percentage: number;
  present: number;
  absent: number;
}

export interface AttendanceLogEntry {
  date: string;
  subject: string;
  status: "P" | "A";
}

export interface CalendarDay {
  day: number;
  status: "present" | "absent" | "current" | null;
}

export interface LedgerSemester {
  id: string;
  academicYear: string;
  term: 1 | 2;
  label: string;
  isPast: boolean;
  totalSessions: number;
  last7DaysPct: number;
  overallAverage: number;
  calendarMonth: string;
  subjects: SubjectAttendance[];
  log: AttendanceLogEntry[];
  calendarDays: CalendarDay[];
}

export interface GPASemester {
  id: string;
  label: string;
  term: string;
  academicYear: string;
  season: "Fall" | "Spring";
  projected?: boolean;
}

export interface DashboardWeeklyCourse {
  name: string;
  present: number;
  total: number;
}

export interface GPABadge {
  label: string;
  className: string;
}

export interface Scholarship {
  id: string;
  title: string;
  amount: string;
  note: string;
  eligible?: boolean;
  muted?: boolean;
}

export interface PastPaper {
  id: string;
  title: string;
  course: string;
  year: string;
  downloads: number;
}

export interface SkillRoadmapItem {
  id: string;
  title: string;
  progress: number;
  skills: string[];
  status: string;
}

export const ACADEMIC_YEARS = ["2023/24"];

export const LEDGER_SEMESTERS: LedgerSemester[] = [
  {
    id: "2023-24-t1",
    academicYear: "2023/24",
    term: 1,
    label: "2023/24 — Term 1",
    isPast: true,
    totalSessions: 0,
    last7DaysPct: 0,
    overallAverage: 0,
    calendarMonth: "",
    subjects: [],
    log: [],
    calendarDays: [],
  },
];

export const SEMESTER_HISTORY: { semester: string; gpa: number }[] = [];

export const GPA_TREND: { label: string; gpa: number; projected?: boolean }[] = [];

export const DEFAULT_MODULES: Module[] = [];

export const GPA_SEMESTERS: GPASemester[] = [
  {
    id: "2023-24-fall",
    label: "Sem 1",
    term: "Fall 2023",
    academicYear: "2023-24",
    season: "Fall",
    projected: true,
  },
  {
    id: "2023-24-spring",
    label: "Sem 2",
    term: "Spring 2024",
    academicYear: "2023-24",
    season: "Spring",
  },
];

export const DEFAULT_MODULES_BY_SEMESTER: Record<string, Module[]> = {
  "2023-24-fall": [],
  "2023-24-spring": [],
};

export const UPCOMING_TASKS: Task[] = [];

export const SUBJECTS: SubjectAttendance[] = [];

export const ATTENDANCE_LOG: AttendanceLogEntry[] = [];

export const STUDY_MATERIALS: { name: string; size: string; icon: string }[] = [];

export const PAST_PAPER_FILTERS = ["All Courses"];

export const PAST_PAPERS: PastPaper[] = [];

export const SKILL_ROADMAP: SkillRoadmapItem[] = [];

export const DASHBOARD_WEEKLY_COURSES: DashboardWeeklyCourse[] = [];

export const GPA_BADGES: GPABadge[] = [];

export const SCHOLARSHIPS: Scholarship[] = [];
