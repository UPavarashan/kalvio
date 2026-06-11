import { useMemo, useState } from "react";
import type { ClassSession, LedgerSubject } from "../../types/ledger";
import { formatTimeShort } from "../../types/ledger";
import {
  buildMonthCalendarCells,
  calendarDayKey,
  formatDisplayDate,
  getCalendarSessions,
  isSameCalendarDay,
} from "../../utils/ledger";

interface LedgerCalendarModalProps {
  subjects: LedgerSubject[];
  onClose: () => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sessionStatusStyles(status: ClassSession["status"]): string {
  switch (status) {
    case "present":
      return "bg-primary-fixed text-primary border-primary/30";
    case "absent":
      return "bg-error-container text-error border-error/30";
    case "excused":
      return "bg-secondary-fixed text-secondary border-secondary/30";
    case "cancelled":
      return "bg-surface-variant text-on-surface-variant border-outline-variant line-through opacity-60";
    default:
      return "bg-surface-bright text-on-surface-variant border-outline-variant border-dashed";
  }
}

function SessionStatusLabel({ status }: { status: ClassSession["status"] }) {
  const labels: Record<ClassSession["status"], string> = {
    present: "P",
    absent: "A",
    excused: "E",
    scheduled: "S",
    cancelled: "C",
  };
  return <>{labels[status]}</>;
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-inverse-surface/40"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function LedgerCalendarModal({ subjects, onClose }: LedgerCalendarModalProps) {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    return now;
  }, []);

  const allSessions = useMemo(() => getCalendarSessions(subjects), [subjects]);

  const [viewMonth, setViewMonth] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [selectedDay, setSelectedDay] = useState<Date>(today);

  const monthCells = useMemo(
    () => buildMonthCalendarCells(viewMonth.year, viewMonth.month),
    [viewMonth.year, viewMonth.month]
  );

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, typeof allSessions>();
    for (const item of allSessions) {
      const key = calendarDayKey(item.date);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [allSessions]);

  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  const selectedKey = calendarDayKey(selectedDay);
  const selectedSessions = sessionsByDay.get(selectedKey) ?? [];

  const shiftMonth = (delta: number) => {
    setViewMonth((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const goToToday = () => {
    setViewMonth({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDay(today);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-4 shrink-0 border-b border-outline-variant">
          <div>
            <h3 className="font-headline text-xl font-medium text-primary">Calendar</h3>
            <p className="font-body text-sm text-on-surface-variant mt-1">
              All scheduled classes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="p-2 hover:bg-surface-variant rounded hand-drawn-border"
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <span className="font-headline text-lg font-medium text-primary min-w-[160px] text-center">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="p-2 hover:bg-surface-variant rounded hand-drawn-border"
              aria-label="Next month"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="px-3 py-1.5 font-label text-[10px] border border-primary text-primary hand-drawn-border hover:bg-primary-fixed transition-colors"
            >
              Today
            </button>
            <button type="button" onClick={onClose} className="p-2 hover:bg-surface-variant rounded">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-4">
          <div className="grid grid-cols-7 gap-px bg-outline-variant/40 border border-outline-variant hand-drawn-border overflow-hidden">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="bg-surface-container-high py-2 text-center font-label text-[10px] text-on-surface-variant"
              >
                {day}
              </div>
            ))}

            {monthCells.map((cellDate) => {
              const inCurrentMonth = cellDate.getMonth() === viewMonth.month;
              const isToday = isSameCalendarDay(cellDate, today);
              const isSelected = isSameCalendarDay(cellDate, selectedDay);
              const daySessions = sessionsByDay.get(calendarDayKey(cellDate)) ?? [];

              return (
                <button
                  key={cellDate.toISOString()}
                  type="button"
                  onClick={() => setSelectedDay(cellDate)}
                  className={`min-h-[88px] p-1.5 text-left bg-surface-container transition-colors hover:bg-surface-container-high flex flex-col gap-1 ${
                    !inCurrentMonth ? "opacity-45" : ""
                  } ${isSelected ? "ring-2 ring-inset ring-primary" : ""}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 font-label text-[11px] shrink-0 ${
                      isToday
                        ? "rounded-full bg-primary text-on-primary font-bold"
                        : inCurrentMonth
                          ? "text-on-surface"
                          : "text-on-surface-variant"
                    }`}
                  >
                    {cellDate.getDate()}
                  </span>

                  <div className="space-y-0.5 overflow-hidden flex-1">
                    {daySessions.slice(0, 3).map(({ subject, session }) => (
                      <div
                        key={session.id}
                        className={`truncate px-1 py-px font-label text-[8px] border ${sessionStatusStyles(session.status)}`}
                        title={`${subject.name} · ${formatTimeShort(session.time)} · ${session.status}`}
                      >
                        {formatTimeShort(session.time)} {subject.name}
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <p className="font-label text-[8px] text-primary px-1">
                        +{daySessions.length - 3} more
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 font-label text-[9px] text-on-surface-variant">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-primary-fixed border border-primary/30" />
              Present
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-error-container border border-error/30" />
              Absent
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-secondary-fixed border border-secondary/30" />
              Excused
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-surface-bright border border-dashed border-outline-variant" />
              Scheduled
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 bg-surface-variant border border-outline-variant opacity-60" />
              Cancelled
            </span>
          </div>
        </div>

        <div className="shrink-0 border-t border-outline-variant px-4 py-3 bg-surface-container-high">
          <p className="font-label text-[9px] text-on-surface-variant mb-1.5">
            {formatDisplayDate(selectedDay)}
            {isSameCalendarDay(selectedDay, today) && (
              <span className="ml-1.5 text-primary">· Today</span>
            )}
            {selectedSessions.length > 0 && (
              <span className="ml-1.5">· {selectedSessions.length} classes</span>
            )}
          </p>

          {selectedSessions.length === 0 ? (
            <p className="font-label text-[10px] text-on-surface-variant">No classes on this day.</p>
          ) : (
            <div className="space-y-0.5 max-h-44 overflow-y-auto">
              {selectedSessions.map(({ subject, session }) => (
                <div
                  key={session.id}
                  className={`flex items-center gap-1.5 px-2 py-0.5 min-h-[18px] hand-drawn-border ${sessionStatusStyles(session.status)}`}
                  title={`${subject.name} · ${formatTimeShort(session.time)} · ${session.status}`}
                >
                  <span className="size-3.5 shrink-0 inline-flex items-center justify-center overflow-hidden">
                    <span
                      className="material-symbols-outlined text-[12px] leading-none block"
                      style={{
                        fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 20',
                      }}
                    >
                      {subject.icon}
                    </span>
                  </span>
                  <span className="font-label text-[9px] truncate min-w-0 flex-1">
                    {subject.name}
                  </span>
                  <span className="font-label text-[9px] tabular-nums shrink-0 w-9 text-right">
                    {formatTimeShort(session.time)}
                  </span>
                  <span className="font-label text-[9px] font-bold shrink-0 w-3 text-right">
                    <SessionStatusLabel status={session.status} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
