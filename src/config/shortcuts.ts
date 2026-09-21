/**
 * Keyboard Shortcut Map — spec §28
 *
 * Single source of truth for all keyboard shortcut bindings.
 * Exported for:
 *  - useKeyboard hook (runtime binding)
 *  - Shortcuts help dialog (documentation)
 *  - Future shortcut customization settings
 *
 * Key format: modifier keys joined with '+', then the key.
 * Use lowercase letters. Special keys: 'arrowleft', 'arrowright', etc.
 *
 * Examples:
 *   'arrowright'      — Right arrow, no modifiers
 *   'shift+b'         — Shift + B
 *   'meta+shift+l'    — Cmd/Win + Shift + L
 */

import type { PresentationAction } from '@/actions/presentation.actions';

export type ShortcutContext = 'global' | 'operator' | 'scripture' | 'lyrics';

export interface ShortcutBinding {
  /** The key combination string */
  key: string;
  /** The presentation action to dispatch */
  action: PresentationAction;
  /** Human-readable description for the shortcuts dialog */
  description: string;
  /** Which UI context this shortcut is active in */
  context: ShortcutContext;
  /** Whether to prevent default browser behaviour for this key */
  preventDefault: boolean;
}

const SHORTCUTS: ShortcutBinding[] = [
  // ── Navigation ────────────────────────────────────────────────────────────
  {
    key: 'arrowright',
    action: { type: 'NEXT_SLIDE' },
    description: 'Next slide',
    context: 'operator',
    preventDefault: true,
  },
  {
    key: 'arrowdown',
    action: { type: 'NEXT_SLIDE' },
    description: 'Next slide',
    context: 'operator',
    preventDefault: true,
  },
  {
    key: 'space',
    action: { type: 'NEXT_SLIDE' },
    description: 'Next slide',
    context: 'operator',
    preventDefault: true,
  },
  {
    key: 'arrowleft',
    action: { type: 'PREVIOUS_SLIDE' },
    description: 'Previous slide',
    context: 'operator',
    preventDefault: true,
  },
  {
    key: 'arrowup',
    action: { type: 'PREVIOUS_SLIDE' },
    description: 'Previous slide',
    context: 'operator',
    preventDefault: true,
  },
  {
    key: 'enter',
    action: { type: 'SEND_LIVE' },
    description: 'Send staged slide live',
    context: 'operator',
    preventDefault: true,
  },

  // ── Emergency Controls ────────────────────────────────────────────────────
  {
    key: 'b',
    action: { type: 'BLACK_SCREEN' },
    description: 'Black screen',
    context: 'operator',
    preventDefault: false,
  },
  {
    key: 'c',
    action: { type: 'CLEAR_OUTPUT' },
    description: 'Clear output',
    context: 'operator',
    preventDefault: false,
  },
  {
    key: 'f',
    action: { type: 'FREEZE_OUTPUT' },
    description: 'Freeze output',
    context: 'operator',
    preventDefault: false,
  },

  // ── Scripture / Lyrics context ────────────────────────────────────────────
  {
    key: 'arrowright',
    action: { type: 'NEXT_SLIDE' },
    description: 'Next verse / line',
    context: 'scripture',
    preventDefault: true,
  },
  {
    key: 'arrowleft',
    action: { type: 'PREVIOUS_SLIDE' },
    description: 'Previous verse / line',
    context: 'scripture',
    preventDefault: true,
  },
  {
    key: 'arrowright',
    action: { type: 'NEXT_SLIDE' },
    description: 'Next lyric line',
    context: 'lyrics',
    preventDefault: true,
  },
  {
    key: 'arrowleft',
    action: { type: 'PREVIOUS_SLIDE' },
    description: 'Previous lyric line',
    context: 'lyrics',
    preventDefault: true,
  },
];

export default SHORTCUTS;

/** Group shortcuts by context for display in the shortcuts dialog */
export function getShortcutsByContext(context: ShortcutContext): ShortcutBinding[] {
  return SHORTCUTS.filter((s) => s.context === context);
}

/** Find the shortcut binding for a given key + context */
export function findShortcut(
  key: string,
  context: ShortcutContext
): ShortcutBinding | undefined {
  return SHORTCUTS.find((s) => s.key === key && s.context === context);
}
