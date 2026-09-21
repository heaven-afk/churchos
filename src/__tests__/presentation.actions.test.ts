/**
 * Presentation Action System Tests
 *
 * These tests verify that dispatch() correctly mutates the presentation store.
 * The store is reset before each test to ensure isolation.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { dispatch } from "@/actions/presentation.actions";
import { usePresentationStore } from "@/store/presentation.store";
import type { PresentationSlide } from "@/types/presentation.types";

const MOCK_SLIDE: PresentationSlide = {
  id: "slide-1",
  text: "For God so loved the world",
  subtext: "John 3:16",
  layout: "full-screen",
  background: { id: "black", type: "color", name: "Black", value: "#000" },
};

const MOCK_SLIDE_2: PresentationSlide = {
  id: "slide-2",
  text: "…that he gave his only Son",
  subtext: "John 3:16b",
  layout: "full-screen",
  background: { id: "black", type: "color", name: "Black", value: "#000" },
};

function resetStore() {
  usePresentationStore.setState({
    status: "clear",
    liveSlide: null,
    nextSlide: null,
    layoutOverride: null,
    backgroundOverride: null,
    slides: [],
    liveSlideIndex: -1,
  });
}

describe("Presentation Actions", () => {
  beforeEach(resetStore);

  it("SEND_LIVE sets status to live and updates liveSlide", () => {
    usePresentationStore.getState().setSlides([MOCK_SLIDE, MOCK_SLIDE_2]);

    dispatch({ type: "SEND_LIVE", slide: MOCK_SLIDE });

    const state = usePresentationStore.getState();
    expect(state.status).toBe("live");
    expect(state.liveSlide?.id).toBe("slide-1");
    expect(state.nextSlide?.id).toBe("slide-2");
  });

  it("BLACK_SCREEN sets status to black", () => {
    dispatch({ type: "BLACK_SCREEN" });
    expect(usePresentationStore.getState().status).toBe("black");
  });

  it("CLEAR_OUTPUT sets status to clear", () => {
    dispatch({ type: "BLACK_SCREEN" });
    dispatch({ type: "CLEAR_OUTPUT" });
    expect(usePresentationStore.getState().status).toBe("clear");
  });

  it("FREEZE_OUTPUT sets status to frozen", () => {
    dispatch({ type: "FREEZE_OUTPUT" });
    expect(usePresentationStore.getState().status).toBe("frozen");
  });

  it("UNFREEZE_OUTPUT sets status to live", () => {
    dispatch({ type: "FREEZE_OUTPUT" });
    dispatch({ type: "UNFREEZE_OUTPUT" });
    expect(usePresentationStore.getState().status).toBe("live");
  });

  it("NEXT_SLIDE advances slide index", () => {
    usePresentationStore.getState().setSlides([MOCK_SLIDE, MOCK_SLIDE_2]);
    dispatch({ type: "SEND_LIVE", slide: MOCK_SLIDE });

    dispatch({ type: "NEXT_SLIDE" });

    const state = usePresentationStore.getState();
    expect(state.liveSlide?.id).toBe("slide-2");
    expect(state.liveSlideIndex).toBe(1);
  });

  it("PREVIOUS_SLIDE does not go below index 0", () => {
    usePresentationStore.getState().setSlides([MOCK_SLIDE, MOCK_SLIDE_2]);
    dispatch({ type: "SEND_LIVE", slide: MOCK_SLIDE });

    dispatch({ type: "PREVIOUS_SLIDE" });

    const state = usePresentationStore.getState();
    expect(state.liveSlide?.id).toBe("slide-1");
    expect(state.liveSlideIndex).toBe(0);
  });

  it("CHANGE_LAYOUT sets layoutOverride", () => {
    dispatch({ type: "CHANGE_LAYOUT", layoutId: "lower-third" });
    expect(usePresentationStore.getState().layoutOverride).toBe("lower-third");
  });
});
