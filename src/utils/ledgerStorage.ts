import type { LedgerSubject } from "../types/ledger";
import { createDefaultSem2Subjects } from "./ledger";

const SEM2_ATTENDANCE_KEY = "univo_attendance_sem2";
const SEM2_DEFAULTS_FLAG = "univo_attendance_sem2_defaults_v1";

function seedDefaultSubjects(): LedgerSubject[] {
  localStorage.setItem(SEM2_DEFAULTS_FLAG, "1");
  return createDefaultSem2Subjects();
}

export function loadSem2Attendance(): LedgerSubject[] {
  try {
    const raw = localStorage.getItem(SEM2_ATTENDANCE_KEY);

    if (raw === null) {
      return seedDefaultSubjects();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    if (parsed.length === 0 && !localStorage.getItem(SEM2_DEFAULTS_FLAG)) {
      return seedDefaultSubjects();
    }

    return parsed as LedgerSubject[];
  } catch {
    return [];
  }
}

export function saveSem2Attendance(entries: LedgerSubject[]): void {
  localStorage.setItem(SEM2_ATTENDANCE_KEY, JSON.stringify(entries));
}
