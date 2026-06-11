import type { Module } from "../data/mockData";
import { GPA_SEMESTERS } from "../data/mockData";
import { scopedStorageKey } from "./userStorage";

const MODULES_STORAGE_SUFFIX = "gpa-modules";
const SELECTED_SEMESTER_SUFFIX = "gpa-selected-semester";

function emptyModulesBySemester(): Record<string, Module[]> {
  return Object.fromEntries(GPA_SEMESTERS.map((sem) => [sem.id, []]));
}

export function loadModulesBySemester(userId: string): Record<string, Module[]> {
  try {
    const raw = localStorage.getItem(scopedStorageKey(userId, MODULES_STORAGE_SUFFIX));
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, Module[]>;
      return { ...emptyModulesBySemester(), ...parsed };
    }
  } catch {
    /* use defaults */
  }
  return emptyModulesBySemester();
}

export function saveModulesBySemester(
  userId: string,
  modulesBySemester: Record<string, Module[]>
): void {
  localStorage.setItem(
    scopedStorageKey(userId, MODULES_STORAGE_SUFFIX),
    JSON.stringify(modulesBySemester)
  );
}

export function loadSelectedSemester(userId: string, defaultId = "2023-24-fall"): string {
  try {
    const raw = localStorage.getItem(scopedStorageKey(userId, SELECTED_SEMESTER_SUFFIX));
    if (raw && GPA_SEMESTERS.some((sem) => sem.id === raw)) return raw;
  } catch {
    /* use default */
  }
  return defaultId;
}

export function saveSelectedSemester(userId: string, semesterId: string): void {
  localStorage.setItem(scopedStorageKey(userId, SELECTED_SEMESTER_SUFFIX), semesterId);
}
