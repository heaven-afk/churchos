import { describe, it, expect, beforeEach } from "vitest";
import { useSongStore } from "@/store/song.store";

describe("Song Store", () => {
  beforeEach(() => {
    // Reset state before each test
    const state = useSongStore.getState();
    state.setSearchQuery("");
  });

  it("initializes with default hymns", () => {
    const songs = useSongStore.getState().songs;
    expect(songs.length).toBeGreaterThanOrEqual(3);
    const titles = songs.map((s) => s.title);
    expect(titles).toContain("Amazing Grace");
    expect(titles).toContain("How Great Thou Art");
  });

  it("can select a song and filter songs by query", () => {
    const store = useSongStore.getState();
    const songId = store.songs[0].id;
    store.selectSong(songId);
    expect(useSongStore.getState().selectedSongId).toBe(songId);

    store.setSearchQuery("reasons");
    expect(useSongStore.getState().searchQuery).toBe("reasons");
  });

  it("creates, updates, and deletes songs", () => {
    const store = useSongStore.getState();
    const created = store.createSong({
      title: "In Christ Alone",
      artist: "Keith Getty, Stuart Townend",
      sections: [
        {
          id: "v1",
          type: "verse",
          label: "Verse 1",
          body: "In Christ alone my hope is found\nHe is my light, my strength, my song",
          order: 0,
        },
      ],
      arrangement: ["v1"],
    });

    expect(created.id).toBeDefined();
    expect(useSongStore.getState().songs.some((s) => s.id === created.id)).toBe(true);
    expect(useSongStore.getState().selectedSongId).toBe(created.id);

    // Update
    useSongStore.getState().updateSong(created.id, { title: "In Christ Alone (Live)" });
    const updated = useSongStore.getState().songs.find((s) => s.id === created.id);
    expect(updated?.title).toBe("In Christ Alone (Live)");

    // Delete
    useSongStore.getState().deleteSong(created.id);
    expect(useSongStore.getState().songs.some((s) => s.id === created.id)).toBe(false);
  });
});
