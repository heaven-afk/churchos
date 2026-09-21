/**
 * Presentation Action System Tests
 *
 * These tests verify that dispatch() correctly mutates the presentation store
 * and adheres to Workstream 1 rules (Preview/Live separation, Layouts, Backgrounds).
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
    previewSlide: null,
    nextSlide: null,
    layoutOverride: null,
    backgroundOverride: null,
    slides: [],
    liveSlideIndex: -1,
    previewSlideIndex: -1,
  });
}

describe("Presentation Actions", () => {
  beforeEach(resetStore);

  it("SET_PREVIEW does not affect liveSlide or status (Preview/Live separation)", () => {
    dispatch({ type: "SET_PREVIEW", slide: MOCK_SLIDE });

    const state = usePresentationStore.getState();
    expect(state.previewSlide?.id).toBe("slide-1");
    expect(state.liveSlide).toBeNull();
    expect(state.status).toBe("clear");
  });

  it("SEND_LIVE with no arguments promotes previewSlide to liveSlide", () => {
    usePresentationStore.getState().setSlides([MOCK_SLIDE, MOCK_SLIDE_2]);
    dispatch({ type: "SET_PREVIEW", slide: MOCK_SLIDE });
    dispatch({ type: "SEND_LIVE" });

    const state = usePresentationStore.getState();
    expect(state.status).toBe("live");
    expect(state.liveSlide?.id).toBe("slide-1");
    expect(state.nextSlide?.id).toBe("slide-2");
  });

  it("SEND_LIVE with slide argument sets status to live and updates liveSlide", () => {
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
    expect(state.nextSlide).toBeNull();
  });

  it("NEXT_SLIDE stops at the end of slides without error", () => {
    usePresentationStore.getState().setSlides([MOCK_SLIDE, MOCK_SLIDE_2]);
    dispatch({ type: "SEND_LIVE", slide: MOCK_SLIDE_2 });

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

  it("GO_TO_SLIDE jumps directly to specified slide", () => {
    usePresentationStore.getState().setSlides([MOCK_SLIDE, MOCK_SLIDE_2]);

    dispatch({ type: "GO_TO_SLIDE", slideId: "slide-2" });

    const state = usePresentationStore.getState();
    expect(state.liveSlide?.id).toBe("slide-2");
    expect(state.liveSlideIndex).toBe(1);
  });

  it("SET_LAYOUT and CHANGE_LAYOUT sets layoutOverride", () => {
    dispatch({ type: "SET_LAYOUT", layoutId: "lower-third" });
    expect(usePresentationStore.getState().layoutOverride).toBe("lower-third");

    dispatch({ type: "CHANGE_LAYOUT", layoutId: "caption" });
    expect(usePresentationStore.getState().layoutOverride).toBe("caption");
  });

  it("SET_BACKGROUND sets backgroundOverride", () => {
    dispatch({
      type: "SET_BACKGROUND",
      background: { id: "bg-1", type: "none", name: "Transparent" },
    });
    expect(usePresentationStore.getState().backgroundOverride?.type).toBe("none");
  });
});
