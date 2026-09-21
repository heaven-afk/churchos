/**
 * Centralized Presentation Action System — spec §8 & §28
 *
 * All presentation state changes flow through this module.
 * UI components, keyboard shortcuts, remote controls, and future APIs
 * all call these actions — never duplicate this logic elsewhere.
 *
 * Pattern: dispatch(action) → updates presentation store → triggers render
 */

import { usePresentationStore } from '@/store/presentation.store';
import type { LayoutId, Background, PresentationSlide } from '@/types/presentation.types';

// ─── Action Discriminated Union ───────────────────────────────────────────────

export type PresentationActionType =
  | 'NEXT_SLIDE'
  | 'PREVIOUS_SLIDE'
  | 'GO_TO_SLIDE'
  | 'SEND_LIVE'
  | 'BLACK_SCREEN'
  | 'CLEAR_OUTPUT'
  | 'FREEZE_OUTPUT'
  | 'UNFREEZE_OUTPUT'
  | 'CHANGE_LAYOUT'
  | 'CHANGE_BACKGROUND'
  | 'SHOW_SCRIPTURE'
  | 'SHOW_LOWER_THIRD';

export type PresentationAction =
  | { type: 'NEXT_SLIDE' }
  | { type: 'PREVIOUS_SLIDE' }
  | { type: 'GO_TO_SLIDE'; slideId: string }
  | { type: 'SEND_LIVE'; slide: PresentationSlide }
  | { type: 'BLACK_SCREEN' }
  | { type: 'CLEAR_OUTPUT' }
  | { type: 'FREEZE_OUTPUT' }
  | { type: 'UNFREEZE_OUTPUT' }
  | { type: 'CHANGE_LAYOUT'; layoutId: LayoutId }
  | { type: 'CHANGE_BACKGROUND'; background: Background }
  | { type: 'SHOW_SCRIPTURE'; slideId: string }
  | { type: 'SHOW_LOWER_THIRD'; text: string; subtext?: string };

// ─── Action Dispatcher ────────────────────────────────────────────────────────

/**
 * dispatch() is the single entry point for all presentation commands.
 *
 * Usage:
 *   dispatch({ type: 'NEXT_SLIDE' })
 *   dispatch({ type: 'BLACK_SCREEN' })
 *   dispatch({ type: 'CHANGE_LAYOUT', layoutId: 'lower-third' })
 */
export function dispatch(action: PresentationAction): void {
  const store = usePresentationStore.getState();

  switch (action.type) {
    case 'NEXT_SLIDE':
      store.goToNextSlide();
      break;

    case 'PREVIOUS_SLIDE':
      store.goToPreviousSlide();
      break;

    case 'GO_TO_SLIDE':
      store.goToSlide(action.slideId);
      break;

    case 'SEND_LIVE':
      store.sendLive(action.slide);
      break;

    case 'BLACK_SCREEN':
      store.setOutputStatus('black');
      break;

    case 'CLEAR_OUTPUT':
      store.setOutputStatus('clear');
      break;

    case 'FREEZE_OUTPUT':
      store.setOutputStatus('frozen');
      break;

    case 'UNFREEZE_OUTPUT':
      store.setOutputStatus('live');
      break;

    case 'CHANGE_LAYOUT':
      store.setLayoutOverride(action.layoutId);
      break;

    case 'CHANGE_BACKGROUND':
      store.setBackgroundOverride(action.background);
      break;

    case 'SHOW_SCRIPTURE':
      store.goToSlide(action.slideId);
      break;

    case 'SHOW_LOWER_THIRD':
      store.showLowerThird(action.text, action.subtext);
      break;

    default: {
      // Exhaustiveness check — TypeScript will error if a case is missing
      const _exhaustive: never = action;
      console.error('[PresentationActions] Unhandled action:', _exhaustive);
    }
  }
}
