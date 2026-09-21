/**
 * usePresentationSync Hook
 *
 * Synchronizes presentation output windows with the operator window in real time.
 * Used on the `/presentation` page to receive live updates,
 * and optionally in operator workstation to respond to sync requests.
 */

'use client';

import { useEffect } from 'react';
import { usePresentationStore } from '@/store/presentation.store';
import {
  getStoredPresentationState,
  listenToPresentationSync,
  requestPresentationSync,
  broadcastPresentationState,
  type SyncedPresentationState,
} from '@/lib/presentation/sync';

/**
 * Hook for the presentation output window (/presentation).
 * Hydrates initial state from storage and subscribes to live updates.
 */
export function usePresentationReceiver(enabled: boolean = true): void {
  const hydrateFromSync = usePresentationStore((s) => s.hydrateFromSync);

  useEffect(() => {
    if (!enabled) return;

    // 1. Initial hydration from localStorage
    const cached = getStoredPresentationState();
    if (cached) {
      hydrateFromSync(cached);
    }

    // 2. Request current live state from active operator window
    requestPresentationSync();

    // 3. Listen for continuous live updates
    const unsubscribe = listenToPresentationSync({
      onStateUpdate: (state: SyncedPresentationState) => {
        hydrateFromSync(state);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, hydrateFromSync]);
}

/**
 * Hook for the operator workstation window.
 * Listens for requests from newly opened presentation windows and provides the current state.
 */
export function useOperatorBroadcaster(): void {
  useEffect(() => {
    const unsubscribe = listenToPresentationSync({
      onRequestSync: () => {
        const store = usePresentationStore.getState();
        broadcastPresentationState({
          status: store.status,
          liveSlide: store.liveSlide,
          layoutOverride: store.layoutOverride,
          backgroundOverride: store.backgroundOverride,
        });
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
