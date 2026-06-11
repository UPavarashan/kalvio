import { scopedStorageKey } from "./userStorage";

export const DEFAULT_GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0.0,
};

/** @deprecated Use DEFAULT_GRADE_POINTS or custom scale from state */
export const GRADE_POINTS = DEFAULT_GRADE_POINTS;

export const GRADE_LETTERS = [
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D",
  "F",
] as const;

export const GRADE_LABELS: Record<string, string> = {
  A: "Excellent",
  "A-": "Very Good",
  "B+": "Good",
  B: "Above Average",
  "B-": "Average",
  "C+": "Fair",
  C: "Passing",
  "C-": "Below Average",
  D: "Poor",
  F: "Fail",
};

const GRADE_SCALE_STORAGE_SUFFIX = "grade-scale";

export function getGradeOptions(gradePoints: Record<string, number>) {
  return GRADE_LETTERS.map((grade) => ({
    grade,
    points: gradePoints[grade] ?? 0,
  })).sort((a, b) => b.points - a.points);
}

export function calculateGPA(
  modules: { credits: number; grade: string }[],
  gradePoints: Record<string, number> = DEFAULT_GRADE_POINTS
): number {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const mod of modules) {
    const pts = gradePoints[mod.grade] ?? 0;
    totalPoints += pts * mod.credits;
    totalCredits += mod.credits;
  }
  return totalCredits === 0 ? 0 : totalPoints / totalCredits;
}

export function formatGPA(gpa: number): string {
  return gpa.toFixed(2);
}

export function loadGradeScale(userId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(scopedStorageKey(userId, GRADE_SCALE_STORAGE_SUFFIX));
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, number>;
      return { ...DEFAULT_GRADE_POINTS, ...parsed };
    }
  } catch {
    /* use defaults */
  }
  return { ...DEFAULT_GRADE_POINTS };
}

export function saveGradeScale(userId: string, scale: Record<string, number>): void {
  localStorage.setItem(scopedStorageKey(userId, GRADE_SCALE_STORAGE_SUFFIX), JSON.stringify(scale));
}

export function cloneGradeScale(scale: Record<string, number>): Record<string, number> {
  return { ...scale };
}

export const GRADE_OPTIONS = getGradeOptions(DEFAULT_GRADE_POINTS);

export const MODULE_ICON_BACKGROUNDS = [
  "bg-primary-fixed border-primary/20",
  "bg-secondary-container border-secondary/20",
  "bg-tertiary-container text-on-tertiary-container border-tertiary/20",
  "bg-error-container text-on-error-container border-error/20",
] as const;

export function iconBgForIndex(index: number): string {
  return MODULE_ICON_BACKGROUNDS[index % MODULE_ICON_BACKGROUNDS.length];
}
