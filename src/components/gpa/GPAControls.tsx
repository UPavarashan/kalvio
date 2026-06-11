import {
  formatAcademicYearLedger,
  getSemestersForYear,
  seasonFromTermNumber,
} from "../../utils/gpaSemesters";

import { selectClass } from "../../utils/formClasses";

interface GPAControlsProps {
  expanded: boolean;
  summary: string;
  onToggle: () => void;
  academicYear: string;
  academicYears: { id: string; label: string }[];
  activeTerm: 1 | 2;
  onYearChange: (yearId: string) => void;
  onTermChange: (term: 1 | 2) => void;
}

export function GPAControls({
  expanded,
  summary,
  onToggle,
  academicYear,
  academicYears,
  activeTerm,
  onYearChange,
  onTermChange,
}: GPAControlsProps) {
  const semestersInYear = getSemestersForYear(academicYear);
  const hasTerm = (term: 1 | 2) =>
    semestersInYear.some((s) => s.season === seasonFromTermNumber(term));

  return (
    <div className="paper-texture hand-drawn-border charcoal-shadow bg-surface-container overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-1.5 hover:bg-surface-container-high transition-colors text-left"
      >
        <span className="font-label text-[10px] text-on-surface truncate">
          {expanded ? "Set Year" : summary}
        </span>
        <span className="material-symbols-outlined text-primary text-base shrink-0">
          {expanded ? "expand_less" : "expand_more"}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 flex flex-col sm:flex-row gap-3 sm:items-end border-t border-outline-variant pt-3">
          <div className="flex-1">
            <label className="font-label text-[10px] text-on-surface-variant block mb-1">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => onYearChange(e.target.value)}
              className={selectClass}
            >
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {formatAcademicYearLedger(year.id)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="font-label text-[10px] text-on-surface-variant block mb-1">
              Semester
            </label>
            <div className="flex gap-2">
              {([1, 2] as const).map((term) => {
                const available = hasTerm(term);
                return (
                  <button
                    key={term}
                    type="button"
                    disabled={!available}
                    onClick={() => onTermChange(term)}
                    className={`flex-1 px-3 py-2 font-label text-xs hand-drawn-border transition-colors ${
                      activeTerm === term
                        ? "bg-primary text-on-primary charcoal-shadow"
                        : available
                          ? "bg-surface-bright text-on-surface-variant hover:bg-surface-variant"
                          : "bg-surface-bright text-on-surface-variant/40 cursor-not-allowed"
                    }`}
                  >
                    {term === 1 ? "First Sem" : "Second Sem"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
