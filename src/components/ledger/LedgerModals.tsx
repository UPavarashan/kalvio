import { useMemo, useState } from "react";
import type { ClassSession, LedgerSubject, ScheduleSlot } from "../../types/ledger";
import {
  DAYS_OF_WEEK,
  SUBJECT_ICONS,
  DEFAULT_PASS_PERCENTAGE,
  dayLabel,
  formatScheduleSummary,
  sessionStatusToLogStatus,
} from "../../types/ledger";
import { buildSubjectFromForm, createDefaultSlot, formatDisplayDate, formatSessionDateTime, getDefaultRecurringRange, getEditablePastSessions, parseInputDate } from "../../utils/ledger";
import { inputClass, selectClass } from "../../utils/formClasses";
import { TimeSelect } from "../TimeSelect";

interface SubjectFormModalProps {
  mode: "add" | "edit";
  subject: Partial<LedgerSubject> & { name: string };
  onClose: () => void;
  onSave: (subject: LedgerSubject) => void;
  onDeleteSubject?: () => void;
}

function cloneDraft(subject: Partial<LedgerSubject> & { name: string }) {
  const defaultRange = getDefaultRecurringRange();
  return {
    id: subject.id,
    name: subject.name ?? "",
    icon: subject.icon ?? "touch_app",
    recurringWeekly: subject.recurringWeekly ?? true,
    recurringFrom: subject.recurringFrom || defaultRange.from,
    recurringUntil: subject.recurringUntil || defaultRange.until,
    schedules: subject.schedules?.length
      ? subject.schedules.map((s) => ({ ...s }))
      : [createDefaultSlot()],
    sessions: subject.sessions?.map((s) => ({ ...s })) ?? [],
    passPercentage: subject.passPercentage ?? DEFAULT_PASS_PERCENTAGE,
  };
}

export function SubjectFormModal({
  mode,
  subject,
  onClose,
  onSave,
  onDeleteSubject,
}: SubjectFormModalProps) {
  const initialDraft = useMemo(() => cloneDraft(subject), [subject]);
  const [draft, setDraft] = useState(initialDraft);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft]
  );

  const updateSchedule = (slotId: string, patch: Partial<ScheduleSlot>) => {
    setDraft((d) => ({
      ...d,
      schedules: d.schedules.map((s) => (s.id === slotId ? { ...s, ...patch } : s)),
    }));
  };

  const addSchedule = () => {
    setDraft((d) => ({ ...d, schedules: [...d.schedules, createDefaultSlot()] }));
  };

  const removeSchedule = (slotId: string) => {
    setDraft((d) => ({
      ...d,
      schedules: d.schedules.length > 1 ? d.schedules.filter((s) => s.id !== slotId) : d.schedules,
    }));
  };

  const updateSessionStatus = (sessionId: string, status: ClassSession["status"]) => {
    setDraft((d) => ({
      ...d,
      sessions: d.sessions.map((s) => (s.id === sessionId ? { ...s, status } : s)),
    }));
  };

  const pastSessions = useMemo(
    () => (mode === "edit" ? getEditablePastSessions(draft as LedgerSubject) : []),
    [draft, mode]
  );

  const handleSave = () => {
    if (!draft.name.trim()) return;
    onSave(buildSubjectFromForm(draft, mode));
  };

  const handleLeaveWithoutSaving = () => {
    onClose();
  };

  return (
    <ModalOverlay onClose={isDirty ? undefined : onClose}>
      <div className="paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-xl font-medium text-primary">
            {mode === "add" ? "Add Subject" : "Edit Subject"}
          </h3>
        </div>

        <div className="space-y-4">
          <FormField label="Subject Name">
            <input
              required
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className={inputClass}
              placeholder="Human Computer Interaction"
            />
          </FormField>

          <FormField label="Pass Percentage">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={draft.passPercentage}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    passPercentage: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                  }))
                }
                className={`${inputClass} w-24`}
              />
              <span className="font-label text-xs text-on-surface-variant">% needed to pass</span>
            </div>
          </FormField>

          <FormField label="Class Times">
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_28px] gap-2 font-label text-[10px] text-on-surface-variant">
                <span>Day</span>
                <span>Time</span>
                <span />
              </div>
              {draft.schedules.map((slot) => (
                <div key={slot.id} className="grid grid-cols-[1fr_1fr_28px] gap-2 items-center">
                  <select
                    value={slot.dayOfWeek}
                    onChange={(e) => updateSchedule(slot.id, { dayOfWeek: e.target.value })}
                    className={selectClass}
                    aria-label="Day of week"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {dayLabel(d)}
                      </option>
                    ))}
                  </select>
                  <TimeSelect
                    value={slot.time}
                    onChange={(time) => updateSchedule(slot.id, { time })}
                    aria-label="Class time"
                  />
                  <button
                    type="button"
                    onClick={() => removeSchedule(slot.id)}
                    className="p-1 text-on-surface-variant hover:text-error justify-self-center"
                    title="Remove time slot"
                    disabled={draft.schedules.length <= 1}
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSchedule}
                className="flex items-center gap-1 font-label text-[10px] text-primary hover:underline pt-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add another time
              </button>
            </div>
          </FormField>

          <label className="flex items-center gap-3 font-label text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={draft.recurringWeekly}
              onChange={(e) => setDraft((d) => ({ ...d, recurringWeekly: e.target.checked }))}
              className="rounded border-primary"
            />
            Repeats weekly
          </label>

          {draft.recurringWeekly && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="From">
                <input
                  type="date"
                  value={draft.recurringFrom}
                  onChange={(e) => setDraft((d) => ({ ...d, recurringFrom: e.target.value }))}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Until">
                <input
                  type="date"
                  value={draft.recurringUntil}
                  onChange={(e) => setDraft((d) => ({ ...d, recurringUntil: e.target.value }))}
                  className={inputClass}
                />
              </FormField>
            </div>
          )}

          {mode === "edit" && (
            <FormField label="Past Classes">
              <p className="font-label text-[10px] text-on-surface-variant mb-2">
                Update attendance for classes that already happened — including ones you never
                confirmed or marked incorrectly.
              </p>
              {pastSessions.length === 0 ? (
                <p className="font-label text-[10px] text-on-surface-variant italic">
                  No past classes yet. They will appear here after class dates pass.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr] gap-2 font-label text-[10px] text-on-surface-variant">
                    <span>Class</span>
                    <span>Attendance</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1.5 border border-outline-variant rounded p-2">
                    {pastSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`grid grid-cols-[1fr_1fr] gap-2 items-center ${
                          session.status === "cancelled" ? "opacity-70" : ""
                        }`}
                      >
                        <span
                          className="font-label text-[10px] truncate"
                          title={formatSessionDateTime(session.date, session.time)}
                        >
                          {formatSessionDateTime(session.date, session.time)}
                        </span>
                        <select
                          value={session.status}
                          onChange={(e) =>
                            updateSessionStatus(
                              session.id,
                              e.target.value as ClassSession["status"]
                            )
                          }
                          className={selectClass}
                          aria-label={`Attendance for ${formatSessionDateTime(session.date, session.time)}`}
                        >
                          <option value="scheduled">Not confirmed</option>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="excused">Excused</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FormField>
          )}

          <FormField label="Icon">
            <div className="grid grid-cols-6 gap-2">
              {SUBJECT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, icon }))}
                  className={`p-2 hand-drawn-border flex items-center justify-center transition-colors ${
                    draft.icon === icon
                      ? "bg-primary text-on-primary"
                      : "bg-surface-bright hover:bg-surface-variant text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </button>
              ))}
            </div>
          </FormField>

          <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant">
            <button
              type="button"
              onClick={handleSave}
              className="w-full px-4 py-2 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow"
            >
              {mode === "add" ? "Add Subject" : "Save & Close"}
            </button>
            <button
              type="button"
              onClick={handleLeaveWithoutSaving}
              className="w-full px-4 py-2 border border-outline text-on-surface-variant hand-drawn-border font-label text-xs hover:bg-surface-variant transition-colors"
            >
              Leave without saving
            </button>
            {mode === "edit" && onDeleteSubject && (
              <button
                type="button"
                onClick={onDeleteSubject}
                className="w-full px-4 py-2 border border-error text-error hand-drawn-border font-label text-xs hover:bg-error-container transition-colors"
              >
                Delete subject
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

interface LedgerLogModalProps {
  log: { id: string; date: string; subject: string; time?: string; status: string }[];
  onClose: () => void;
}

export function LedgerLogModal({ log, onClose }: LedgerLogModalProps) {
  const [dateFilter, setDateFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statFilter, setStatFilter] = useState("all");

  const subjectOptions = useMemo(
    () => [...new Set(log.map((entry) => entry.subject))].sort(),
    [log]
  );

  const filtered = useMemo(() => {
    let dateDisplay = "";
    if (dateFilter) {
      const parsed = parseInputDate(dateFilter);
      if (parsed) dateDisplay = formatDisplayDate(parsed);
    }

    return log.filter((entry) => {
      if (dateDisplay && entry.date !== dateDisplay) return false;
      if (subjectFilter !== "all" && entry.subject !== subjectFilter) return false;
      if (statFilter !== "all" && entry.status !== statFilter) return false;
      return true;
    });
  }, [log, dateFilter, subjectFilter, statFilter]);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 pb-4 shrink-0">
          <div>
            <h3 className="font-headline text-xl font-medium text-primary">Full Ledger Log</h3>
            <p className="font-body text-sm text-on-surface-variant mt-1">
              Every past class recorded
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-surface-variant rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {log.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-6 pb-3 shrink-0">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={inputClass}
              aria-label="Filter by date"
            />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className={selectClass}
              aria-label="Filter by subject"
            >
              <option value="all">All subjects</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select
              value={statFilter}
              onChange={(e) => setStatFilter(e.target.value)}
              className={selectClass}
              aria-label="Filter by stat"
            >
              <option value="all">All stats</option>
              <option value="P">Present</option>
              <option value="A">Absent</option>
              <option value="E">Excused</option>
              <option value="C">Cancelled</option>
            </select>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
          {log.length === 0 ? (
            <p className="font-body text-on-surface-variant text-center py-8">No entries yet.</p>
          ) : filtered.length === 0 ? (
            <p className="font-body text-on-surface-variant text-center py-8">
              No entries match your filters.
            </p>
          ) : (
            <table className="w-full table-fixed border-collapse">
              <thead className="sticky top-0 z-10 bg-surface-container">
                <tr className="font-label text-[10px] text-on-surface-variant border-b border-outline-variant">
                  <th className="text-left pb-2 pr-2 font-normal w-[88px]">Date</th>
                  <th className="text-left pb-2 pr-2 font-normal">Subject</th>
                  <th className="text-left pb-2 pr-2 font-normal w-[64px]">Time</th>
                  <th className="text-right pb-2 font-normal w-[40px]">Stat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="font-label text-xs hover:bg-surface-variant"
                  >
                    <td className="py-1.5 pr-2 truncate">{entry.date}</td>
                    <td className="py-1.5 pr-2 truncate">{entry.subject}</td>
                    <td className="py-1.5 pr-2 truncate">{entry.time ?? "—"}</td>
                    <td className="py-1.5 text-right">
                      <LogStatChar status={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

function LogStatChar({ status }: { status: string }) {
  const styles: Record<string, string> = {
    P: "text-primary font-bold",
    A: "text-error font-bold",
    E: "text-secondary font-bold",
    C: "text-on-surface-variant line-through",
  };
  return <span className={styles[status] ?? ""}>{status}</span>;
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-label text-[10px] text-on-surface-variant block mb-1">{label}</label>
      {children}
    </div>
  );
}

export { formatScheduleSummary, sessionStatusToLogStatus };
