export interface ScheduleSlot {
  id: string;
  dayOfWeek: string;
  time: string;
  /** How many sessions this class time counts as (e.g. 4 for a 4-hour block at some universities) */
  sessionCount?: number;
}

export interface ClassSession {
  id: string;
  date: string;
  time: string;
  status: "scheduled" | "present" | "absent" | "cancelled" | "excused";
  scheduleSlotId?: string;
}

export interface LedgerSubject {
  id: string;
  name: string;
  icon: string;
  recurringWeekly: boolean;
  recurringFrom: string;
  recurringUntil: string;
  schedules: ScheduleSlot[];
  sessions: ClassSession[];
  passPercentage?: number;
}

export const DEFAULT_SLOT_SESSION_COUNT = 1;

export const DEFAULT_PASS_PERCENTAGE = 80;

export interface AttendanceLogEntry {
  id: string;
  date: string;
  subject: string;
  subjectId?: string;
  time?: string;
  status: "P" | "A" | "E" | "C";
}

export interface SubjectStats {
  present: number;
  absent: number;
  excused: number;
  cancelled: number;
  scheduled: number;
  total: number;
  percentage: number;
}

export interface RecoveryOutlook {
  canRecover: boolean;
  maxPossiblePercentage: number;
  remainingScheduled: number;
  minAttendanceNeeded: number;
  message: string;
}

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export { SUBJECT_ICONS } from "../utils/courseIcons";

export type LogStatus = AttendanceLogEntry["status"];

const DAY_SHORT: Record<string, string> = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

const DAY_LETTER: Record<string, string> = {
  Sunday: "Su",
  Monday: "M",
  Tuesday: "Tu",
  Wednesday: "W",
  Thursday: "Th",
  Friday: "F",
  Saturday: "Sa",
};

export function dayLabel(day: string): string {
  return DAY_SHORT[day] ?? day;
}

export function sessionStatusToLogStatus(
  status: ClassSession["status"]
): LogStatus | null {
  switch (status) {
    case "present":
      return "P";
    case "absent":
      return "A";
    case "excused":
      return "E";
    case "cancelled":
      return "C";
    default:
      return null;
  }
}

export function formatScheduleSummary(schedules: ScheduleSlot[]): string {
  if (schedules.length === 0) return "No schedule";
  return schedules
    .map((s) => `${DAY_SHORT[s.dayOfWeek] ?? s.dayOfWeek.slice(0, 3)} ${s.time}`)
    .join(", ");
}

export function formatTimeShort(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  return Number.isNaN(hour) ? time : `${hour}:${m ?? "00"}`;
}

export function groupSchedulesByTime(
  schedules: ScheduleSlot[]
): { time: string; days: string[] }[] {
  const map = new Map<string, string[]>();
  for (const slot of schedules) {
    const letter = DAY_LETTER[slot.dayOfWeek] ?? slot.dayOfWeek.slice(0, 2);
    const days = map.get(slot.time) ?? [];
    days.push(letter);
    map.set(slot.time, days);
  }
  return Array.from(map.entries()).map(([time, days]) => ({ time, days }));
}
