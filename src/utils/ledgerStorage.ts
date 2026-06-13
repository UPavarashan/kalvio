import type { LedgerSubject } from "../types/ledger";
import { createDefaultSem2Subjects, ensureSubjectSessions } from "./ledger";
import { scopedStorageKey } from "./userStorage";

const SEM2_ATTENDANCE_SUFFIX = "attendance_sem2";
const SEM2_DEFAULTS_FLAG_SUFFIX = "attendance_sem2_defaults_v1";
const ATTENDANCE_STORE_SUFFIX = "attendance_store_v1";

export const DEFAULT_ATTENDANCE_YEAR = "2023/24";

export interface AttendanceStore {
  years: string[];
  byYear: Record<string, LedgerSubject[]>;
  selectedYear?: string;
  selectedTerm?: 1 | 2;
}

function seedDefaultSubjects(userId: string): LedgerSubject[] {
  localStorage.setItem(scopedStorageKey(userId, SEM2_DEFAULTS_FLAG_SUFFIX), "1");
  return createDefaultSem2Subjects();
}

function loadLegacySem2Attendance(userId: string): LedgerSubject[] {
  try {
    const raw = localStorage.getItem(scopedStorageKey(userId, SEM2_ATTENDANCE_SUFFIX));

    if (raw === null) {
      return seedDefaultSubjects(userId);
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    if (
      parsed.length === 0 &&
      !localStorage.getItem(scopedStorageKey(userId, SEM2_DEFAULTS_FLAG_SUFFIX))
    ) {
      return seedDefaultSubjects(userId);
    }

    return parsed as LedgerSubject[];
  } catch {
    return [];
  }
}

export function loadAttendanceStore(userId: string): AttendanceStore {
  try {
    const raw = localStorage.getItem(scopedStorageKey(userId, ATTENDANCE_STORE_SUFFIX));
    if (raw) {
      const parsed = JSON.parse(raw) as AttendanceStore;
      if (Array.isArray(parsed.years) && parsed.years.length > 0 && parsed.byYear) {
        const byYear: Record<string, LedgerSubject[]> = {};
        for (const year of parsed.years) {
          const subjects = parsed.byYear[year];
          byYear[year] =
            Array.isArray(subjects) ? subjects.map(ensureSubjectSessions) : [];
        }
        return {
          years: [...parsed.years],
          byYear,
          selectedYear: parsed.selectedYear,
          selectedTerm: parsed.selectedTerm,
        };
      }
    }
  } catch {
    /* fall through to legacy migration */
  }

  const legacySubjects = loadLegacySem2Attendance(userId).map(ensureSubjectSessions);
  const migrated: AttendanceStore = {
    years: [DEFAULT_ATTENDANCE_YEAR],
    byYear: { [DEFAULT_ATTENDANCE_YEAR]: legacySubjects },
  };
  saveAttendanceStore(userId, migrated);
  return migrated;
}

export function saveAttendanceStore(userId: string, store: AttendanceStore): void {
  localStorage.setItem(
    scopedStorageKey(userId, ATTENDANCE_STORE_SUFFIX),
    JSON.stringify(store)
  );
}

export function saveAttendanceSelection(
  userId: string,
  academicYear: string,
  term: 1 | 2
): void {
  const store = loadAttendanceStore(userId);
  saveAttendanceStore(userId, {
    ...store,
    selectedYear: academicYear,
    selectedTerm: term,
  });
}

/** @deprecated Use loadAttendanceStore — kept for dashboard and other readers */
export function loadSem2Attendance(userId: string): LedgerSubject[] {
  const store = loadAttendanceStore(userId);
  const year = store.years.includes(DEFAULT_ATTENDANCE_YEAR)
    ? DEFAULT_ATTENDANCE_YEAR
    : store.years[0];
  return store.byYear[year] ?? [];
}

/** @deprecated Use saveAttendanceStore */
export function saveSem2Attendance(userId: string, entries: LedgerSubject[]): void {
  const store = loadAttendanceStore(userId);
  const year = store.years.includes(DEFAULT_ATTENDANCE_YEAR)
    ? DEFAULT_ATTENDANCE_YEAR
    : store.years[0] ?? DEFAULT_ATTENDANCE_YEAR;
  saveAttendanceStore(userId, {
    years: store.years.includes(year) ? store.years : [...store.years, year],
    byYear: { ...store.byYear, [year]: entries },
  });
}
