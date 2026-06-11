import { useState, useRef, useEffect } from "react";
import type { PendingConfirmation } from "../context/LedgerUIContext";

interface NotificationBellProps {
  pendingItems?: PendingConfirmation[];
  onPendingClick?: () => void;
}

export default function NotificationBell({
  pendingItems = [],
  onPendingClick,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasPending = pendingItems.length > 0;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 bg-surface-bright paper-texture hand-drawn-border charcoal-shadow rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        title={hasPending ? "Classes needing confirmation" : "Notifications"}
      >
        <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
        {hasPending && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-error text-on-error text-[9px] font-label rounded-full flex items-center justify-center border-2 border-surface-bright">
            {pendingItems.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(18rem,calc(100vw-2rem))] paper-texture hand-drawn-border charcoal-shadow bg-surface-container p-3 z-50">
          <p className="font-label text-[10px] text-on-surface-variant mb-2">
            Needs confirmation
          </p>
          {hasPending ? (
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {pendingItems.map((item) => (
                <li key={`${item.subjectId}-${item.time}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onPendingClick?.();
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 text-left hover:bg-surface-variant rounded font-label text-[10px] transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary text-sm">
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.subjectName}</span>
                    <span className="text-on-surface-variant shrink-0">{item.time}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body text-xs text-on-surface-variant py-2">
              No classes need confirmation today.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
