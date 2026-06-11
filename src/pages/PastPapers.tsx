import { PAST_PAPERS, PAST_PAPER_FILTERS } from "../data/mockData";
import UnderDevelopmentOverlay from "../components/UnderDevelopmentOverlay";

export default function PastPapers() {
  return (
    <UnderDevelopmentOverlay>
    <div className="space-y-8 pb-16">
      <section>
        <h2 className="font-headline text-2xl sm:text-3xl font-semibold text-primary ink-underline inline-block">
          Past Papers
        </h2>
        <p className="font-body text-on-surface-variant mt-4 max-w-xl">
          Browse and download previous exam papers to prepare for your upcoming assessments.
        </p>
      </section>

      <section className="flex gap-4 flex-wrap">
        {PAST_PAPER_FILTERS.map((filter, i) => (
          <button
            key={filter}
            type="button"
            className={`px-4 py-2 font-label text-xs hand-drawn-border transition-colors ${
              i === 0
                ? "bg-primary text-on-primary charcoal-shadow"
                : "bg-surface-bright text-on-surface-variant hover:bg-surface-variant"
            }`}
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PAST_PAPERS.map((paper) => (
          <div
            key={paper.id}
            className="paper-texture hand-drawn-border p-6 bg-surface-bright charcoal-shadow hover:-translate-y-1 transition-transform"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary-fixed rounded-lg border border-primary/20">
                <span className="material-symbols-outlined text-primary">
                  description
                </span>
              </div>
              <span className="font-label text-xs text-on-surface-variant">
                {paper.year}
              </span>
            </div>
            <h4 className="font-headline text-xl font-medium mb-2">{paper.title}</h4>
            <p className="font-label text-xs text-on-surface-variant mb-4">
              {paper.course}
            </p>
            <div className="flex justify-between items-center">
              <span className="font-label text-[10px] text-on-surface-variant">
                {paper.downloads} downloads
              </span>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow hover:translate-y-0.5 transition-transform"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Download
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
    </UnderDevelopmentOverlay>
  );
}
