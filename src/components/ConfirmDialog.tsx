import ModalOverlay from "./ModalOverlay";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  hideCancel?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  hideCancel = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div className="paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container p-5 sm:p-6 w-full">
        <div className="flex items-start gap-3 mb-4">
          <span
            className={`material-symbols-outlined text-2xl shrink-0 ${
              destructive ? "text-error" : "text-primary"
            }`}
          >
            {destructive ? "warning" : "info"}
          </span>
          <div className="min-w-0">
            <h3 className="font-headline text-lg sm:text-xl font-medium text-primary">{title}</h3>
            <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">{message}</p>
          </div>
        </div>

        <div
          className={`flex gap-2 pt-2 border-t border-outline-variant ${
            hideCancel ? "justify-end" : "flex-col-reverse sm:flex-row sm:justify-end"
          }`}
        >
          {!hideCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 border border-outline text-on-surface-variant hand-drawn-border font-label text-xs hover:bg-surface-variant transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full sm:w-auto px-4 py-2.5 hand-drawn-border font-label text-xs charcoal-shadow transition-opacity hover:opacity-90 ${
              destructive
                ? "bg-error text-on-error"
                : "bg-primary text-on-primary"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
