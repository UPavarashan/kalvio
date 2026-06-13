import type { Module } from "../data/mockData";
import { GPA_SEMESTERS } from "../data/mockData";
import { DEFAULT_GRADE_POINTS } from "./grades";
import { supabase } from "./supabaseClient";

function emptyModulesBySemester(): Record<string, Module[]> {
  return Object.fromEntries(GPA_SEMESTERS.map((sem) => [sem.id, []]));
}

export interface GpaData {
  modulesBySemester: Record<string, Module[]>;
  selectedSemesterId: string;
  gradeScale: Record<string, number>;
}

const DEFAULT_SEMESTER_ID = "2023-24-fall";

function normalizeGpaData(raw: Partial<GpaData> | null): GpaData {
  return {
    modulesBySemester: {
      ...emptyModulesBySemester(),
      ...(raw?.modulesBySemester ?? {}),
    },
    selectedSemesterId:
      raw?.selectedSemesterId &&
      GPA_SEMESTERS.some((sem) => sem.id === raw.selectedSemesterId)
        ? raw.selectedSemesterId
        : DEFAULT_SEMESTER_ID,
    gradeScale: { ...DEFAULT_GRADE_POINTS, ...(raw?.gradeScale ?? {}) },
  };
}

export async function loadGpaData(userId: string): Promise<GpaData> {
  const { data, error } = await supabase
    .from("user_gpa")
    .select("modules_by_semester, selected_semester_id, grade_scale")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return normalizeGpaData({
      modulesBySemester: data.modules_by_semester as Record<string, Module[]>,
      selectedSemesterId: data.selected_semester_id,
      gradeScale: data.grade_scale as Record<string, number>,
    });
  }

  const seeded = normalizeGpaData(null);
  await saveGpaData(userId, seeded);
  return seeded;
}

export async function saveGpaData(userId: string, data: GpaData): Promise<void> {
  const { error } = await supabase.from("user_gpa").upsert(
    {
      user_id: userId,
      modules_by_semester: data.modulesBySemester,
      selected_semester_id: data.selectedSemesterId,
      grade_scale: data.gradeScale,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
}

export async function loadModulesBySemester(
  userId: string
): Promise<Record<string, Module[]>> {
  const data = await loadGpaData(userId);
  return data.modulesBySemester;
}

export async function saveModulesBySemester(
  userId: string,
  modulesBySemester: Record<string, Module[]>
): Promise<void> {
  const data = await loadGpaData(userId);
  await saveGpaData(userId, { ...data, modulesBySemester });
}

export async function loadSelectedSemester(
  userId: string,
  defaultId = DEFAULT_SEMESTER_ID
): Promise<string> {
  const data = await loadGpaData(userId);
  return data.selectedSemesterId || defaultId;
}

export async function saveSelectedSemester(
  userId: string,
  semesterId: string
): Promise<void> {
  const data = await loadGpaData(userId);
  await saveGpaData(userId, { ...data, selectedSemesterId: semesterId });
}

export async function loadGradeScale(userId: string): Promise<Record<string, number>> {
  const data = await loadGpaData(userId);
  return data.gradeScale;
}

export async function saveGradeScale(
  userId: string,
  scale: Record<string, number>
): Promise<void> {
  const data = await loadGpaData(userId);
  await saveGpaData(userId, { ...data, gradeScale: scale });
}
