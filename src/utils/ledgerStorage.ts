import type { LedgerSubject } from "../types/ledger";
import { createDefaultSem2Subjects } from "./ledger";
import { scopedStorageKey } from "./userStorage";

const SEM2_ATTENDANCE_SUFFIX = "attendance_sem2";
const SEM2_DEFAULTS_FLAG_SUFFIX = "attendance_sem2_defaults_v1";

function seedDefaultSubjects(userId: string): LedgerSubject[] {
  localStorage.setItem(scopedStorageKey(userId, SEM2_DEFAULTS_FLAG_SUFFIX), "1");
  return createDefaultSem2Subjects();
}

export function loadSem2Attendance(userId: string): LedgerSubject[] {
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

export function saveSem2Attendance(userId: string, entries: LedgerSubject[]): void {
  localStorage.setItem(
    scopedStorageKey(userId, SEM2_ATTENDANCE_SUFFIX),
    JSON.stringify(entries)
  );
}
