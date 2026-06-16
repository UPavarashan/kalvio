import { useState } from "react";
import FeedbackModal from "./FeedbackModal";

export default function FeedbackFooter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer className="mt-6 sm:mt-10 pt-4 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pb-2">
        <p className="font-label text-[10px] text-on-surface-variant/70">
          Kalvio is in early beta — your feedback shapes what we build next.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 font-label text-[10px] text-primary hand-drawn-border bg-surface-bright hover:bg-primary-fixed transition-colors shrink-0 min-h-[2.75rem]"
        >
          <span className="material-symbols-outlined text-sm">feedback</span>
          Send feedback
        </button>
      </footer>
      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  );
}
