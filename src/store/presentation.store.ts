/**
 * Presentation Store — spec §37 (Presentation State)
 *
 * Manages the live presentation output state.
 * All state changes should come via the presentation action dispatcher,
 * not from UI components calling store methods directly.
 */

import { create } from 'zustand';
import type {
  OutputState,
  OutputStatus,
  PresentationSlide,
  LayoutId,
  Background,
} from '@/types/presentation.types';
import { broadcastPresentationState } from '@/lib/presentation/sync';

export interface PresentationState extends OutputState {
  /** All slides for the currently active service item */
  slides: PresentationSlide[];
  /** Index of the live slide within `slides` */
  liveSlideIndex: number;
  /** Index of the preview slide within `slides` */
  previewSlideIndex: number;

  // Actions (called by presentation.actions.ts — not directly by UI)
  sendLive: (slide?: PresentationSlide) => void;
  setPreview: (slide: PresentationSlide | null) => void;
  goToNextSlide: () => void;
  goToPreviousSlide: () => void;
  goToSlide: (slideId: string) => void;
  setOutputStatus: (status: OutputStatus) => void;
  setLayoutOverride: (layoutId: LayoutId | null) => void;
  setBackgroundOverride: (background: Background | null) => void;
  showLowerThird: (text: string, subtext?: string) => void;
  setSlides: (slides: PresentationSlide[]) => void;
  hydrateFromSync: (syncState: Partial<OutputState>) => void;
}

function broadcastLiveChange(state: {
  status: OutputStatus;
  liveSlide: PresentationSlide | null;
  layoutOverride: LayoutId | null;
  backgroundOverride: Background | null;
}) {
  broadcastPresentationState({
    status: state.status,
    liveSlide: state.liveSlide,
    layoutOverride: state.layoutOverride,
    backgroundOverride: state.backgroundOverride,
  });
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  // Initial output state
  status: 'clear',
  liveSlide: null,
  previewSlide: null,
  nextSlide: null,
  layoutOverride: null,
  backgroundOverride: null,

  // Slide list
  slides: [],
  liveSlideIndex: -1,
  previewSlideIndex: -1,

  sendLive: (slide) => {
    const s = get();
    const targetSlide = slide ?? s.previewSlide;
    if (!targetSlide) return;

    const index = s.slides.findIndex((sl) => sl.id === targetSlide.id);
    const resolvedIndex = index >= 0 ? index : s.liveSlideIndex;
    const nextSlide =
      resolvedIndex >= 0 && resolvedIndex < s.slides.length - 1
        ? s.slides[resolvedIndex + 1]
        : null;

    const nextState = {
      status: 'live' as OutputStatus,
      liveSlide: targetSlide,
      nextSlide,
      liveSlideIndex: resolvedIndex,
    };

    set(nextState);

    broadcastLiveChange({
      status: 'live',
      liveSlide: targetSlide,
      layoutOverride: s.layoutOverride,
      backgroundOverride: s.backgroundOverride,
    });
  },

  setPreview: (slide) => {
    const s = get();
    if (!slide) {
      set({ previewSlide: null, previewSlideIndex: -1 });
      return;
    }
    const index = s.slides.findIndex((sl) => sl.id === slide.id);
    set({
      previewSlide: slide,
      previewSlideIndex: index >= 0 ? index : -1,
    });
    // Deliberately does NOT broadcast to live presentation output
  },

  goToNextSlide: () => {
    const s = get();
    if (s.slides.length === 0) return;
    const nextIndex = Math.min(s.liveSlideIndex + 1, s.slides.length - 1);
    if (nextIndex === s.liveSlideIndex) return;

    const slide = s.slides[nextIndex];
    const nextSlide =
      nextIndex < s.slides.length - 1 ? s.slides[nextIndex + 1] : null;

    set({
      status: 'live',
      liveSlide: slide,
      nextSlide,
      liveSlideIndex: nextIndex,
    });

    broadcastLiveChange({
      status: 'live',
      liveSlide: slide,
      layoutOverride: s.layoutOverride,
      backgroundOverride: s.backgroundOverride,
    });
  },

  goToPreviousSlide: () => {
    const s = get();
    if (s.slides.length === 0) return;
    const prevIndex = Math.max(s.liveSlideIndex - 1, 0);
    if (prevIndex === s.liveSlideIndex) return;

    const slide = s.slides[prevIndex];
    const nextSlide =
      prevIndex < s.slides.length - 1 ? s.slides[prevIndex + 1] : null;

    set({
      status: 'live',
      liveSlide: slide,
      nextSlide,
      liveSlideIndex: prevIndex,
    });

    broadcastLiveChange({
      status: 'live',
      liveSlide: slide,
      layoutOverride: s.layoutOverride,
      backgroundOverride: s.backgroundOverride,
    });
  },

  goToSlide: (slideId) => {
    const s = get();
    const index = s.slides.findIndex((sl) => sl.id === slideId);
    if (index < 0) return;
    const slide = s.slides[index];
    const nextSlide = index < s.slides.length - 1 ? s.slides[index + 1] : null;

    set({
      status: 'live',
      liveSlide: slide,
      nextSlide,
      liveSlideIndex: index,
    });

    broadcastLiveChange({
      status: 'live',
      liveSlide: slide,
      layoutOverride: s.layoutOverride,
      backgroundOverride: s.backgroundOverride,
    });
  },

  setOutputStatus: (status) => {
    const s = get();
    set({ status });
    broadcastLiveChange({
      status,
      liveSlide: s.liveSlide,
      layoutOverride: s.layoutOverride,
      backgroundOverride: s.backgroundOverride,
    });
  },

  setLayoutOverride: (layoutId) => {
    const s = get();
    set({ layoutOverride: layoutId });
    broadcastLiveChange({
      status: s.status,
      liveSlide: s.liveSlide,
      layoutOverride: layoutId,
      backgroundOverride: s.backgroundOverride,
    });
  },

  setBackgroundOverride: (background) => {
    const s = get();
    set({ backgroundOverride: background });
    broadcastLiveChange({
      status: s.status,
      liveSlide: s.liveSlide,
      layoutOverride: s.layoutOverride,
      backgroundOverride: background,
    });
  },

  showLowerThird: (text, subtext) => {
    const s = get();
    const lowerThirdSlide: PresentationSlide = {
      id: `lt-${Date.now()}`,
      text,
      subtext,
      layout: 'lower-third',
      background: s.backgroundOverride ?? {
        id: 'transparent',
        type: 'none',
        name: 'Transparent',
      },
    };
    set({
      status: 'live',
      liveSlide: lowerThirdSlide,
      layoutOverride: 'lower-third',
    });
    broadcastLiveChange({
      status: 'live',
      liveSlide: lowerThirdSlide,
      layoutOverride: 'lower-third',
      backgroundOverride: s.backgroundOverride,
    });
  },

  setSlides: (slides) => {
    set({
      slides,
      liveSlideIndex: -1,
      previewSlideIndex: slides.length > 0 ? 0 : -1,
      liveSlide: null,
      previewSlide: slides.length > 0 ? slides[0] : null,
      nextSlide: slides.length > 1 ? slides[1] : null,
    });
  },

  hydrateFromSync: (syncState) => {
    set((state) => ({
      ...state,
      ...(syncState.status !== undefined && { status: syncState.status }),
      ...(syncState.liveSlide !== undefined && { liveSlide: syncState.liveSlide }),
      ...(syncState.layoutOverride !== undefined && {
        layoutOverride: syncState.layoutOverride,
      }),
      ...(syncState.backgroundOverride !== undefined && {
        backgroundOverride: syncState.backgroundOverride,
      }),
    }));
  },
}));
