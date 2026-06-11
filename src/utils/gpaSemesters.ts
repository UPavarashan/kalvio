import { GPA_SEMESTERS, type GPASemester } from "../data/mockData";

export function formatAcademicYearLabel(academicYear: string): string {
  return academicYear.replace("-", "–");
}

export function formatAcademicYearLedger(academicYear: string): string {
  return academicYear.replace("-", "/");
}

export function termNumberFromSeason(season: GPASemester["season"]): 1 | 2 {
  return season === "Fall" ? 1 : 2;
}

export function seasonFromTermNumber(term: 1 | 2): GPASemester["season"] {
  return term === 1 ? "Fall" : "Spring";
}

export function findSemesterForYearAndTerm(
  academicYear: string,
  term: 1 | 2
): GPASemester | undefined {
  const season = seasonFromTermNumber(term);
  return GPA_SEMESTERS.find((s) => s.academicYear === academicYear && s.season === season);
}

export function resolveSemesterForYearAndTerm(
  academicYear: string,
  preferredTerm: 1 | 2
): GPASemester {
  const match = findSemesterForYearAndTerm(academicYear, preferredTerm);
  if (match) return match;
  const terms = getSemestersForYear(academicYear);
  return terms[0] ?? GPA_SEMESTERS[GPA_SEMESTERS.length - 1];
}

export function getAcademicYears(): { id: string; label: string }[] {
  const seen = new Set<string>();
  const years: { id: string; label: string }[] = [];
  for (const sem of GPA_SEMESTERS) {
    if (!seen.has(sem.academicYear)) {
      seen.add(sem.academicYear);
      years.push({
        id: sem.academicYear,
        label: formatAcademicYearLabel(sem.academicYear),
      });
    }
  }
  return years;
}

export function getSemestersForYear(academicYear: string): GPASemester[] {
  return GPA_SEMESTERS.filter((s) => s.academicYear === academicYear);
}

export function formatTermLabel(sem: GPASemester): string {
  return sem.term;
}
