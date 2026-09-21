/**
 * Global Keyboard Handler — spec §28
 *
 * Listens for keyboard events and dispatches the appropriate
 * presentation action based on the current shortcut context.
 *
 * Rules:
 *  - This hook is registered once at the root operator layout.
 *  - Individual UI components do NOT implement their own keydown handlers
 *    for shared presentation operations.
 *  - The active context is read from the keyboard store, which UI panels
 *    update when they gain/lose focus relevance.
 */

'use client';

import { useEffect } from 'react';
import { useKeyboardStore } from '@/store/keyboard.store';
import { dispatch } from '@/actions/presentation.actions';
import { findShortcut } from '@/config/shortcuts';

/**
 * Normalises a KeyboardEvent into the string format used by shortcuts.ts.
 * e.g. { key: 'ArrowRight', shiftKey: false } → 'arrowright'
 *      { key: 'B', shiftKey: true }            → 'shift+b'
 */
function normaliseKey(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey) parts.push('ctrl');
  if (event.metaKey) parts.push('meta');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  parts.push(event.key.toLowerCase());
  return parts.join('+');
}

export function useKeyboard() {
  const context = useKeyboardStore((s) => s.activeContext);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't fire shortcuts when the user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isEditing =
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT';

      if (isEditing) return;

      const key = normaliseKey(event);
      const binding = findShortcut(key, context);

      if (!binding) return;

      if (binding.preventDefault) {
        event.preventDefault();
      }

      dispatch(binding.action);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [context]);
}
