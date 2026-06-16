import { useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import ModalOverlay from "./ModalOverlay";
import { useAuth } from "../context/AuthContext";
import { inputClass, selectClass } from "../utils/formClasses";
import { submitFeedback, type FeedbackType } from "../utils/feedback";

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [type, setType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setError("");
    setSubmitting(true);

    const result = await submitFeedback(user, type, message, location.pathname);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSent(true);
  };

  if (!user) return null;

  if (sent) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container p-5 sm:p-6 w-full">
          <div className="flex items-start gap-3 mb-4">
            <span className="material-symbols-outlined text-2xl text-primary shrink-0">
              check_circle
            </span>
            <div>
              <h2 className="font-headline text-xl font-medium text-primary">Thanks for your feedback</h2>
              <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">
                Your note was sent to Pavarashan. Honest feedback helps make Kalvio better.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClose={onClose}>
      <div className="paper-texture hand-drawn-border charcoal-shadow-lg bg-surface-container p-4 sm:p-6 w-full max-w-lg">
        <div className="flex items-start gap-3 mb-5">
          <span className="material-symbols-outlined text-2xl text-primary shrink-0">feedback</span>
          <div className="min-w-0">
            <h2 className="font-headline text-xl font-medium text-primary">Send feedback</h2>
            <p className="font-body text-sm text-on-surface-variant mt-1 leading-snug">
              Bugs, ideas, or anything that felt off — it goes straight to Pavarashan.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="feedback-type"
              className="font-label text-[10px] text-on-surface-variant block mb-1"
            >
              Type
            </label>
            <select
              id="feedback-type"
              value={type}
              onChange={(e) => setType(e.target.value as FeedbackType)}
              className={selectClass}
            >
              <option value="general">General feedback</option>
              <option value="bug">Bug report</option>
              <option value="idea">Feature idea</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="feedback-message"
              className="font-label text-[10px] text-on-surface-variant block mb-1"
            >
              Your message
            </label>
            <textarea
              id="feedback-message"
              required
              rows={5}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError("");
              }}
              className={`${inputClass} resize-y min-h-[7rem]`}
              placeholder="What happened? What would you like to see?"
            />
          </div>

          <p className="font-label text-[9px] text-on-surface-variant/80">
            Sending as {user.name || user.email}
            {user.name ? ` (${user.email})` : ""}
          </p>

          {error && (
            <p className="font-label text-xs text-error" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-outline text-on-surface-variant hand-drawn-border font-label text-xs hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-4 py-2.5 bg-primary text-on-primary hand-drawn-border font-label text-xs charcoal-shadow hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send feedback"}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}
