import { create } from "zustand";
import type { Action } from "@/lib/types";
import type { Customer } from "@/lib/fixtures/types";

/** A turn created THIS session (not from the fixture). Nothing is persisted. */
export interface LiveTurn {
  role: "user" | "assistant";
  content: string;
  intent?: string | null;
  agent?: string | null;
  actions?: Action[] | null;
  pending?: boolean; // true while awaiting the webhook (typing indicator)
  mocked?: boolean;
  error?: boolean; // true => render as ErrorBubble, not a chat reply
  ts: number; // Date.now() for ordering within the live tail
}

interface SessionState {
  activeCustomerId: string | null;
  adHocCustomers: Customer[]; // "new customers" created this session (not persisted, no fixture row)
  liveTurns: Record<string, LiveTurn[]>; // keyed by customerId; appended after fixture history
  setActiveCustomer: (id: string) => void;
  addAdHocCustomer: (customer: Customer) => void;
  appendTurn: (customerId: string, turn: LiveTurn) => void;
  updateLastPending: (customerId: string, patch: Partial<LiveTurn>) => void;
  resetThread: (customerId: string) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeCustomerId: null,
  adHocCustomers: [],
  liveTurns: {},
  setActiveCustomer: (id) => set({ activeCustomerId: id }),
  // newest first, so a freshly created customer lands at the top of the roster
  addAdHocCustomer: (customer) => set((s) => ({ adHocCustomers: [customer, ...s.adHocCustomers] })),
  appendTurn: (customerId, turn) =>
    set((s) => ({
      liveTurns: { ...s.liveTurns, [customerId]: [...(s.liveTurns[customerId] ?? []), turn] }
    })),
  updateLastPending: (customerId, patch) =>
    set((s) => {
      const turns = s.liveTurns[customerId] ?? [];
      // resolve the most recent pending placeholder (the assistant typing bubble)
      let idx = -1;
      for (let i = turns.length - 1; i >= 0; i--) {
        if (turns[i]?.pending) {
          idx = i;
          break;
        }
      }
      const existing = idx === -1 ? undefined : turns[idx];
      if (!existing) return {};
      const updated = turns.slice();
      updated[idx] = { ...existing, ...patch };
      return { liveTurns: { ...s.liveTurns, [customerId]: updated } };
    }),
  resetThread: (customerId) =>
    set((s) => {
      const next = { ...s.liveTurns };
      delete next[customerId];
      return { liveTurns: next };
    })
}));
