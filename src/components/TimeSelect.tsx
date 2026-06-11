import { useMemo } from "react";
import { selectClassTime } from "../utils/formClasses";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

function parseTime(value: string): { hour: string; minute: string } {
  const [h, m] = value.split(":");
  const hourNum = parseInt(h ?? "", 10);
  const minuteNum = parseInt(m ?? "", 10);
  const hour = Number.isNaN(hourNum)
    ? "09"
    : String(Math.min(23, Math.max(0, hourNum))).padStart(2, "0");
  const minute = Number.isNaN(minuteNum)
    ? "00"
    : String(Math.min(59, Math.max(0, minuteNum))).padStart(2, "0");
  return { hour, minute };
}

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
}

export function TimeSelect({ value, onChange, "aria-label": ariaLabel }: TimeSelectProps) {
  const { hour, minute } = parseTime(value);
  const minuteOptions = useMemo(() => {
    if (MINUTES.includes(minute)) return MINUTES;
    return [...MINUTES, minute].sort();
  }, [minute]);

  return (
    <div className="flex items-center gap-1 min-w-0" role="group" aria-label={ariaLabel}>
      <select
        value={hour}
        onChange={(e) => onChange(`${e.target.value}:${minute}`)}
        className={selectClassTime}
        aria-label={ariaLabel ? `${ariaLabel}, hour` : "Hour"}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="font-label text-xs text-on-surface-variant shrink-0">:</span>
      <select
        value={minute}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        className={selectClassTime}
        aria-label={ariaLabel ? `${ariaLabel}, minute` : "Minute"}
      >
        {minuteOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
