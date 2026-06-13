import type { ReactNode } from "react";

export default function UnderDevelopmentOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div
        className="blur-[3px] opacity-50 pointer-events-none select-none"
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Fixed over main content — stays on top while scrolling */}
      <div
        className="fixed inset-0 z-40 pointer-events-auto"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-surface-bright/25 backdrop-blur-[1px]" />
      </div>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
        aria-live="polite"
      >
        <div className="paper-texture hand-drawn-border border-2 border-dashed border-error/50 px-6 sm:px-10 py-6 sm:py-8 text-center -rotate-3 charcoal-shadow-lg bg-surface-container/90 max-w-sm w-full pointer-events-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <p className="font-label text-[10px] tracking-[0.35em] text-error uppercase mb-3">
            Classified
          </p>
          <p className="font-headline text-2xl font-semibold text-primary mb-1">
            Under Development
          </p>
          <p className="font-body text-xs text-on-surface-variant">
            This section is not available yet.
          </p>
        </div>
      </div>
    </div>
  );
}
