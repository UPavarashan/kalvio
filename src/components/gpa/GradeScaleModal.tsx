import { useMemo, useState } from "react";
import {
  DEFAULT_GRADE_POINTS,
  GRADE_LABELS,
  GRADE_LETTERS,
  cloneGradeScale,
} from "../../utils/grades";
import ModalOverlay from "../ModalOverlay";

interface GradeScaleModalProps {
  gradePoints: Record<string, number>;
  onClose: () => void;
  onSave: (scale: Record<string, number>) => void;
}

const inputClass =
  "w-full px-3 py-2 bg-surface-bright hand-drawn-border font-label text-xs outline-none focus:bg-primary-fixed transition-colors text-right tabular-nums";

function roundPoint(value: number): number {
  return Math.round(Math.max(0, value) * 10) / 10;
}

export function GradeScaleModal({ gradePoints, onClose, onSave }: GradeScaleModalProps) {
  const initialDraft = useMemo(() => cloneGradeScale(gradePoints), [gradePoints]);
  const [draft, setDraft] = useState(initialDraft);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft]
  );

  const updatePoint = (grade: string, raw: string) => {
    const parsed = parseFloat(raw);
    setDraft((d) => ({
      ...d,
      [grade]: Number.isFinite(parsed) ? roundPoint(parsed) : 0,
    }));
  };

  const handleReset = () => {
    setDraft(cloneGradeScale(DEFAULT_GRADE_POINTS));
  };

  const handleSave = () => {
    onSave(cloneGradeScale(draft));
  };

  return (
    <ModalOverlay onClose={isDirty ? undefined : onClose}>
      <div className="paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container p-4 sm:p-6 w-full max-w-md">
        <h3 className="font-headline text-xl font-medium text-primary mb-2">
          Grade Scale
        </h3>
        <p className="font-label text-[10px] text-on-surface-variant mb-6">
          Set point values for each letter grade to match your university&apos;s scale.
        </p>

        <div className="space-y-2 mb-6">
          <div className="grid grid-cols-[2.5rem_1fr_5rem] gap-3 px-1 pb-1 font-label text-[10px] text-on-surface-variant uppercase tracking-wide">
            <span>Grade</span>
            <span>Label</span>
            <span className="text-right">Points</span>
          </div>
          {GRADE_LETTERS.map((grade) => (
            <div
              key={grade}
              className="grid grid-cols-[2.5rem_1fr_5rem] gap-3 items-center"
            >
              <span className="font-display text-lg text-primary">{grade}</span>
              <span className="font-label text-xs text-on-surface-variant">
                {GRADE_LABELS[grade]}
              </span>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={draft[grade] ?? 0}
                onChange={(e) => updatePoint(grade, e.target.value)}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant">
          <button
            type="button"
            onClick={handleSave}
            className="w-full px-4 py-2 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow"
          >
            Save Scale
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full px-4 py-2 border border-outline text-on-surface-variant hand-drawn-border font-label text-xs hover:bg-surface-variant transition-colors"
          >
            Reset to defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 border border-outline text-on-surface-variant hand-drawn-border font-label text-xs hover:bg-surface-variant transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
