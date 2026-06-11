import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface PendingConfirmation {
  subjectId: string;
  subjectName: string;
  icon: string;
  date: string;
  time: string;
}

export interface LedgerPageActions {
  pendingCount: number;
  pendingItems: PendingConfirmation[];
  openAddSubject: () => void;
  scrollToConfirm: () => void;
}

interface LedgerUIContextValue {
  actions: LedgerPageActions | null;
  registerActions: (actions: LedgerPageActions | null) => void;
}

const LedgerUIContext = createContext<LedgerUIContextValue | null>(null);

export function LedgerUIProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<LedgerPageActions | null>(null);

  const registerActions = useCallback((next: LedgerPageActions | null) => {
    setActions(next);
  }, []);

  return (
    <LedgerUIContext.Provider value={{ actions, registerActions }}>
      {children}
    </LedgerUIContext.Provider>
  );
}

export function useLedgerUI() {
  const ctx = useContext(LedgerUIContext);
  if (!ctx) throw new Error("useLedgerUI must be used within LedgerUIProvider");
  return ctx;
}

export function useLedgerUIOptional() {
  return useContext(LedgerUIContext);
}
