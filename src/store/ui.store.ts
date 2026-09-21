/**
 * UI Store — spec §37 (UI State)
 *
 * Manages transient UI state: which panels are open, active modals, etc.
 * Does NOT contain application or presentation state.
 */

import { create } from 'zustand';

export type ActiveModal =
  | 'add-song'
  | 'add-scripture'
  | 'add-text'
  | 'add-image'
  | 'add-video'
  | 'service-settings'
  | 'shortcuts'
  | null;

interface UIState {
  /** Is the service panel (left sidebar) expanded? */
  isServicePanelOpen: boolean;
  /** Is the control panel (right sidebar) expanded? */
  isControlPanelOpen: boolean;
  /** Which modal (if any) is currently open */
  activeModal: ActiveModal;
  /** Currently active tab within the control panel */
  controlPanelTab: 'scripture' | 'layout' | 'background' | 'media';

  // Actions
  toggleServicePanel: () => void;
  toggleControlPanel: () => void;
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  setControlPanelTab: (tab: UIState['controlPanelTab']) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isServicePanelOpen: true,
  isControlPanelOpen: true,
  activeModal: null,
  controlPanelTab: 'scripture',

  toggleServicePanel: () =>
    set((s) => ({ isServicePanelOpen: !s.isServicePanelOpen })),

  toggleControlPanel: () =>
    set((s) => ({ isControlPanelOpen: !s.isControlPanelOpen })),

  openModal: (modal) => set({ activeModal: modal }),

  closeModal: () => set({ activeModal: null }),

  setControlPanelTab: (tab) => set({ controlPanelTab: tab }),
}));
