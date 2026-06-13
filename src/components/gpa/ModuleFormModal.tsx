import { useMemo, useState } from "react";
import type { Module } from "../../data/mockData";
import { SUBJECT_ICONS } from "../../types/ledger";
import { getGradeOptions, iconBgForIndex } from "../../utils/grades";
import { inputClass, selectClass } from "../../utils/formClasses";
import ModalOverlay from "../ModalOverlay";

interface ModuleFormModalProps {
  mode: "add" | "edit";
  module: Partial<Module> & { name: string };
  gradePoints: Record<string, number>;
  onClose: () => void;
  onSave: (module: Module) => void;
  onDelete?: () => void;
}

function cloneDraft(module: Partial<Module> & { name: string }) {
  const icon = module.icon ?? "code";
  const iconIndex = SUBJECT_ICONS.indexOf(icon as (typeof SUBJECT_ICONS)[number]);
  return {
    id: module.id,
    name: module.name ?? "",
    credits: module.credits ?? 3,
    grade: module.grade ?? "B",
    icon,
    iconBg: module.iconBg ?? iconBgForIndex(iconIndex >= 0 ? iconIndex : 0),
  };
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-label text-xs text-on-surface-variant block mb-1">{label}</label>
      {children}
    </div>
  );
}

export function ModuleFormModal({
  mode,
  module,
  gradePoints,
  onClose,
  onSave,
  onDelete,
}: ModuleFormModalProps) {
  const initialDraft = useMemo(() => cloneDraft(module), [module]);
  const [draft, setDraft] = useState(initialDraft);
  const gradeOptions = useMemo(() => getGradeOptions(gradePoints), [gradePoints]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft]
  );

  const previewPoints = gradePoints[draft.grade] ?? 0;

  const handleSave = () => {
    if (!draft.name.trim() || draft.credits < 1) return;
    if (gradePoints[draft.grade] === undefined) return;

    onSave({
      id: draft.id ?? crypto.randomUUID(),
      name: draft.name.trim(),
      credits: draft.credits,
      grade: draft.grade,
      icon: draft.icon,
      iconBg: draft.iconBg,
    });
  };

  return (
    <ModalOverlay onClose={isDirty ? undefined : onClose}>
      <div className="paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container p-4 sm:p-6 w-full max-w-lg">
        <h3 className="font-headline text-xl font-medium text-primary mb-6">
          {mode === "add" ? "Add Module" : "Edit Module"}
        </h3>

        <div className="space-y-4">
          <FormField label="Module Name">
            <input
              required
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className={inputClass}
              placeholder="Database Systems"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Credits">
              <input
                type="number"
                min={1}
                max={12}
                value={draft.credits}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    credits: Math.max(1, Math.min(12, Number(e.target.value) || 1)),
                  }))
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Grade">
              <select
                value={draft.grade}
                onChange={(e) => setDraft((d) => ({ ...d, grade: e.target.value }))}
                className={selectClass}
              >
                {gradeOptions.map(({ grade, points }) => (
                  <option key={grade} value={grade}>
                    {grade} ({points.toFixed(1)} pts)
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <p className="font-label text-[10px] text-on-surface-variant">
            Grade points for this module:{" "}
            <span className="text-primary font-bold">{previewPoints.toFixed(1)}</span> ×{" "}
            {draft.credits} credits ={" "}
            <span className="text-primary font-bold">
              {(previewPoints * draft.credits).toFixed(1)}
            </span>{" "}
            quality points
          </p>

          <FormField label="Icon">
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {SUBJECT_ICONS.map((icon, index) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      icon,
                      iconBg: iconBgForIndex(index),
                    }))
                  }
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
              {mode === "add" ? "Add Module" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 border border-outline text-on-surface-variant hand-drawn-border font-label text-xs hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="w-full px-4 py-2 border border-error text-error hand-drawn-border font-label text-xs hover:bg-error-container transition-colors"
              >
                Delete module
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
