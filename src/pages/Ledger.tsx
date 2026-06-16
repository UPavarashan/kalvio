import { useMemo, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import {
  LEDGER_SEMESTERS,
  type LedgerSemester,
} from "../data/mockData";
import type {
  AttendanceLogEntry,
  ClassSession,
  LedgerSubject,
  ScheduleSlot,
} from "../types/ledger";
import { formatScheduleSummary, formatTimeShort, dayLabel } from "../types/ledger";
import {
  LedgerLogModal,
  SubjectFormModal,
} from "../components/ledger/LedgerModals";
import { LedgerCalendarModal } from "../components/ledger/LedgerCalendarModal";
import ConfirmDialog from "../components/ConfirmDialog";
import NotificationBell from "../components/NotificationBell";
import { useLedgerUI } from "../context/LedgerUIContext";
import {
  buildLogFromSubjects,
  computeOverallStats,
  computeRecoveryOutlook,
  computeSubjectStats,
  ensureSubjectSessions,
  formatSessionDateTime,
  getPassPercentage,
  getPendingSessions,
  getSlotSessionCount,
  isSessionToday,
  legacySubjectsToLedger,
} from "../utils/ledger";
import { loadAttendanceStore, saveAttendanceStore, saveAttendanceSelection, getDefaultAttendanceYear } from "../utils/ledgerStorage";
import { inputClass, selectClass } from "../utils/formClasses";
import { useAuth } from "../context/AuthContext";

const CURRENT_YEAR = getDefaultAttendanceYear();
const CURRENT_TERM = 2;

interface Term2State {
  ledgerSubjects: LedgerSubject[];
  log: AttendanceLogEntry[];
}

function emptyTerm2State(): Term2State {
  return { ledgerSubjects: [], log: [] };
}

export default function Ledger() {
  const { user } = useAuth();
  const { registerActions } = useLedgerUI();
  const confirmRef = useRef<HTMLElement>(null);
  const [academicYear, setAcademicYear] = useState(CURRENT_YEAR);
  const [years, setYears] = useState<string[]>([CURRENT_YEAR]);
  const [showYearInput, setShowYearInput] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");
  const [activeTerm, setActiveTerm] = useState<1 | 2>(CURRENT_TERM);
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [term2ByYear, setTerm2ByYear] = useState<Record<string, Term2State>>(() => ({
    [CURRENT_YEAR]: emptyTerm2State(),
  }));

  useEffect(() => {
    if (!user) {
      setHydrated(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    loadAttendanceStore(user.id)
      .then((store) => {
        if (cancelled) return;

        const nextTerm2ByYear = Object.fromEntries(
          store.years.map((year) => {
            const subjects = store.byYear[year] ?? [];
            return [
              year,
              {
                ledgerSubjects: subjects,
                log: buildLogFromSubjects(subjects),
              },
            ];
          })
        );
        setYears(store.years);
        setTerm2ByYear(nextTerm2ByYear);
        setAcademicYear(
          store.selectedYear && store.years.includes(store.selectedYear)
            ? store.selectedYear
            : store.years[0] ?? CURRENT_YEAR
        );
        setActiveTerm(store.selectedTerm === 1 ? 1 : 2);
        setLoadError(null);
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Could not load attendance. Check your connection and try again.");
          setHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, reloadKey]);

  useEffect(() => {
    if (!user || !hydrated) return;

    const timeout = window.setTimeout(() => {
      void saveAttendanceStore(user.id, {
        years,
        byYear: Object.fromEntries(
          years.map((year) => [year, term2ByYear[year]?.ledgerSubjects ?? []])
        ),
        selectedYear: academicYear,
        selectedTerm: activeTerm,
      });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [years, term2ByYear, academicYear, activeTerm, user?.id, hydrated]);

  const [modal, setModal] = useState<
    | { type: "addSubject" }
    | { type: "editSubject"; subjectId: string }
    | { type: "allClasses" }
    | { type: "log" }
    | { type: "deleteYear"; year: string }
    | { type: "cannotDeleteLastYear" }
    | null
  >(null);

  const allYears = useMemo(() => [...years].sort(), [years]);
  const isEditable = activeTerm === 2;

  const updateTerm2 = (year: string, updater: (prev: Term2State) => Term2State) => {
    setTerm2ByYear((prev) => ({
      ...prev,
      [year]: updater(prev[year] ?? emptyTerm2State()),
    }));
  };

  const displayedData = useMemo(() => {
    if (activeTerm === 1) {
      const sem = LEDGER_SEMESTERS.find(
        (s) => s.academicYear === academicYear && s.term === 1
      );
      if (sem) {
        const subjects = legacySubjectsToLedger(sem.subjects);
        return {
          academicYear: sem.academicYear,
          term: sem.term,
          ledgerSubjects: subjects,
          log: buildLogFromSubjects(subjects),
          calendarDays: sem.calendarDays,
          calendarMonth: sem.calendarMonth,
        };
      }
      return {
        academicYear,
        term: 1 as const,
        ledgerSubjects: [],
        log: [],
        calendarDays: [] as LedgerSemester["calendarDays"],
        calendarMonth: "",
      };
    }

    const t2 = term2ByYear[academicYear] ?? emptyTerm2State();
    return {
      academicYear,
      term: 2 as const,
      ledgerSubjects: t2.ledgerSubjects,
      log: t2.log,
      calendarDays: [] as LedgerSemester["calendarDays"],
      calendarMonth: "",
    };
  }, [activeTerm, academicYear, term2ByYear]);

  const stats = useMemo(
    () => computeOverallStats(displayedData.ledgerSubjects),
    [displayedData]
  );

  const pendingSessions = useMemo(() => {
    if (!isEditable || activeTerm !== 2) return [];
    const t2 = term2ByYear[academicYear];
    if (!t2) return [];
    return getPendingSessions(t2.ledgerSubjects);
  }, [isEditable, activeTerm, academicYear, term2ByYear]);

  const [pendingIndex, setPendingIndex] = useState(0);

  useEffect(() => {
    setPendingIndex((index) => {
      if (pendingSessions.length === 0) return 0;
      return Math.min(index, pendingSessions.length - 1);
    });
  }, [pendingSessions.length]);

  const currentPending = pendingSessions[pendingIndex] ?? null;

  const openAddSubject = useCallback(() => setModal({ type: "addSubject" }), []);
  const scrollToConfirm = useCallback(() => {
    confirmRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
    registerActions({
      pendingCount: pendingSessions.length,
      pendingItems: pendingSessions.map(({ subject, session }) => ({
        subjectId: subject.id,
        subjectName: subject.name,
        icon: subject.icon,
        date: session.date,
        time: session.time,
      })),
      openAddSubject,
      scrollToConfirm,
    });
    return () => registerActions(null);
  }, [pendingSessions, openAddSubject, scrollToConfirm, registerActions]);

  useEffect(() => {
    if (activeTerm !== 2) return;

    updateTerm2(academicYear, (prev) => {
      const synced = prev.ledgerSubjects.map(ensureSubjectSessions);
      const changed = synced.some(
        (subject, index) =>
          subject.sessions.length !== prev.ledgerSubjects[index]?.sessions.length ||
          subject.recurringFrom !== prev.ledgerSubjects[index]?.recurringFrom ||
          subject.recurringUntil !== prev.ledgerSubjects[index]?.recurringUntil
      );
      if (!changed) return prev;

      return {
        ledgerSubjects: synced,
        log: buildLogFromSubjects(synced),
      };
    });
  }, [activeTerm, academicYear]);

  const controlsSummary = `${academicYear} · Sem ${activeTerm}`;

  const confirmAttendance = (
    subjectId: string,
    sessionId: string,
    status: ClassSession["status"]
  ) => {
    if (status === "scheduled") return;

    setTerm2ByYear((prev) => {
      const current = prev[academicYear] ?? emptyTerm2State();
      const updatedSubjects = current.ledgerSubjects.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              sessions: s.sessions.map((sess) =>
                sess.id === sessionId ? { ...sess, status } : { ...sess }
              ),
            }
          : s
      );
      return {
        ...prev,
        [academicYear]: {
          ledgerSubjects: updatedSubjects,
          log: buildLogFromSubjects(updatedSubjects),
        },
      };
    });
  };

  const persistSelection = useCallback(
    (year: string, term: 1 | 2) => {
      if (!user) return;
      void saveAttendanceSelection(user.id, year, term);
    },
    [user]
  );

  const performDeleteYear = useCallback(
    (yearToDelete: string) => {
      const remaining = allYears.filter((year) => year !== yearToDelete);
      const nextYear = remaining[0] ?? CURRENT_YEAR;

      setYears(remaining);
      setTerm2ByYear((prev) => {
        const next = { ...prev };
        delete next[yearToDelete];
        return next;
      });
      setAcademicYear(nextYear);
      setActiveTerm(2);
      setShowYearInput(false);
      setNewYearInput("");
      setControlsExpanded(false);

      if (user) {
        const nextByYear = Object.fromEntries(
          remaining.map((year) => [year, term2ByYear[year]?.ledgerSubjects ?? []])
        );
        void saveAttendanceStore(user.id, {
          years: remaining,
          byYear: nextByYear,
          selectedYear: nextYear,
          selectedTerm: 2,
        });
      }
    },
    [allYears, term2ByYear, user]
  );

  const controlsProps = {
    expanded: controlsExpanded,
    summary: controlsSummary,
    onToggle: () => setControlsExpanded((v) => !v),
    academicYear,
    allYears,
    activeTerm,
    showYearInput,
    newYearInput,
    onYearChange: (y: string) => {
      if (y === "__add__") setShowYearInput(true);
      else {
        setShowYearInput(false);
        setNewYearInput("");
        setAcademicYear(y);
        persistSelection(y, activeTerm);
      }
    },
    onCancelAddYear: () => {
      setShowYearInput(false);
      setNewYearInput("");
    },
    onAddYear: () => {
      const t = newYearInput.trim();
      if (!t || allYears.includes(t)) return;
      setYears((prev) => [...prev, t].sort());
      setAcademicYear(t);
      setNewYearInput("");
      setShowYearInput(false);
      setActiveTerm(2);
      setControlsExpanded(false);
      setTerm2ByYear((p) => ({ ...p, [t]: p[t] ?? emptyTerm2State() }));
      persistSelection(t, 2);
    },
    onDeleteYear: () => {
      if (allYears.length <= 1) {
        setControlsExpanded(false);
        setModal({ type: "cannotDeleteLastYear" });
        return;
      }
      setControlsExpanded(false);
      setModal({ type: "deleteYear", year: academicYear });
    },
    canDeleteYear: allYears.length > 1,
    onNewYearInputChange: setNewYearInput,
    onTermChange: (term: 1 | 2) => {
      setActiveTerm(term);
      persistSelection(academicYear, term);
    },
  };

  const editSubject =
    modal?.type === "editSubject"
      ? displayedData.ledgerSubjects.find((s) => s.id === modal.subjectId)
      : null;

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-5 pb-8 sm:pb-16 w-full">
        <p className="font-body text-on-surface-variant">Loading attendance…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-4 pb-8 sm:pb-16 w-full">
        <p className="font-body text-error">{loadError}</p>
        <button
          type="button"
          onClick={() => {
            setHydrated(false);
            setLoadError(null);
            setReloadKey((key) => key + 1);
          }}
          className="px-4 py-2 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-8 pb-8 sm:pb-16 w-full">
      <Header
        semLabel={`${displayedData.academicYear} — Sem ${displayedData.term}`}
        onCalendar={() => setModal({ type: "allClasses" })}
        pendingItems={pendingSessions.map(({ subject, session }) => ({
          subjectId: subject.id,
          subjectName: subject.name,
          icon: subject.icon,
          date: session.date,
          time: session.time,
        }))}
        onPendingClick={scrollToConfirm}
        controls={<LedgerControls {...controlsProps} />}
      />

      {isEditable && currentPending && (
        <section
          ref={confirmRef}
          key={currentPending.session.id}
          className="paper-texture hand-drawn-border charcoal-shadow p-4 sm:p-8 bg-surface-container w-full max-w-full"
        >
          <p className="font-label text-[10px] text-on-surface-variant mb-1">
            {isSessionToday(currentPending.session.date)
              ? "Today's class"
              : "Unconfirmed class"}
          </p>
          <h3 className="font-headline text-xl font-medium text-primary mb-6">
            Confirm Attendance
          </h3>
          <div className="flex items-center gap-2 sm:gap-4 max-w-xl mx-auto min-w-0">
            <PendingClassNavButton
              direction="prev"
              onClick={() => setPendingIndex((index) => Math.max(0, index - 1))}
              disabled={pendingIndex === 0 || pendingSessions.length <= 1}
              aria-label="Previous class"
            />
            <div className="flex-1 min-w-0 flex flex-col items-center text-center gap-6">
              <span className="material-symbols-outlined text-5xl text-primary">
                {currentPending.subject.icon}
              </span>
              <div>
                <p className="font-headline text-xl sm:text-2xl font-medium">{currentPending.subject.name}</p>
                <p className="font-body text-on-surface-variant mt-1">
                  {formatSessionDateTime(
                    currentPending.session.date,
                    currentPending.session.time
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full max-w-sm sm:flex sm:flex-wrap sm:justify-center sm:max-w-none">
                <ConfirmBtn
                  label="Present"
                  onClick={() =>
                    confirmAttendance(
                      currentPending.subject.id,
                      currentPending.session.id,
                      "present"
                    )
                  }
                  variant="present"
                />
                <ConfirmBtn
                  label="Absent"
                  onClick={() =>
                    confirmAttendance(
                      currentPending.subject.id,
                      currentPending.session.id,
                      "absent"
                    )
                  }
                  variant="absent"
                />
                <ConfirmBtn
                  label="Excused"
                  onClick={() =>
                    confirmAttendance(
                      currentPending.subject.id,
                      currentPending.session.id,
                      "excused"
                    )
                  }
                  variant="excused"
                  title="Medical certificate — counts as attended"
                />
                <ConfirmBtn
                  label="Cancelled"
                  onClick={() =>
                    confirmAttendance(
                      currentPending.subject.id,
                      currentPending.session.id,
                      "cancelled"
                    )
                  }
                  variant="cancelled"
                />
              </div>
              {pendingSessions.length > 1 && (
                <p className="font-label text-[10px] text-on-surface-variant">
                  Class {pendingIndex + 1} of {pendingSessions.length}
                </p>
              )}
            </div>
            <PendingClassNavButton
              direction="next"
              onClick={() =>
                setPendingIndex((index) => Math.min(pendingSessions.length - 1, index + 1))
              }
              disabled={pendingIndex >= pendingSessions.length - 1 || pendingSessions.length <= 1}
              aria-label="Next class"
            />
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center sm:gap-4 w-full">
        <StatCard
          icon="check_circle"
          label="TOTAL SESSIONS"
          value={String(stats.totalSessions)}
          hint="Includes sessions per class"
        />
        <StatCard
          icon="schedule"
          label="LAST 7 DAYS"
          value={`${stats.last7DaysPct}%`}
          hint="Recent attendance"
        />
        <div className="col-span-2 sm:col-span-1 paper-texture hand-drawn-border charcoal-shadow p-4 sm:p-5 bg-primary-fixed flex items-center justify-center sm:justify-start gap-3 w-full sm:w-fit max-w-full">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#c2ded6" strokeWidth="2.5" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#334b46"
                strokeWidth="2.5"
                strokeDasharray={`${stats.overallAverage}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-label text-xs sm:text-sm font-bold text-primary leading-none">
              {stats.overallAverage}%
            </span>
          </div>
          <div>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-snug">
              All-time attendance
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch">
        <div className="lg:col-span-2 paper-texture hand-drawn-border charcoal-shadow p-4 bg-surface-container w-full min-w-0 flex flex-col min-h-full">
          <div className="flex justify-between items-start gap-2 mb-1 shrink-0">
            <h3 className="font-headline text-lg font-medium text-primary">Subject Breakdown</h3>
            {isEditable && (
              <button
                type="button"
                onClick={() => setModal({ type: "addSubject" })}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow shrink-0"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Subject
              </button>
            )}
          </div>
          <p className="font-label text-[9px] text-on-surface-variant mb-2 shrink-0">
            {displayedData.ledgerSubjects.length} subjects
            {displayedData.ledgerSubjects.length === 0 &&
              isEditable &&
              " · Add a subject to schedule your classes"}
          </p>

          {displayedData.ledgerSubjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedData.ledgerSubjects.map((subject) => {
                const subStats = computeSubjectStats(subject);
                const passPct = getPassPercentage(subject);
                const belowPass = subStats.percentage < passPct;
                const recovery = belowPass ? computeRecoveryOutlook(subject, subStats) : null;
                return (
                  <div
                    key={subject.id}
                    className="p-4 bg-surface-bright hand-drawn-border hover:-translate-y-1 transition-transform"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary shrink-0">
                        {subject.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-label text-xs pr-1">{subject.name}</p>
                        <SubjectScheduleCompact
                          schedules={subject.schedules}
                          recurringWeekly={subject.recurringWeekly}
                        />
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() =>
                              setModal({ type: "editSubject", subjectId: subject.id })
                            }
                            className="p-0.5 text-on-surface-variant hover:text-primary transition-colors"
                            title="Edit subject"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        )}
                        <span
                          className={`font-label text-sm font-bold tabular-nums leading-none ${
                            belowPass ? "text-error" : "text-primary"
                          }`}
                        >
                          {subStats.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-surface hand-drawn-border overflow-hidden mb-3">
                      <div
                        className={`h-full sketch-bar ${belowPass ? "bg-error-container" : "bg-primary-container"}`}
                        style={{ width: `${subStats.percentage}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3 font-label text-[10px]">
                      <span className="text-primary">{subStats.present} Present</span>
                      {subStats.excused > 0 && (
                        <span className="text-secondary">{subStats.excused} Excused</span>
                      )}
                      <span className="text-error">{subStats.absent} Absent</span>
                      <span className="text-on-surface-variant">{subStats.scheduled} Scheduled</span>
                      {subStats.cancelled > 0 && (
                        <span className="text-on-surface-variant">{subStats.cancelled} Cancelled</span>
                      )}
                    </div>
                    {recovery && (
                      <p
                        className={`font-label text-[9px] mt-2 leading-snug ${
                          recovery.canRecover ? "text-primary" : "text-error"
                        }`}
                      >
                        {recovery.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <LedgerLogPreviewCard
          log={displayedData.log}
          onOpen={() => setModal({ type: "log" })}
        />
      </section>

      {displayedData.calendarDays.length > 0 && (
        <section className="paper-texture hand-drawn-border charcoal-shadow p-4 sm:p-6 bg-surface-container w-full min-w-0">
          <h3 className="font-headline text-lg sm:text-xl font-medium text-primary mb-4 sm:mb-6">
            {displayedData.calendarMonth}
          </h3>
          <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-0">
            {displayedData.calendarDays.map((day) => (
              <div
                key={day.day}
                className={`aspect-square max-w-full flex items-center justify-center font-label text-[10px] sm:text-xs rounded-full ${
                  day.status === "present"
                    ? "bg-primary-fixed text-primary"
                    : day.status === "absent"
                      ? "bg-error-container text-error"
                      : day.status === "current"
                        ? "border-2 border-primary font-bold"
                        : "text-on-surface-variant"
                }`}
              >
                {day.day}
              </div>
            ))}
          </div>
        </section>
      )}

      {modal?.type === "addSubject" && (
        <SubjectFormModal
          mode="add"
          subject={{ name: "" }}
          course={user?.course ?? ""}
          onClose={() => setModal(null)}
          onSave={(subject) => {
            updateTerm2(academicYear, (prev) => {
              const updatedSubjects = [...prev.ledgerSubjects, subject];
              return {
                ledgerSubjects: updatedSubjects,
                log: buildLogFromSubjects(updatedSubjects),
              };
            });
            setModal(null);
          }}
        />
      )}
      {modal?.type === "editSubject" && editSubject && (
        <SubjectFormModal
          mode="edit"
          subject={editSubject}
          course={user?.course ?? ""}
          onClose={() => setModal(null)}
          onSave={(subject) => {
            updateTerm2(academicYear, (prev) => {
              const updatedSubjects = prev.ledgerSubjects.map((s) =>
                s.id === subject.id ? subject : s
              );
              return {
                ledgerSubjects: updatedSubjects,
                log: buildLogFromSubjects(updatedSubjects),
              };
            });
            setModal(null);
          }}
          onDeleteSubject={() => {
            updateTerm2(academicYear, (prev) => {
              const updatedSubjects = prev.ledgerSubjects.filter((s) => s.id !== editSubject.id);
              return {
                ledgerSubjects: updatedSubjects,
                log: buildLogFromSubjects(updatedSubjects),
              };
            });
            setModal(null);
          }}
        />
      )}
      {modal?.type === "allClasses" && (
        <LedgerCalendarModal
          subjects={displayedData.ledgerSubjects}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "log" && (
        <LedgerLogModal log={displayedData.log} onClose={() => setModal(null)} />
      )}
      {modal?.type === "deleteYear" && (
        <ConfirmDialog
          title="Delete academic year?"
          message={`This will permanently delete ${modal.year} and all subjects, attendance records, and sessions for that year. This cannot be undone.`}
          confirmLabel="Delete year"
          cancelLabel="Keep year"
          destructive
          onCancel={() => setModal(null)}
          onConfirm={() => {
            performDeleteYear(modal.year);
            setModal(null);
          }}
        />
      )}
      {modal?.type === "cannotDeleteLastYear" && (
        <ConfirmDialog
          title="Can't delete this year"
          message="Keep at least one academic year. Add another year first, then you can delete this one."
          confirmLabel="OK"
          hideCancel
          onCancel={() => setModal(null)}
          onConfirm={() => setModal(null)}
        />
      )}
    </div>
  );
}

function Header({
  semLabel,
  onCalendar,
  pendingItems = [],
  onPendingClick,
  controls,
}: {
  semLabel: string;
  onCalendar?: () => void;
  pendingItems?: {
    subjectId: string;
    subjectName: string;
    icon: string;
    date: string;
    time: string;
  }[];
  onPendingClick?: () => void;
  controls?: ReactNode;
}) {
  const showActions = controls || onCalendar || onPendingClick;

  return (
    <section className="relative z-20 flex flex-col gap-2 sm:gap-2 w-full min-w-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full min-w-0">
        <h2 className="font-headline text-xl sm:text-3xl font-semibold text-primary ink-underline min-w-0">
          Attendance
        </h2>
        {showActions && (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-auto flex-wrap justify-end">
            {onPendingClick && (
              <NotificationBell pendingItems={pendingItems} onPendingClick={onPendingClick} />
            )}
            {controls}
            {onCalendar && (
              <button
                type="button"
                onClick={onCalendar}
                aria-label="Open calendar"
                className="flex items-center justify-center gap-1.5 min-w-[2.75rem] min-h-[2.75rem] sm:min-w-0 sm:min-h-0 px-2.5 sm:px-4 py-2 border border-primary text-primary hand-drawn-border font-label text-xs hover:bg-primary-fixed transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                <span className="hidden sm:inline">Calendar</span>
              </button>
            )}
          </div>
        )}
      </div>
      <p className="font-body text-sm sm:text-base text-on-surface-variant">
        {semLabel}
      </p>
    </section>
  );
}

function PendingClassNavButton({
  direction,
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hand-drawn-border bg-surface-bright text-primary transition-colors hover:bg-primary-fixed disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-surface-bright"
    >
      <span className="material-symbols-outlined text-2xl">
        {direction === "prev" ? "chevron_left" : "chevron_right"}
      </span>
    </button>
  );
}

function ConfirmBtn({
  label,
  onClick,
  variant,
  title,
}: {
  label: string;
  onClick: () => void;
  variant: "present" | "absent" | "excused" | "cancelled";
  title?: string;
}) {
  const styles = {
    present: "bg-primary text-on-primary",
    absent: "border border-error text-error hover:bg-error-container",
    excused: "bg-secondary text-on-secondary",
    cancelled: "border border-outline text-on-surface-variant hover:bg-surface-variant",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-full sm:w-auto px-3 py-2 sm:py-1.5 hand-drawn-border font-label text-[10px] transition-colors ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

function SubjectScheduleCompact({
  schedules,
  recurringWeekly,
}: {
  schedules: ScheduleSlot[];
  recurringWeekly: boolean;
}) {
  if (schedules.length === 0) return null;

  const tooltip =
    formatScheduleSummary(schedules) + (recurringWeekly ? " · Weekly" : "");

  return (
    <p
      className="font-label text-[9px] leading-none text-on-surface-variant/80 mt-1 truncate"
      title={tooltip}
    >
      {schedules.map((slot, i) => {
        const counted = getSlotSessionCount(slot);
        const dayShort = dayLabel(slot.dayOfWeek);
        return (
          <span key={slot.id}>
            {i > 0 && " · "}
            <span className="tracking-tight">{dayShort}</span>{" "}
            <span className="tabular-nums">{formatTimeShort(slot.time)}</span>
            {counted !== 1 && (
              <span className="text-on-surface-variant/70"> ×{counted}</span>
            )}
          </span>
        );
      })}
      {recurringWeekly && <span className="text-on-surface-variant/55"> · wk</span>}
    </p>
  );
}

function LedgerLogPreviewCard({
  log,
  onOpen,
}: {
  log: { id: string; date: string; subject: string; status: string }[];
  onOpen: () => void;
}) {
  const preview = log.slice(0, 6);
  const remaining = log.length - preview.length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="paper-texture hand-drawn-border charcoal-shadow p-4 bg-surface-container text-left hover:bg-surface-container-high transition-colors group flex flex-col overflow-hidden w-full min-h-full"
    >
      <div className="flex justify-between items-start mb-1 shrink-0">
        <h3 className="font-headline text-lg font-medium text-primary">Attendance Log</h3>
        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-lg">
          open_in_full
        </span>
      </div>
      <p className="font-label text-[9px] text-on-surface-variant mb-2 shrink-0">
        Click to view all · {log.length} entries
      </p>
      <div className="pointer-events-none w-full flex-1 min-h-0">
        <div className="grid grid-cols-[52px_1fr_28px] gap-x-1.5 font-label text-[9px] text-on-surface-variant border-b border-outline-variant pb-1 mb-0.5">
          <span>Date</span>
          <span>Subject</span>
          <span className="text-right">St</span>
        </div>
        <div className="overflow-hidden">
          {preview.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-[52px_1fr_28px] gap-x-1.5 font-label text-[9px] py-0.5 leading-tight items-center"
            >
              <span className="truncate">{entry.date}</span>
              <span className="truncate">{entry.subject}</span>
              <span className="text-right">
                <LogStat status={entry.status} />
              </span>
            </div>
          ))}
        </div>
        {remaining > 0 && (
          <p className="font-label text-[9px] text-primary pt-1">
            +{remaining} more
          </p>
        )}
      </div>
    </button>
  );
}

function LogStat({ status }: { status: string }) {
  const styles: Record<string, string> = {
    P: "text-primary font-bold",
    A: "text-error font-bold",
    E: "text-secondary font-bold",
    C: "text-on-surface-variant line-through",
  };
  return <span className={styles[status] ?? ""}>{status}</span>;
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="paper-texture hand-drawn-border charcoal-shadow p-4 sm:p-5 bg-surface-container flex items-center gap-3 w-full sm:w-fit max-w-full min-w-0">
      <span className="material-symbols-outlined text-2xl sm:text-3xl text-primary shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-label text-[10px] sm:text-xs text-on-surface-variant truncate">{label}</p>
        <p className="font-display text-2xl sm:text-4xl font-bold text-primary leading-none">
          {value}
        </p>
        {hint && (
          <p className="font-label text-[9px] text-on-surface-variant/70 mt-0.5 truncate">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

interface LedgerControlsProps {
  expanded: boolean;
  summary: string;
  onToggle: () => void;
  academicYear: string;
  allYears: string[];
  activeTerm: 1 | 2;
  showYearInput: boolean;
  newYearInput: string;
  onYearChange: (year: string) => void;
  onCancelAddYear: () => void;
  onAddYear: () => void;
  onDeleteYear: () => void;
  canDeleteYear: boolean;
  onNewYearInputChange: (value: string) => void;
  onTermChange: (term: 1 | 2) => void;
}

function LedgerControls({
  expanded,
  summary,
  onToggle,
  academicYear,
  allYears,
  activeTerm,
  showYearInput,
  newYearInput,
  onYearChange,
  onCancelAddYear,
  onAddYear,
  onDeleteYear,
  canDeleteYear,
  onNewYearInputChange,
  onTermChange,
}: LedgerControlsProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [expanded, onToggle]);

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-center gap-1.5 min-w-[2.75rem] min-h-[2.75rem] sm:min-w-0 sm:min-h-0 max-w-[11rem] sm:max-w-none px-2.5 sm:px-4 py-2 border border-primary text-primary hand-drawn-border font-label text-xs hover:bg-primary-fixed transition-colors shrink-0"
      >
        <span className="truncate">{summary}</span>
        <span className="material-symbols-outlined text-sm shrink-0">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {expanded && (
        <>
          <button
            type="button"
            aria-label="Close year and term settings"
            className="fixed inset-0 z-40 bg-inverse-surface/20 sm:hidden"
            onClick={onToggle}
          />
          <div
            className="fixed z-50 left-3 right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:absolute sm:left-auto sm:right-0 sm:bottom-auto sm:top-full sm:mt-2 sm:w-[min(20rem,calc(100vw-1.5rem))] paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container p-3 max-h-[70dvh] overflow-y-auto"
          >
          <p className="font-label text-[10px] text-on-surface-variant mb-3">Set Year</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="font-label text-[10px] text-on-surface-variant block mb-1">
                Academic Year
              </label>
              <div className="flex gap-2">
                <select
                  value={showYearInput ? "__add__" : academicYear}
                  onChange={(e) => onYearChange(e.target.value)}
                  className={`flex-1 min-w-0 ${selectClass}`}
                >
                  {allYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                  <option value="__add__">+ Add academic year...</option>
                </select>
                {!showYearInput && (
                  <button
                    type="button"
                    onClick={onDeleteYear}
                    aria-label={`Delete ${academicYear}`}
                    title={
                      canDeleteYear
                        ? `Delete ${academicYear}`
                        : "Add another year first to delete this one"
                    }
                    className={`shrink-0 px-2.5 py-2 hand-drawn-border font-label text-xs transition-colors ${
                      canDeleteYear
                        ? "border border-error text-error hover:bg-error-container"
                        : "border border-outline-variant text-on-surface-variant opacity-60"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm leading-none">delete</span>
                  </button>
                )}
              </div>
              {showYearInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newYearInput}
                    onChange={(e) => onNewYearInputChange(e.target.value)}
                    placeholder="e.g. 2026"
                    className={`flex-1 ${inputClass}`}
                  />
                  <button
                    type="button"
                    onClick={onAddYear}
                    className="px-3 py-2 bg-primary text-on-primary hand-drawn-border font-label text-xs"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={onCancelAddYear}
                    className="px-3 py-2 border border-outline text-on-surface-variant hand-drawn-border font-label text-xs hover:bg-surface-variant"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="font-label text-[10px] text-on-surface-variant block mb-1">
                Semester
              </label>
              <div className="flex gap-2">
                {([1, 2] as const).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onTermChange(term)}
                    className={`px-3 py-2 font-label text-xs hand-drawn-border transition-colors whitespace-nowrap ${
                      activeTerm === term
                        ? "bg-primary text-on-primary charcoal-shadow"
                        : "bg-surface-bright text-on-surface-variant hover:bg-surface-variant"
                    }`}
                  >
                    {term === 1 ? "First Sem" : "Second Sem"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
