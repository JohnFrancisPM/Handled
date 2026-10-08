import { create } from "zustand";

/**
 * Ephemeral UI state (project-setup.md: zustand for open panels/filters). Not
 * persisted — reset on reload. Server data lives in TanStack Query, not here.
 */
type UiState = {
  inboxStatusFilter: string; // "" = all
  setInboxStatusFilter: (status: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  inboxStatusFilter: "",
  setInboxStatusFilter: (status) => set({ inboxStatusFilter: status })
}));
