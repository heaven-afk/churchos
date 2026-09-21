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

interface PresentationState extends OutputState {
  /** All slides for the currently active service item */
  slides: PresentationSlide[];
  /** Index of the live slide within `slides` */
  liveSlideIndex: number;

  // Actions (called by presentation.actions.ts — not directly by UI)
  sendLive: (slide: PresentationSlide) => void;
  goToNextSlide: () => void;
  goToPreviousSlide: () => void;
  goToSlide: (slideId: string) => void;
  setOutputStatus: (status: OutputStatus) => void;
  setLayoutOverride: (layoutId: LayoutId | null) => void;
  setBackgroundOverride: (background: Background | null) => void;
  showLowerThird: (text: string, subtext?: string) => void;
  setSlides: (slides: PresentationSlide[]) => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  // Initial output state
  status: 'clear',
  liveSlide: null,
  nextSlide: null,
  layoutOverride: null,
  backgroundOverride: null,

  // Slide list
  slides: [],
  liveSlideIndex: -1,

  sendLive: (slide) =>
    set((s) => {
      const index = s.slides.findIndex((sl) => sl.id === slide.id);
      const nextSlide = index >= 0 && index < s.slides.length - 1
        ? s.slides[index + 1]
        : null;
      return {
        status: 'live',
        liveSlide: slide,
        nextSlide,
        liveSlideIndex: index,
      };
    }),

  goToNextSlide: () =>
    set((s) => {
      if (s.slides.length === 0) return s;
      const nextIndex = Math.min(s.liveSlideIndex + 1, s.slides.length - 1);
      if (nextIndex === s.liveSlideIndex) return s;
      const slide = s.slides[nextIndex];
      const nextSlide = nextIndex < s.slides.length - 1
        ? s.slides[nextIndex + 1]
        : null;
      return {
        status: 'live',
        liveSlide: slide,
        nextSlide,
        liveSlideIndex: nextIndex,
      };
    }),

  goToPreviousSlide: () =>
    set((s) => {
      if (s.slides.length === 0) return s;
      const prevIndex = Math.max(s.liveSlideIndex - 1, 0);
      if (prevIndex === s.liveSlideIndex) return s;
      const slide = s.slides[prevIndex];
      const nextSlide = prevIndex < s.slides.length - 1
        ? s.slides[prevIndex + 1]
        : null;
      return {
        status: 'live',
        liveSlide: slide,
        nextSlide,
        liveSlideIndex: prevIndex,
      };
    }),

  goToSlide: (slideId) =>
    set((s) => {
      const index = s.slides.findIndex((sl) => sl.id === slideId);
      if (index < 0) return s;
      const slide = s.slides[index];
      const nextSlide = index < s.slides.length - 1 ? s.slides[index + 1] : null;
      return {
        status: 'live',
        liveSlide: slide,
        nextSlide,
        liveSlideIndex: index,
      };
    }),

  setOutputStatus: (status) => set({ status }),

  setLayoutOverride: (layoutId) => set({ layoutOverride: layoutId }),

  setBackgroundOverride: (background) => set({ backgroundOverride: background }),

  showLowerThird: (text, subtext) =>
    set((s) => {
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
      return {
        status: 'live',
        liveSlide: lowerThirdSlide,
        layoutOverride: 'lower-third',
      };
    }),

  setSlides: (slides) =>
    set({
      slides,
      liveSlideIndex: -1,
      liveSlide: null,
      nextSlide: slides.length > 0 ? slides[0] : null,
    }),
}));
