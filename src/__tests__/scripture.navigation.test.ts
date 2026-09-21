/**
 * Scripture Presentation & Navigation Tests — Phase 1 §5.4 & §5.7
 */

import { describe, it, expect, beforeEach } from "vitest";
import { WebBibleProvider } from "@/providers/bible/web.provider";
import {
  passageToPresentationSlides,
  createScriptureServiceItem,
} from "@/lib/bible/scripture.service";
import { dispatch } from "@/actions/presentation.actions";
import { usePresentationStore } from "@/store/presentation.store";

describe("Scripture Live Workflow & Navigation", () => {
  const provider = new WebBibleProvider();

  beforeEach(() => {
    usePresentationStore.setState({
      status: "clear",
      liveSlide: null,
      previewSlide: null,
      nextSlide: null,
      slides: [],
      liveSlideIndex: -1,
      previewSlideIndex: -1,
    });
  });

  it("converts passage into presentation slides and structured service item", async () => {
    const passage = await provider.getPassage("JHN", 3, 16, 18);
    const serviceItem = createScriptureServiceItem(passage, 0);

    expect(serviceItem.type).toBe("scripture");
    expect(serviceItem.title).toContain("John 3:16–18");

    const slides = passageToPresentationSlides(passage);
    expect(slides).toHaveLength(3);
    expect(slides[0].text).toContain("For God so loved the world");
    expect(slides[0].subtext).toContain("John 3:16–18");
  });

  it("executes the full Scripture Live workflow (Search -> Preview -> Send Live -> Next Verse)", async () => {
    // 1. Search Scripture
    const searchResults = await provider.searchReference("John 3:16-18");
    expect(searchResults).toHaveLength(1);

    // 2. Load Passage & Slides
    const passage = await provider.getPassage("JHN", 3, 16, 18);
    const slides = passageToPresentationSlides(passage);
    expect(slides).toHaveLength(3);

    // 3. Stage Preview
    dispatch({ type: "SET_SLIDES", slides });
    dispatch({ type: "SET_PREVIEW", slide: slides[0] });

    let state = usePresentationStore.getState();
    expect(state.previewSlide?.text).toContain("For God so loved the world");
    expect(state.liveSlide).toBeNull();
    expect(state.status).toBe("clear");

    // 4. Send Live
    dispatch({ type: "SEND_LIVE" });

    state = usePresentationStore.getState();
    expect(state.status).toBe("live");
    expect(state.liveSlide?.text).toContain("For God so loved the world");
    expect(state.liveSlideIndex).toBe(0);
    expect(state.nextSlide?.text).toContain("For God didn't send his Son");

    // 5. Navigate to Next Verse (v17)
    dispatch({ type: "NEXT_SLIDE" });

    state = usePresentationStore.getState();
    expect(state.liveSlideIndex).toBe(1);
    expect(state.liveSlide?.text).toContain("For God didn't send his Son");
    expect(state.nextSlide?.text).toContain("He who believes in him");

    // 6. Navigate to Next Verse (v18)
    dispatch({ type: "NEXT_SLIDE" });

    state = usePresentationStore.getState();
    expect(state.liveSlideIndex).toBe(2);
    expect(state.liveSlide?.text).toContain("He who believes in him");
    expect(state.nextSlide).toBeNull();

    // 7. Navigate Back (v17)
    dispatch({ type: "PREVIOUS_SLIDE" });

    state = usePresentationStore.getState();
    expect(state.liveSlideIndex).toBe(1);
    expect(state.liveSlide?.text).toContain("For God didn't send his Son");
  });
});
