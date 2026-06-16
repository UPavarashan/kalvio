import type {
  AttendanceLogEntry,
  ClassSession,
  LedgerSubject,
  RecoveryOutlook,
  ScheduleSlot,
  SubjectStats,
} from "../types/ledger";
import { DAYS_OF_WEEK, sessionStatusToLogStatus, DEFAULT_PASS_PERCENTAGE, formatTimeShort, DEFAULT_SLOT_SESSION_COUNT } from "../types/ledger";

export function uid(): string {
  return crypto.randomUUID();
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function parseDisplayDate(dateStr: string): Date | null {
  const withYear = new Date(`${dateStr}, ${new Date().getFullYear()}`);
  if (!Number.isNaN(withYear.getTime())) return withYear;

  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatSessionDateTime(date: string, time: string): string {
  const parsed = parseDisplayDate(date);
  if (!parsed) return `${date} · ${formatTimeShort(time)}`;
  const weekday = parsed.toLocaleDateString("en-US", { weekday: "long" });
  return `${weekday} · ${date} · ${formatTimeShort(time)}`;
}

export function isWithinLastDays(dateStr: string, days: number): boolean {
  const sessionDate = parseDisplayDate(dateStr);
  if (!sessionDate) return false;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);

  sessionDate.setHours(12, 0, 0, 0);
  return sessionDate >= cutoff && sessionDate <= today;
}

export function getPassPercentage(subject: LedgerSubject): number {
  return subject.passPercentage ?? DEFAULT_PASS_PERCENTAGE;
}

export function getSlotSessionCount(slot: ScheduleSlot): number {
  const count = slot.sessionCount ?? DEFAULT_SLOT_SESSION_COUNT;
  return Math.max(1, Math.min(12, count));
}

function findScheduleSlot(subject: LedgerSubject, session: ClassSession): ScheduleSlot | undefined {
  if (session.scheduleSlotId) {
    const byId = subject.schedules.find((s) => s.id === session.scheduleSlotId);
    if (byId) return byId;
  }
  return subject.schedules.find((s) => s.time === session.time);
}

export function getSessionWeight(session: ClassSession, subject: LedgerSubject): number {
  const slot = findScheduleSlot(subject, session);
  return slot ? getSlotSessionCount(slot) : 1;
}

export function subjectUsesWeightedCounts(subject: LedgerSubject): boolean {
  return subject.schedules.some((slot) => getSlotSessionCount(slot) !== 1);
}

export function getAttendanceCountLabel(subject: LedgerSubject): string {
  return subjectUsesWeightedCounts(subject) ? "sessions" : "classes";
}

function rawSessionCount(
  sessions: ClassSession[],
  statuses: ClassSession["status"][]
): number {
  return sessions.filter((s) => statuses.includes(s.status)).length;
}

function weightedSessionCount(
  sessions: ClassSession[],
  subject: LedgerSubject,
  statuses: ClassSession["status"][]
): number {
  return sessions
    .filter((s) => statuses.includes(s.status))
    .reduce((sum, s) => sum + getSessionWeight(s, subject), 0);
}

export function resolveSessionDate(
  session: ClassSession,
  subject: LedgerSubject
): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(session.date)) {
    return parseInputDate(session.date);
  }

  const parsed = parseDisplayDate(session.date);
  if (!parsed) return null;

  const month = parsed.getMonth();
  const day = parsed.getDate();
  const from = parseInputDate(subject.recurringFrom);
  const until = parseInputDate(subject.recurringUntil);

  if (from && until) {
    const fromYear = from.getFullYear();
    const untilYear = until.getFullYear();
    const candidates: Date[] = [];
    for (let year = fromYear; year <= untilYear; year++) {
      candidates.push(new Date(year, month, day, 12, 0, 0, 0));
    }
    const inRange = candidates.find((candidate) => candidate >= from && candidate <= until);
    if (inRange) return inRange;
    return candidates[0] ?? null;
  }

  parsed.setHours(12, 0, 0, 0);
  return parsed;
}

export interface CalendarSession {
  subject: LedgerSubject;
  session: ClassSession;
  date: Date;
}

export function getCalendarSessions(subjects: LedgerSubject[]): CalendarSession[] {
  const items: CalendarSession[] = [];

  for (const subject of subjects) {
    for (const session of subject.sessions) {
      const date = resolveSessionDate(session, subject);
      if (date) items.push({ subject, session, date });
    }
  }

  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function buildMonthCalendarCells(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = first.getDay();
  const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const day = index - startPad + 1;
    return new Date(year, month, day, 12, 0, 0, 0);
  });
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function calendarDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function parseInputDate(value: string): Date | null {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3) return null;
  const [y, m, d] = parts;
  if (!y || !m || !d) return null;
  const parsed = new Date(y, m - 1, d);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDefaultRecurringRange(): { from: string; until: string } {
  const from = new Date();
  const until = new Date(from);
  until.setMonth(until.getMonth() + 4);
  return { from: toInputDate(from), until: toInputDate(until) };
}

export function resolveRecurringDates(
  from: string,
  until: string
): { from: string; until: string } {
  const defaults = getDefaultRecurringRange();
  return {
    from: from || defaults.from,
    until: until || defaults.until,
  };
}

export function isSubjectStarted(subject: LedgerSubject, asOf = new Date()): boolean {
  const start = getSubjectTermStart(subject);
  if (!start) return true;

  const check = new Date(asOf);
  check.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return check >= start;
}

export function getSubjectTermStart(subject: LedgerSubject): Date | null {
  if (!subject.recurringWeekly) return null;
  const { from } = resolveRecurringDates(subject.recurringFrom, subject.recurringUntil);
  return parseInputDate(from);
}

export function getSubjectTermEnd(subject: LedgerSubject): Date | null {
  if (!subject.recurringWeekly) return null;
  const { until } = resolveRecurringDates(subject.recurringFrom, subject.recurringUntil);
  return parseInputDate(until);
}

export function isSessionWithinSubjectTerm(
  session: ClassSession,
  subject: LedgerSubject
): boolean {
  if (!subject.recurringWeekly) return true;

  const sessionDate = resolveSessionDate(session, subject);
  if (!sessionDate) return false;

  const start = getSubjectTermStart(subject);
  const end = getSubjectTermEnd(subject);
  if (!start || !end) return true;

  const normalized = new Date(sessionDate);
  normalized.setHours(12, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return normalized >= start && normalized <= end;
}

export function pruneSessionsToSubjectTerm(
  subject: LedgerSubject,
  sessions: ClassSession[]
): ClassSession[] {
  return sessions.filter((session) => isSessionWithinSubjectTerm(session, subject));
}

export function getTodayDayOfWeek(): string {
  return DAYS_OF_WEEK[new Date().getDay()];
}

export function generateRecurringSessions(
  schedules: ScheduleSlot[],
  from: string,
  until: string
): ClassSession[] {
  const start = parseInputDate(from);
  const end = parseInputDate(until);
  if (!start || !end || start > end) return [];

  const sessions: ClassSession[] = [];
  const current = new Date(start);

  while (current <= end) {
    for (const slot of schedules) {
      const dayIndex = DAYS_OF_WEEK.indexOf(slot.dayOfWeek as (typeof DAYS_OF_WEEK)[number]);
      if (dayIndex === -1) continue;
      if (current.getDay() === dayIndex) {
        sessions.push({
          id: uid(),
          date: formatDisplayDate(current),
          time: slot.time,
          status: "scheduled",
          scheduleSlotId: slot.id,
        });
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return sessions;
}

export function computeSubjectStats(subject: LedgerSubject): SubjectStats {
  const active = subject.sessions.filter((s) => s.status !== "cancelled");
  const present = rawSessionCount(subject.sessions, ["present"]);
  const absent = rawSessionCount(subject.sessions, ["absent"]);
  const excused = rawSessionCount(subject.sessions, ["excused"]);
  const scheduled = rawSessionCount(subject.sessions, ["scheduled"]);
  const cancelled = rawSessionCount(subject.sessions, ["cancelled"]);
  const attendedWeighted = weightedSessionCount(subject.sessions, subject, ["present", "excused"]);
  const completedWeighted = weightedSessionCount(subject.sessions, subject, [
    "present",
    "absent",
    "excused",
  ]);
  const percentage =
    completedWeighted > 0 ? Math.round((attendedWeighted / completedWeighted) * 100) : 0;
  const total = active.reduce((sum, s) => sum + getSessionWeight(s, subject), 0);

  return {
    present,
    absent,
    excused,
    cancelled,
    scheduled,
    total,
    percentage,
  };
}

export function computeRecoveryOutlook(
  subject: LedgerSubject,
  stats: SubjectStats = computeSubjectStats(subject)
): RecoveryOutlook | null {
  const passPct = getPassPercentage(subject);
  if (stats.percentage >= passPct) return null;

  const attended = weightedSessionCount(subject.sessions, subject, ["present", "excused"]);
  const completed = weightedSessionCount(subject.sessions, subject, [
    "present",
    "absent",
    "excused",
  ]);
  const remaining = weightedSessionCount(subject.sessions, subject, ["scheduled"]);

  if (remaining === 0) {
    const unit = getAttendanceCountLabel(subject);
    return {
      canRecover: false,
      maxPossiblePercentage: stats.percentage,
      remainingScheduled: 0,
      minAttendanceNeeded: 0,
      message: `Cannot reach ${passPct}% — no ${unit} left to recover`,
    };
  }

  const maxAttended = attended + remaining;
  const maxTotal = completed + remaining;
  const maxPossiblePercentage = Math.round((maxAttended / maxTotal) * 100);
  const canRecover = maxPossiblePercentage >= passPct;

  const minAttendanceNeeded = Math.max(
    0,
    Math.min(
      remaining,
      Math.ceil((passPct / 100) * maxTotal - attended)
    )
  );

  let message: string;
  const unit = getAttendanceCountLabel(subject);
  const unitSingular = unit === "sessions" ? "session" : "class";
  if (canRecover) {
    if (minAttendanceNeeded >= remaining) {
      message = `Can reach ${passPct}% — attend all ${remaining} remaining ${remaining === 1 ? unitSingular : unit}`;
    } else {
      message = `Can reach ${passPct}% — attend at least ${minAttendanceNeeded} ${minAttendanceNeeded === 1 ? unitSingular : unit} of ${remaining} remaining`;
    }
  } else {
    message = `Cannot reach ${passPct}% — best possible is ${maxPossiblePercentage}% (${remaining} ${remaining === 1 ? unitSingular : unit} left)`;
  }

  return {
    canRecover,
    maxPossiblePercentage,
    remainingScheduled: remaining,
    minAttendanceNeeded,
    message,
  };
}

export function computeLast7DaysPct(subjects: LedgerSubject[]): number {
  let present = 0;
  let absent = 0;
  let excused = 0;

  for (const subject of subjects) {
    for (const session of subject.sessions) {
      if (session.status === "cancelled" || session.status === "scheduled") continue;
      if (!isWithinLastDays(session.date, 7)) continue;

      const weight = getSessionWeight(session, subject);
      if (session.status === "present") present += weight;
      else if (session.status === "absent") absent += weight;
      else if (session.status === "excused") excused += weight;
    }
  }

  const completed = present + absent + excused;
  if (completed === 0) return 0;
  return Math.round(((present + excused) / completed) * 100);
}

export function computeOverallStats(subjects: LedgerSubject[]) {
  let presentWeighted = 0;
  let absentWeighted = 0;
  let excusedWeighted = 0;

  for (const subject of subjects) {
    presentWeighted += weightedSessionCount(subject.sessions, subject, ["present"]);
    absentWeighted += weightedSessionCount(subject.sessions, subject, ["absent"]);
    excusedWeighted += weightedSessionCount(subject.sessions, subject, ["excused"]);
  }

  const completedWeighted = presentWeighted + absentWeighted + excusedWeighted;
  const attendedWeighted = presentWeighted + excusedWeighted;
  const overallAverage =
    completedWeighted > 0 ? Math.round((attendedWeighted / completedWeighted) * 100) : 0;

  const totalSessions = subjects.reduce((sum, subject) => {
    return sum + subject.sessions
      .filter((s) => s.status !== "cancelled")
      .reduce((slotSum, session) => slotSum + getSessionWeight(session, subject), 0);
  }, 0);

  return {
    present: presentWeighted,
    absent: absentWeighted,
    excused: excusedWeighted,
    totalSessions,
    overallAverage,
    last7DaysPct: computeLast7DaysPct(subjects),
  };
}

export function getTodayDisplayDate(): string {
  return formatDisplayDate(new Date());
}

export function getEditablePastSessions(subject: LedgerSubject): ClassSession[] {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return [...subject.sessions]
    .filter((session) => {
      if (!isSessionWithinSubjectTerm(session, subject)) return false;
      const date = resolveSessionDate(session, subject);
      return date !== null && date <= endOfToday;
    })
    .sort((a, b) => {
      const dateA = resolveSessionDate(a, subject)!;
      const dateB = resolveSessionDate(b, subject)!;
      const byDate = dateB.getTime() - dateA.getTime();
      if (byDate !== 0) return byDate;
      return b.time.localeCompare(a.time);
    });
}

export function isSessionToday(sessionDate: string): boolean {
  return sessionDate === getTodayDisplayDate();
}

export function getPendingSessionsForToday(subjects: LedgerSubject[]) {
  const today = getTodayDisplayDate();
  return subjects
    .filter((subject) => isSubjectStarted(subject))
    .flatMap((subject) =>
      subject.sessions
        .filter(
          (s) =>
            s.status === "scheduled" &&
            s.date === today &&
            isSessionWithinSubjectTerm(s, subject)
        )
        .map((session) => ({ subject, session }))
    )
    .sort((a, b) => {
      const timeCmp = a.session.time.localeCompare(b.session.time);
      if (timeCmp !== 0) return timeCmp;
      return a.subject.name.localeCompare(b.subject.name);
    });
}

export function getPendingSessions(subjects: LedgerSubject[]) {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return subjects
    .filter((subject) => isSubjectStarted(subject))
    .flatMap((subject) =>
      subject.sessions
        .filter((session) => {
          if (session.status !== "scheduled") return false;
          if (!isSessionWithinSubjectTerm(session, subject)) return false;
          const date = resolveSessionDate(session, subject);
          return date !== null && date <= endOfToday;
        })
        .map((session) => ({ subject, session }))
    )
    .sort((a, b) => {
      const dateA = resolveSessionDate(a.session, a.subject)!;
      const dateB = resolveSessionDate(b.session, b.subject)!;
      const byDate = dateA.getTime() - dateB.getTime();
      if (byDate !== 0) return byDate;
      const timeCmp = a.session.time.localeCompare(b.session.time);
      if (timeCmp !== 0) return timeCmp;
      return a.subject.name.localeCompare(b.subject.name);
    });
}

export function getSessionDateTime(
  session: ClassSession,
  subject: LedgerSubject
): Date | null {
  const date = resolveSessionDate(session, subject);
  if (!date) return null;

  const [hours, minutes] = session.time.split(":").map(Number);
  const sessionAt = new Date(date);
  sessionAt.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return sessionAt;
}

export function getUpcomingSessions(subjects: LedgerSubject[], limit = 3) {
  const now = new Date();

  return subjects
    .filter((subject) => isSubjectStarted(subject))
    .flatMap((subject) =>
      subject.sessions
        .filter((session) => {
          if (session.status !== "scheduled") return false;
          if (!isSessionWithinSubjectTerm(session, subject)) return false;
          const sessionAt = getSessionDateTime(session, subject);
          return sessionAt !== null && sessionAt > now;
        })
        .map((session) => ({
          subject,
          session,
          at: getSessionDateTime(session, subject)!,
        }))
    )
    .sort((a, b) => {
      const byTime = a.at.getTime() - b.at.getTime();
      if (byTime !== 0) return byTime;
      return a.subject.name.localeCompare(b.subject.name);
    })
    .slice(0, limit);
}

export function appendTodayScheduledSessions(subject: LedgerSubject): LedgerSubject {
  if (subject.schedules.length === 0 || !isSubjectStarted(subject)) return subject;

  const termEnd = getSubjectTermEnd(subject);
  if (termEnd) {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    termEnd.setHours(23, 59, 59, 999);
    if (today > termEnd) return subject;
  }

  const todayDisplay = getTodayDisplayDate();
  const todayDay = getTodayDayOfWeek();
  const newSessions: ClassSession[] = [];

  for (const slot of subject.schedules) {
    if (slot.dayOfWeek !== todayDay) continue;

    const exists = subject.sessions.some(
      (s) =>
        s.date === todayDisplay &&
        s.time === slot.time &&
        (s.scheduleSlotId === slot.id || !s.scheduleSlotId)
    );

    if (!exists) {
      newSessions.push({
        id: uid(),
        date: todayDisplay,
        time: slot.time,
        status: "scheduled",
        scheduleSlotId: slot.id,
      });
    }
  }

  if (newSessions.length === 0) return subject;
  return { ...subject, sessions: [...subject.sessions, ...newSessions] };
}

export function seedTodaySessions(subjects: LedgerSubject[]): LedgerSubject[] {
  return subjects.map(appendTodayScheduledSessions);
}

function normalizeScheduleSlot(slot: ScheduleSlot): ScheduleSlot {
  return {
    ...slot,
    sessionCount: getSlotSessionCount(slot),
  };
}

function migrateLegacySubject(subject: LedgerSubject): LedgerSubject {
  const legacy = subject as LedgerSubject & {
    attendanceCountMode?: "per_class" | "per_hour";
    hoursPerSession?: number;
  };

  let schedules = subject.schedules.map(normalizeScheduleSlot);

  if (legacy.attendanceCountMode === "per_hour" && legacy.hoursPerSession) {
    const legacyCount = Math.max(1, Math.min(12, legacy.hoursPerSession));
    schedules = schedules.map((slot) => ({
      ...slot,
      sessionCount: slot.sessionCount ?? legacyCount,
    }));
  }

  const { attendanceCountMode: _mode, hoursPerSession: _hours, ...rest } = legacy;
  return { ...rest, schedules };
}

export function ensureSubjectSessions(subject: LedgerSubject): LedgerSubject {
  const migrated = migrateLegacySubject(subject);
  const normalizedSchedules = migrated.schedules.map(normalizeScheduleSlot);
  const { from, until } = resolveRecurringDates(
    migrated.recurringFrom,
    migrated.recurringUntil
  );
  const normalized = {
    ...migrated,
    schedules: normalizedSchedules,
    recurringFrom: from,
    recurringUntil: until,
  };

  const generated =
    normalized.recurringWeekly && normalized.schedules.length > 0
      ? generateRecurringSessions(normalized.schedules, from, until)
      : [];

  const merged = mergeSessions(normalized.sessions, generated);
  const bounded = pruneSessionsToSubjectTerm(normalized, merged);
  return appendTodayScheduledSessions({ ...normalized, sessions: bounded });
}

export function buildLogFromSubjects(subjects: LedgerSubject[]): AttendanceLogEntry[] {
  const entries: AttendanceLogEntry[] = [];

  for (const subject of subjects) {
    for (const session of subject.sessions) {
      const logStatus = sessionStatusToLogStatus(session.status);
      if (logStatus) {
        entries.push({
          id: `${subject.id}-${session.id}`,
          date: session.date,
          subject: subject.name,
          subjectId: subject.id,
          time: session.time,
          status: logStatus,
        });
      }
    }
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function mergeSessions(
  existing: ClassSession[],
  generated: ClassSession[]
): ClassSession[] {
  const keyed = new Map(existing.map((s) => [`${s.date}-${s.time}`, s]));
  for (const session of generated) {
    const key = `${session.date}-${session.time}`;
    if (!keyed.has(key)) keyed.set(key, session);
  }
  return Array.from(keyed.values());
}

export function createSampleLedgerSubjects(): LedgerSubject[] {
  return [];
}

export function createDefaultSem2Subjects(): LedgerSubject[] {
  const { from, until } = getDefaultRecurringRange();

  const templates = [
    {
      id: "csc102",
      name: "CSC102 — Computer Programming I — Dr. Mrs. B. Mayurathan",
      icon: "code",
    },
    {
      id: "csc106",
      name: "CSC106 — Human Computer Interaction — Mrs. N. Kesavi",
      icon: "touch_app",
    },
    {
      id: "csc108",
      name: "CSC108 — Design of Algorithms — Prof. M. Siyamalan",
      icon: "hub",
    },
    {
      id: "csc109",
      name: "CSC109 — Computer Security & Cryptography — Dr. K. Sarveswaran",
      icon: "terminal",
      recurringFrom: "2026-07-06",
      recurringUntil: "2026-12-31",
    },
    {
      id: "csc111",
      name: "CSC111 — Mathematics for Computing II — Dr. R. Pirasanthan",
      icon: "functions",
    },
    {
      id: "csc112",
      name: "CSC112 — Statistics for Computing II — Mrs. N. Kesavi",
      icon: "science",
    },
  ] as const;

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    icon: template.icon,
    recurringWeekly: true,
    recurringFrom: "recurringFrom" in template ? template.recurringFrom : from,
    recurringUntil: "recurringUntil" in template ? template.recurringUntil : until,
    schedules: [],
    sessions: [],
    passPercentage: DEFAULT_PASS_PERCENTAGE,
  }));
}

export function legacySubjectsToLedger(
  subjects: { id: string; name: string; icon: string; present: number; absent: number }[]
): LedgerSubject[] {
  return subjects.map((s) => {
    const slotId = uid();
    const sessions: ClassSession[] = [];
    for (let i = 0; i < s.present; i++) {
      sessions.push({
        id: uid(),
        date: `Oct ${10 + i}`,
        time: "10:00",
        status: "present",
        scheduleSlotId: slotId,
      });
    }
    for (let i = 0; i < s.absent; i++) {
      sessions.push({
        id: uid(),
        date: `Oct ${5 + i}`,
        time: "10:00",
        status: "absent",
        scheduleSlotId: slotId,
      });
    }
    return {
      id: s.id,
      name: s.name,
      icon: s.icon,
      recurringWeekly: true,
      recurringFrom: "2023-10-01",
      recurringUntil: "2023-12-15",
      schedules: [{ id: slotId, dayOfWeek: "Monday", time: "10:00" }],
      sessions,
      passPercentage: DEFAULT_PASS_PERCENTAGE,
    };
  });
}

export function createDefaultSlot(): ScheduleSlot {
  return {
    id: uid(),
    dayOfWeek: "Monday",
    time: "09:00",
    sessionCount: DEFAULT_SLOT_SESSION_COUNT,
  };
}

export function buildSubjectFromForm(
  draft: {
    id?: string;
    name: string;
    icon: string;
    recurringWeekly: boolean;
    recurringFrom: string;
    recurringUntil: string;
    schedules: ScheduleSlot[];
    sessions: ClassSession[];
    passPercentage?: number;
  },
  _mode: "add" | "edit"
): LedgerSubject {
  return ensureSubjectSessions({
    id: draft.id ?? uid(),
    name: draft.name.trim(),
    icon: draft.icon,
    recurringWeekly: draft.recurringWeekly,
    recurringFrom: draft.recurringFrom,
    recurringUntil: draft.recurringUntil,
    schedules: draft.schedules.map(normalizeScheduleSlot),
    sessions: draft.sessions,
    passPercentage: draft.passPercentage ?? DEFAULT_PASS_PERCENTAGE,
  });
}
