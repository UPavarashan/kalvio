import ModalOverlay from "./ModalOverlay";
import { CURRENT_CHANGELOG, markChangelogSeen } from "../config/changelog";

interface WhatsNewModalProps {
  onClose: () => void;
}

export default function WhatsNewModal({ onClose }: WhatsNewModalProps) {
  const handleClose = () => {
    markChangelogSeen();
    onClose();
  };

  return (
    <ModalOverlay onClose={handleClose}>
      <div className="paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container p-5 sm:p-6 w-full">
        <div className="flex items-start gap-3 mb-4">
          <span className="material-symbols-outlined text-2xl text-primary shrink-0">
            new_releases
          </span>
          <div className="min-w-0">
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wide">
              {CURRENT_CHANGELOG.date} · v{CURRENT_CHANGELOG.version}
            </p>
            <h2 className="font-headline text-xl font-medium text-primary mt-1">
              {CURRENT_CHANGELOG.title}
            </h2>
          </div>
        </div>

        <ul className="space-y-2.5 mb-6">
          {CURRENT_CHANGELOG.items.map((item) => (
            <li
              key={item}
              className="flex gap-2 font-body text-sm text-on-surface-variant leading-snug"
            >
              <span className="text-primary shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleClose}
          className="w-full px-4 py-2.5 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow hover:opacity-90 transition-opacity"
        >
          Got it
        </button>
      </div>
    </ModalOverlay>
  );
}
