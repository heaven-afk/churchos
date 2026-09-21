import { describe, it, expect } from "vitest";
import {
  splitSectionIntoSlides,
  songToPresentationSlides,
  createSongServiceItem,
} from "@/lib/lyrics/lyric.service";
import type { Song } from "@/types/content.types";

describe("Lyric Service Helper", () => {
  const sampleSong: Song = {
    id: "test-song-1",
    title: "Crown Him with Many Crowns",
    artist: "Matthew Bridges",
    author: "George J. Elvey",
    ccliNumber: "23938",
    sections: [
      {
        id: "v1",
        type: "verse",
        label: "Verse 1",
        body: "Crown Him with many crowns\nThe Lamb upon His throne\nHark! How the heav'nly anthem drowns\nAll music but its own!",
        order: 0,
      },
      {
        id: "c1",
        type: "chorus",
        label: "Chorus",
        body: "Awake my soul and sing\nOf Him who died for thee\nAnd hail Him as thy matchless King\nThrough all eternity",
        order: 1,
      },
    ],
    arrangement: ["v1", "c1", "v1"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("splits multi-line text into slides correctly", () => {
    const textWithBlankLines = "Line 1\nLine 2\n\nLine 3\nLine 4";
    const slides = splitSectionIntoSlides(textWithBlankLines);
    expect(slides).toHaveLength(2);
    expect(slides[0]).toBe("Line 1\nLine 2");
    expect(slides[1]).toBe("Line 3\nLine 4");
  });

  it("handles long verse without blank lines by chunking", () => {
    const longVerse = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6";
    const slides = splitSectionIntoSlides(longVerse);
    expect(slides.length).toBeGreaterThanOrEqual(2);
  });

  it("converts song to presentation slides respecting arrangement", () => {
    const slides = songToPresentationSlides(sampleSong);
    // arrangement is [v1, c1, v1], each has 1 slide block (<=4 lines)
    expect(slides).toHaveLength(3);
    expect(slides[0].text).toContain("Crown Him with many crowns");
    expect(slides[0].subtext).toBe("Crown Him with Many Crowns · Verse 1");
    expect(slides[1].text).toContain("Awake my soul and sing");
    expect(slides[1].subtext).toBe("Crown Him with Many Crowns · Chorus");
    expect(slides[2].text).toContain("Crown Him with many crowns");
    expect(slides[2].subtext).toBe("Crown Him with Many Crowns · Verse 1");
  });

  it("creates a valid ServiceItem for the song", () => {
    const item = createSongServiceItem(sampleSong, 2);
    expect(item.type).toBe("song");
    expect(item.title).toBe("Crown Him with Many Crowns");
    expect(item.order).toBe(2);
    expect(item.contentId).toBe("test-song-1");
    expect(item.notes).toContain("Matthew Bridges");
  });
});
