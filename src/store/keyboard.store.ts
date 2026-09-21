/**
 * Keyboard Store — spec §37 (UI State)
 *
 * Tracks the active shortcut context so the keyboard hook knows
 * which binding set to apply.
 *
 * Panels update this when they receive/lose active focus relevance.
 */

import { create } from 'zustand';
import type { ShortcutContext } from '@/config/shortcuts';

interface KeyboardState {
  activeContext: ShortcutContext;
  setContext: (context: ShortcutContext) => void;
}

export const useKeyboardStore = create<KeyboardState>((set) => ({
  activeContext: 'operator',
  setContext: (context) => set({ activeContext: context }),
}));
