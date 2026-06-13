import { useState, useMemo, useEffect } from "react";
import {
  GPA_SEMESTERS,
  GPA_BADGES,
  SCHOLARSHIPS,
  type Module,
} from "../data/mockData";
import {
  GRADE_LABELS,
  calculateGPA,
  DEFAULT_GRADE_POINTS,
  formatGPA,
} from "../utils/grades";
import {
  getAcademicYears,
  formatTermLabel,
  formatAcademicYearLedger,
  termNumberFromSeason,
  resolveSemesterForYearAndTerm,
} from "../utils/gpaSemesters";
import { GPAControls } from "../components/gpa/GPAControls";
import {
  loadGpaData,
  saveGpaData,
} from "../utils/gpaStorage";
import { ModuleFormModal } from "../components/gpa/ModuleFormModal";
import { GradeScaleModal } from "../components/gpa/GradeScaleModal";
import UnderDevelopmentOverlay from "../components/UnderDevelopmentOverlay";
import { useAuth } from "../context/AuthContext";
import { getDefaultSubjectIcon } from "../utils/courseIcons";

type ModuleModalState =
  | { mode: "add" }
  | { mode: "edit"; module: Module }
  | null;

export default function GPAPlanner() {
  const { user } = useAuth();
  const [modulesBySemester, setModulesBySemester] = useState<Record<string, Module[]>>({});
  const [selectedSemesterId, setSelectedSemesterId] = useState("2023-24-fall");
  const [targetGpa, setTargetGpa] = useState(4.0);
  const [moduleModal, setModuleModal] = useState<ModuleModalState>(null);
  const [gradeScaleOpen, setGradeScaleOpen] = useState(false);
  const [gradePoints, setGradePoints] = useState<Record<string, number>>(() => ({
    ...DEFAULT_GRADE_POINTS,
  }));
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!user) {
      setHydrated(false);
      return;
    }

    let cancelled = false;

    loadGpaData(user.id)
      .then((data) => {
        if (cancelled) return;
        setModulesBySemester(data.modulesBySemester);
        setSelectedSemesterId(data.selectedSemesterId);
        setGradePoints(data.gradeScale);
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const persistGpa = (
    patch: Partial<{
      modulesBySemester: Record<string, Module[]>;
      selectedSemesterId: string;
      gradeScale: Record<string, number>;
    }>
  ) => {
    if (!user) return;
    void saveGpaData(user.id, {
      modulesBySemester: patch.modulesBySemester ?? modulesBySemester,
      selectedSemesterId: patch.selectedSemesterId ?? selectedSemesterId,
      gradeScale: patch.gradeScale ?? gradePoints,
    });
  };

  const selectedSemester =
    GPA_SEMESTERS.find((s) => s.id === selectedSemesterId) ?? GPA_SEMESTERS[GPA_SEMESTERS.length - 1];
  const selectedSemesterIndex = GPA_SEMESTERS.findIndex((s) => s.id === selectedSemesterId);
  const modules = modulesBySemester[selectedSemesterId] ?? [];

  const gpaBySemester = useMemo(
    () =>
      GPA_SEMESTERS.map((sem) => {
        const semModules = modulesBySemester[sem.id] ?? [];
        return {
          ...sem,
          gpa: calculateGPA(
            semModules.map((m) => ({ credits: m.credits, grade: m.grade })),
            gradePoints
          ),
          credits: semModules.reduce((sum, m) => sum + m.credits, 0),
        };
      }),
    [modulesBySemester, gradePoints]
  );

  const semesterGpa = gpaBySemester[selectedSemesterIndex]?.gpa ?? 0;
  const semesterCredits = gpaBySemester[selectedSemesterIndex]?.credits ?? 0;

  const cumulativeThroughSelected = useMemo(() => {
    const through = gpaBySemester.slice(0, selectedSemesterIndex + 1);
    let totalPoints = 0;
    let totalCredits = 0;
    for (const sem of through) {
      for (const mod of modulesBySemester[sem.id] ?? []) {
        const pts = gradePoints[mod.grade] ?? 0;
        totalPoints += pts * mod.credits;
        totalCredits += mod.credits;
      }
    }
    return totalCredits === 0 ? 0 : totalPoints / totalCredits;
  }, [gpaBySemester, modulesBySemester, gradePoints, selectedSemesterIndex]);

  const creditsThroughSelected = useMemo(
    () =>
      gpaBySemester
        .slice(0, selectedSemesterIndex + 1)
        .reduce((sum, sem) => sum + sem.credits, 0),
    [gpaBySemester, selectedSemesterIndex]
  );

  const previousSemesterGpa =
    selectedSemesterIndex > 0 ? gpaBySemester[selectedSemesterIndex - 1]?.gpa : null;
  const gpaDelta =
    previousSemesterGpa !== null ? semesterGpa - previousSemesterGpa : null;

  const historicalPerformance = useMemo(() => {
    let runningPoints = 0;
    let runningCredits = 0;

    return gpaBySemester.map((sem, index) => {
      for (const mod of modulesBySemester[sem.id] ?? []) {
        runningPoints += (gradePoints[mod.grade] ?? 0) * mod.credits;
      }
      runningCredits += sem.credits;

      const prevGpa = index > 0 ? gpaBySemester[index - 1].gpa : null;

      return {
        ...sem,
        cumulativeGpa: runningCredits === 0 ? 0 : runningPoints / runningCredits,
        delta: prevGpa !== null ? sem.gpa - prevGpa : null,
      };
    });
  }, [gpaBySemester, modulesBySemester, gradePoints]);

  const overallCumulative =
    historicalPerformance[historicalPerformance.length - 1]?.cumulativeGpa ?? 0;
  const overallCredits = historicalPerformance.reduce((sum, sem) => sum + sem.credits, 0);

  const totalCredits = 120;
  const requiredSemAvg = useMemo(() => {
    const remainingCredits = totalCredits - creditsThroughSelected;
    if (remainingCredits <= 0) return 0;
    const currentPoints = cumulativeThroughSelected * creditsThroughSelected;
    const targetPoints = targetGpa * totalCredits;
    const needed = (targetPoints - currentPoints) / remainingCredits;
    return Math.max(0, Math.min(4, needed));
  }, [targetGpa, cumulativeThroughSelected, creditsThroughSelected, totalCredits]);

  const handleSaveModule = (module: Module) => {
    if (!user || !hydrated) return;
    setModulesBySemester((prev) => {
      const current = prev[selectedSemesterId] ?? [];
      const next = {
        ...prev,
        [selectedSemesterId]:
          moduleModal?.mode === "edit"
            ? current.map((m) => (m.id === module.id ? module : m))
            : [...current, module],
      };
      persistGpa({ modulesBySemester: next });
      return next;
    });
    setModuleModal(null);
  };

  const handleDeleteModule = (id: string) => {
    if (!user || !hydrated) return;
    setModulesBySemester((prev) => {
      const next = {
        ...prev,
        [selectedSemesterId]: (prev[selectedSemesterId] ?? []).filter((m) => m.id !== id),
      };
      persistGpa({ modulesBySemester: next });
      return next;
    });
    setModuleModal(null);
  };

  const handleSemesterChange = (semesterId: string) => {
    if (!user || !hydrated) return;
    setSelectedSemesterId(semesterId);
    persistGpa({ selectedSemesterId: semesterId });
  };

  const academicYears = useMemo(() => getAcademicYears(), []);
  const activeTerm = termNumberFromSeason(selectedSemester.season);
  const controlsSummary = `${formatAcademicYearLedger(selectedSemester.academicYear)} · Sem ${activeTerm}`;

  const handleYearChange = (academicYear: string) => {
    const next = resolveSemesterForYearAndTerm(academicYear, activeTerm);
    handleSemesterChange(next.id);
  };

  const handleTermChange = (term: 1 | 2) => {
    const next = resolveSemesterForYearAndTerm(selectedSemester.academicYear, term);
    handleSemesterChange(next.id);
  };

  const handleSaveGradeScale = (scale: Record<string, number>) => {
    if (!user || !hydrated) return;
    setGradePoints(scale);
    persistGpa({ gradeScale: scale });
    setGradeScaleOpen(false);
  };

  const maxGpa = 4.0;

  return (
    <UnderDevelopmentOverlay>
    <div className="space-y-8 pb-16">
      <GPAControls
        expanded={controlsExpanded}
        summary={controlsSummary}
        onToggle={() => setControlsExpanded((v) => !v)}
        academicYear={selectedSemester.academicYear}
        academicYears={academicYears}
        activeTerm={activeTerm}
        onYearChange={handleYearChange}
        onTermChange={handleTermChange}
      />

      <section className="paper-texture hand-drawn-border charcoal-shadow-lg p-4 sm:p-6 md:p-10 bg-surface-container relative overflow-hidden">
        <div className="absolute -top-4 -right-4 opacity-10">
          <span className="material-symbols-outlined text-[80px] sm:text-[120px]">auto_awesome</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-10 items-center">
          <div className="space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-primary ink-underline inline-block">
              GPA Planner
            </h2>
            <p className="font-body text-lg text-on-surface-variant max-w-xs">
              Simulate your semester outcomes and track your path to graduation.
            </p>
            <div className="flex gap-4 pt-6 flex-wrap">
              {GPA_BADGES.map((badge) => (
                <div
                  key={badge.label}
                  className={`sticker-badge font-label text-xs ${badge.className}`}
                >
                  {badge.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-surface-bright hand-drawn-border rotate-1">
            <p className="font-label text-xs text-on-surface-variant mb-2">
              {formatTermLabel(selectedSemester).toUpperCase()} GPA
            </p>
            <span className="font-display text-4xl sm:text-5xl md:text-[64px] font-bold text-primary leading-none">
              {formatGPA(semesterGpa)}
            </span>
            {gpaDelta !== null && (
              <div className="flex items-center gap-2 text-primary font-bold mt-4">
                <span className="material-symbols-outlined text-sm">
                  {gpaDelta >= 0 ? "trending_up" : "trending_down"}
                </span>
                <span className="text-xs">
                  {gpaDelta >= 0 ? "+" : ""}
                  {gpaDelta.toFixed(2)} vs last sem
                </span>
              </div>
            )}
            <p className="font-label text-[10px] text-on-surface-variant mt-2">
              Cumulative through {formatTermLabel(selectedSemester)}:{" "}
              {formatGPA(cumulativeThroughSelected)}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between font-label text-xs">
                <span>Credits ({selectedSemester.season})</span>
                <span>{semesterCredits} cr</span>
              </div>
              <div className="flex justify-between font-label text-xs">
                <span>Cumulative credits</span>
                <span>
                  {creditsThroughSelected} / {totalCredits}
                </span>
              </div>
              <div className="h-4 bg-surface hand-drawn-border overflow-hidden">
                <div
                  className="h-full bg-primary-container sketch-bar"
                  style={{ width: `${(creditsThroughSelected / totalCredits) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 bg-primary text-surface-bright hand-drawn-border py-2 font-label text-xs charcoal-shadow hover:translate-y-0.5 transition-transform"
              >
                Save Projection
              </button>
              <button
                type="button"
                className="flex-1 border border-primary text-primary hand-drawn-border py-2 font-label text-xs hover:bg-primary-fixed transition-colors"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 paper-texture hand-drawn-border charcoal-shadow p-6 bg-surface-container">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-10">
            <h3 className="font-headline text-xl sm:text-2xl font-medium text-primary">
              GPA Trend
            </h3>
            <div className="flex gap-2 items-center">
              <span className="w-3 h-3 bg-primary-container rounded-full" />
              <span className="font-label text-xs text-on-surface-variant">
                GPA per Semester
              </span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-around gap-2 sm:gap-4 px-2 sm:px-4 border-b-2 border-primary border-l-2 overflow-x-auto">
            {gpaBySemester.map((sem) => {
              const isSelected = sem.id === selectedSemesterId;
              return (
              <button
                key={sem.id}
                type="button"
                onClick={() => handleSemesterChange(sem.id)}
                className={`group relative flex flex-col items-center w-full max-w-[60px] focus:outline-none ${
                  isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`}
              >
                <div
                  className={`w-full sketch-bar relative transition-colors ${
                    sem.projected ? "bg-primary" : "bg-primary-fixed-dim"
                  } ${isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:bg-primary-container"}`}
                  style={{ height: `${(sem.gpa / maxGpa) * 200}px` }}
                >
                  {sem.projected && (
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,255,255,0.1)_5px,rgba(255,255,255,0.1)_10px)]" />
                  )}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-label text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatGPA(sem.gpa)}
                  </span>
                </div>
                <p
                  className={`font-label text-xs mt-2 ${
                    isSelected || sem.projected ? "font-bold text-primary" : ""
                  }`}
                >
                  {sem.season === "Fall" ? "Fall" : "Spr"}
                  {" '"}
                  {sem.term.split(" ")[1]?.slice(-2)}
                  {sem.projected ? "*" : ""}
                </p>
              </button>
            );
            })}
          </div>
        </div>

        <div className="paper-texture hand-drawn-border charcoal-shadow p-6 bg-surface-container flex flex-col">
          <h3 className="font-headline text-2xl font-medium text-primary mb-6">
            Scholarship Tracker
          </h3>
          <div className="space-y-6 flex-grow">
            {SCHOLARSHIPS.map((scholarship) => (
              <div
                key={scholarship.id}
                className={`p-4 bg-surface-bright hand-drawn-border relative ${
                  scholarship.muted ? "opacity-60" : ""
                }`}
              >
                {scholarship.eligible && (
                  <div className="absolute top-2 right-2 sticker-badge bg-tertiary text-on-tertiary scale-75 rotate-6 text-[10px]">
                    ELIGIBLE
                  </div>
                )}
                <p className="font-label text-xs text-on-surface-variant">
                  {scholarship.title}
                </p>
                <p
                  className={`font-headline text-2xl ${
                    scholarship.muted ? "text-on-surface-variant" : "text-primary"
                  }`}
                >
                  {scholarship.amount}
                </p>
                <p
                  className={`text-[10px] mt-2 ${
                    scholarship.muted ? "text-error font-bold" : "text-on-surface-variant"
                  }`}
                >
                  {scholarship.note}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-6 w-full p-2 font-label text-xs text-primary underline decoration-2 hover:text-primary-container transition-colors"
          >
            View Requirements List
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h3 className="font-headline text-2xl font-medium text-primary shrink-0">
            {formatTermLabel(selectedSemester)} Modules
          </h3>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setGradeScaleOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container hand-drawn-border charcoal-shadow font-label text-xs hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              Grade Scale
            </button>
            <button
              type="button"
              onClick={() => setModuleModal({ mode: "add" })}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container hand-drawn-border charcoal-shadow font-label text-xs hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Module
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-4">
          {modules.length === 0 ? (
            <div className="col-span-full py-12 text-center paper-texture hand-drawn-border bg-surface-bright">
              <p className="font-label text-sm text-on-surface-variant">
                No modules for {formatTermLabel(selectedSemester)} yet.
              </p>
              <button
                type="button"
                onClick={() => setModuleModal({ mode: "add" })}
                className="mt-3 font-label text-xs text-primary underline hover:text-primary-container"
              >
                Add your first module
              </button>
            </div>
          ) : (
            modules.map((mod) => {
            const pts = gradePoints[mod.grade] ?? 0;
            const label = GRADE_LABELS[mod.grade] ?? "Unknown";
            return (
              <div
                key={mod.id}
                className="paper-texture hand-drawn-border p-4 bg-surface-bright charcoal-shadow hover:-translate-y-0.5 transition-transform flex flex-col min-w-0"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`shrink-0 p-2 rounded-lg border ${mod.iconBg}`}>
                    <span className="material-symbols-outlined text-primary text-xl leading-none">
                      {mod.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline text-base font-medium leading-snug line-clamp-2">
                      {mod.name}
                    </h4>
                    <span className="font-label text-[10px] text-on-surface-variant mt-1 block">
                      {mod.credits} Credits
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModuleModal({ mode: "edit", module: mod })}
                    className="shrink-0 p-0.5 text-on-surface-variant/60 hover:text-primary transition-colors"
                    aria-label={`Edit ${mod.name}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
                <div className="mt-auto pt-3 border-t border-outline-variant/40">
                  <p className="font-label text-[10px] text-on-surface-variant mb-2">
                    Grade
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 shrink-0 flex items-center justify-center font-display text-xl text-primary bg-surface-container-low border-2 border-primary sketch-bar">
                      {mod.grade}
                    </span>
                    <div className="min-w-0">
                      <span className="font-label text-xs text-primary block">
                        {pts.toFixed(1)} Pts
                      </span>
                      <span className="text-[10px] text-on-surface-variant truncate block">
                        {label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </section>

      {gradeScaleOpen && (
        <GradeScaleModal
          gradePoints={gradePoints}
          onClose={() => setGradeScaleOpen(false)}
          onSave={handleSaveGradeScale}
        />
      )}

      {moduleModal && (
        <ModuleFormModal
          mode={moduleModal.mode}
          course={user?.course ?? ""}
          gradePoints={gradePoints}
          module={
            moduleModal.mode === "edit"
              ? moduleModal.module
              : {
                  name: "",
                  credits: 3,
                  grade: "B",
                  icon: getDefaultSubjectIcon(user?.course ?? ""),
                }
          }
          onClose={() => setModuleModal(null)}
          onSave={handleSaveModule}
          onDelete={
            moduleModal.mode === "edit"
              ? () => handleDeleteModule(moduleModal.module.id)
              : undefined
          }
        />
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 sm:p-6 md:p-10 bg-surface-container-high hand-drawn-border charcoal-shadow space-y-4 sm:space-y-6">
          <h3 className="font-headline text-xl sm:text-2xl font-medium text-primary">
            Target GPA Calculator
          </h3>
          <p className="font-body text-sm sm:text-base text-on-surface-variant">
            I want to graduate with a CGPA of:
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <input
              className="w-full sm:w-32 bg-transparent border-b-2 border-primary font-display text-3xl sm:text-5xl text-primary focus:ring-0 outline-none"
              step="0.01"
              type="number"
              min="0"
              max="4"
              value={targetGpa}
              onChange={(e) => setTargetGpa(parseFloat(e.target.value) || 0)}
            />
            <div className="pb-1">
              <p className="font-label text-xs text-primary">
                Required Semester Average:
              </p>
              <p className="font-headline text-2xl">{formatGPA(requiredSemAvg)}</p>
            </div>
          </div>
          <div className="p-4 bg-primary-fixed rounded-lg font-label text-xs text-primary border border-primary">
            <span className="material-symbols-outlined align-middle mr-2 text-sm">
              info
            </span>
            {requiredSemAvg <= 4
              ? "This target is achievable with current module selections."
              : "This target may require additional effort or credit adjustments."}
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-10 bg-surface-container-high hand-drawn-border charcoal-shadow space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start sm:gap-4">
            <h3 className="font-headline text-xl sm:text-2xl font-medium text-primary">
              Historical Performance
            </h3>
            <div className="text-right shrink-0">
              <p className="font-label text-[10px] text-on-surface-variant">Overall CGPA</p>
              <p className="font-headline text-xl text-primary tabular-nums">
                {formatGPA(overallCumulative)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-surface-bright hand-drawn-border">
              <p className="font-label text-[10px] text-on-surface-variant">Total credits</p>
              <p className="font-headline text-lg text-primary tabular-nums">{overallCredits}</p>
            </div>
            <div className="p-3 bg-surface-bright hand-drawn-border">
              <p className="font-label text-[10px] text-on-surface-variant">Semesters recorded</p>
              <p className="font-headline text-lg text-primary tabular-nums">
                {historicalPerformance.filter((s) => s.credits > 0).length}
              </p>
            </div>
          </div>

          <div className="border-t border-outline-variant pt-4 overflow-x-auto -mx-1 px-1">
            <div className="min-w-[280px]">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 gap-y-1 px-2 pb-2 font-label text-[10px] text-on-surface-variant uppercase tracking-wide">
              <span>Term</span>
              <span className="text-right w-14">Sem GPA</span>
              <span className="text-right w-12">Cr</span>
              <span className="text-right w-14">Cum.</span>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {[...historicalPerformance].reverse().map((sem) => {
                const isSelected = sem.id === selectedSemesterId;
                return (
                  <button
                    key={sem.id}
                    type="button"
                    onClick={() => handleSemesterChange(sem.id)}
                    className={`w-full grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center font-label text-xs p-2 rounded transition-colors text-left ${
                      isSelected
                        ? "bg-primary-fixed text-primary"
                        : "hover:bg-surface-variant"
                    }`}
                  >
                    <span className="min-w-0 truncate">
                      {formatTermLabel(sem)}
                      {sem.projected && (
                        <span className="ml-1 text-[10px] opacity-70">· projected</span>
                      )}
                    </span>
                    <span className="font-bold tabular-nums text-right w-14 flex items-center justify-end gap-0.5">
                      {sem.delta !== null && (
                        <span
                          className={`material-symbols-outlined text-[12px] ${
                            sem.delta >= 0 ? "text-primary" : "text-error"
                          }`}
                          title={
                            sem.delta >= 0
                              ? `+${sem.delta.toFixed(2)} vs prior sem`
                              : `${sem.delta.toFixed(2)} vs prior sem`
                          }
                        >
                          {sem.delta >= 0 ? "arrow_upward" : "arrow_downward"}
                        </span>
                      )}
                      {formatGPA(sem.gpa)}
                    </span>
                    <span className="tabular-nums text-right w-12 text-on-surface-variant">
                      {sem.credits}
                    </span>
                    <span className="font-bold tabular-nums text-right w-14">
                      {formatGPA(sem.cumulativeGpa)}
                    </span>
                  </button>
                );
              })}
            </div>
            </div>
          </div>

          <p className="font-label text-[10px] text-on-surface-variant">
            Click a term to view its modules. Cumulative GPA includes all semesters through that
            term.
          </p>
        </div>
      </section>
    </div>
    </UnderDevelopmentOverlay>
  );
}
