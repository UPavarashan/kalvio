import type { LedgerSemester } from "../data/mockData";
import type { LedgerSubject } from "../types/ledger";
import { ensureSubjectSessions, legacySubjectsToLedger } from "./ledger";
import {
  getDefaultAttendanceYear,
  type AttendanceStore,
} from "./ledgerStorage";

export interface AttendanceSelection {
  academicYear: string;
  term: 1 | 2;
  subjects: LedgerSubject[];
}

export function getAttendanceSelection(
  store: AttendanceStore,
  semesters: LedgerSemester[]
): AttendanceSelection {
  const academicYear =
    store.selectedYear && store.years.includes(store.selectedYear)
      ? store.selectedYear
      : store.years[0] ?? getDefaultAttendanceYear();
  const term: 1 | 2 = store.selectedTerm === 1 ? 1 : 2;

  if (term === 1) {
    const sem = semesters.find(
      (entry) => entry.academicYear === academicYear && entry.term === 1
    );
    if (sem) {
      return {
        academicYear,
        term,
        subjects: legacySubjectsToLedger(sem.subjects).map(ensureSubjectSessions),
      };
    }
    return { academicYear, term, subjects: [] };
  }

  return {
    academicYear,
    term,
    subjects: (store.byYear[academicYear] ?? []).map(ensureSubjectSessions),
  };
}

export function formatAttendanceSelectionLabel(
  academicYear: string,
  term: 1 | 2
): string {
  return `${academicYear} · Sem ${term}`;
}
