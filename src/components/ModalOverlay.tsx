import type { ReactNode } from "react";

interface ModalOverlayProps {
  children: ReactNode;
  onClose?: () => void;
}

export default function ModalOverlay({ children, onClose }: ModalOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-inverse-surface/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[min(100%,var(--modal-max,32rem))] max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.5rem))] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
