import type { LedgerSubject } from "../types/ledger";
import { createDefaultSem2Subjects, ensureSubjectSessions } from "./ledger";
import { requireSupabase } from "./supabaseClient";

export const DEFAULT_ATTENDANCE_YEAR = "2023/24";

export interface AttendanceStore {
  years: string[];
  byYear: Record<string, LedgerSubject[]>;
  selectedYear?: string;
  selectedTerm?: 1 | 2;
}


function defaultStore(): AttendanceStore {
  const subjects = createDefaultSem2Subjects().map(ensureSubjectSessions);
  return {
    years: [DEFAULT_ATTENDANCE_YEAR],
    byYear: { [DEFAULT_ATTENDANCE_YEAR]: subjects },
  };
}

function normalizeStore(raw: AttendanceStore): AttendanceStore {
  if (!Array.isArray(raw.years) || raw.years.length === 0 || !raw.byYear) {
    return defaultStore();
  }

  const byYear: Record<string, LedgerSubject[]> = {};
  for (const year of raw.years) {
    const subjects = raw.byYear[year];
    byYear[year] = Array.isArray(subjects) ? subjects.map(ensureSubjectSessions) : [];
  }

  return {
    years: [...raw.years],
    byYear,
    selectedYear: raw.selectedYear,
    selectedTerm: raw.selectedTerm,
  };
}

export async function loadAttendanceStore(userId: string): Promise<AttendanceStore> {
  const { data, error } = await requireSupabase()
    .from("user_attendance")
    .select("store")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (data?.store) {
    const store = normalizeStore(data.store as AttendanceStore);
    if (store.years.length > 0) return store;
  }

  const seeded = defaultStore();
  await saveAttendanceStore(userId, seeded);
  return seeded;
}

export async function saveAttendanceStore(
  userId: string,
  store: AttendanceStore
): Promise<void> {
  const { error } = await requireSupabase().from("user_attendance").upsert(
    {
      user_id: userId,
      store,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
}

export async function saveAttendanceSelection(
  userId: string,
  academicYear: string,
  term: 1 | 2
): Promise<void> {
  const store = await loadAttendanceStore(userId);
  await saveAttendanceStore(userId, {
    ...store,
    selectedYear: academicYear,
    selectedTerm: term,
  });
}
