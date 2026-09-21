import { describe, it, expect, beforeEach } from "vitest";
import { useSongStore } from "@/store/song.store";
import { songToPresentationSlides, createSongServiceItem } from "@/lib/lyrics/lyric.service";
import { dispatch } from "@/actions/presentation.actions";
import { usePresentationStore } from "@/store/presentation.store";

describe("Song Presentation & Navigation", () => {
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

  it("stages song lyrics to preview and sends live", () => {
    const songs = useSongStore.getState().songs;
    const song = songs.find((s) => s.title === "Amazing Grace")!;
    expect(song).toBeDefined();

    const slides = songToPresentationSlides(song);
    expect(slides.length).toBeGreaterThan(0);

    // Stage preview
    dispatch({ type: "SET_SLIDES", slides });
    dispatch({ type: "SET_PREVIEW", slide: slides[0] });

    let state = usePresentationStore.getState();
    expect(state.previewSlide?.text).toContain("Amazing grace! How sweet the sound");
    expect(state.liveSlide).toBeNull();
    expect(state.status).toBe("clear");

    // Take live
    dispatch({ type: "SEND_LIVE" });

    state = usePresentationStore.getState();
    expect(state.status).toBe("live");
    expect(state.liveSlide?.text).toContain("Amazing grace! How sweet the sound");
    expect(state.liveSlideIndex).toBe(0);
    expect(state.nextSlide).toBeDefined();

    // Next slide
    dispatch({ type: "NEXT_SLIDE" });
    state = usePresentationStore.getState();
    expect(state.liveSlideIndex).toBe(1);
    expect(state.liveSlide?.text).toContain("I once was lost, but now am found");
  });

  it("adds song to service and allows service rundown selection", () => {
    const song = useSongStore.getState().songs[0];
    const serviceItem = createSongServiceItem(song, 0);

    expect(serviceItem.type).toBe("song");
    expect(serviceItem.title).toBe(song.title);
    expect((serviceItem.content as Song).title).toBe(song.title);
    expect((serviceItem.content as { slides: unknown[] }).slides.length).toBeGreaterThan(0);
  });
});
