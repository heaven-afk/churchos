"use client";

import { useState } from "react";
import { useSongStore } from "@/store/song.store";
import { useServiceStore, selectActiveItems } from "@/store/service.store";
import { dispatch } from "@/actions/presentation.actions";
import {
  songToPresentationSlides,
  createSongServiceItem,
} from "@/lib/lyrics/lyric.service";
import type { Song } from "@/types/content.types";
import { SongEditorModal } from "./SongEditorModal";

export function SongLibraryPanel() {
  const songs = useSongStore((s) => s.songs);
  const selectedSongId = useSongStore((s) => s.selectedSongId);
  const selectSong = useSongStore((s) => s.selectSong);
  const searchQuery = useSongStore((s) => s.searchQuery);
  const setSearchQuery = useSongStore((s) => s.setSearchQuery);
  const createSong = useSongStore((s) => s.createSong);
  const updateSong = useSongStore((s) => s.updateSong);
  const deleteSong = useSongStore((s) => s.deleteSong);

  const addItem = useServiceStore((s) => s.addItem);
  const items = useServiceStore(selectActiveItems);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  const filteredSongs = songs.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.artist && s.artist.toLowerCase().includes(q)) ||
      (s.author && s.author.toLowerCase().includes(q)) ||
      (s.ccliNumber && s.ccliNumber.toLowerCase().includes(q)) ||
      s.sections.some((sec) => sec.body.toLowerCase().includes(q))
    );
  });

  const selectedSong = songs.find((s) => s.id === selectedSongId) ?? filteredSongs[0] ?? null;

  const handleStageSong = (song: Song, startSectionId?: string) => {
    const slides = songToPresentationSlides(song);
    if (slides.length === 0) return;

    dispatch({ type: "SET_SLIDES", slides });

    let targetSlide = slides[0];
    if (startSectionId) {
      const found = slides.find((sl) => sl.id.includes(startSectionId));
      if (found) targetSlide = found;
    }

    dispatch({ type: "SET_PREVIEW", slide: targetSlide });
  };

  const handleLiveSong = (song: Song, startSectionId?: string) => {
    handleStageSong(song, startSectionId);
    dispatch({ type: "SEND_LIVE" });
  };

  const handleAddToService = (song: Song) => {
    const serviceItem = createSongServiceItem(song, items.length);
    addItem(serviceItem);
  };

  const handleOpenCreateModal = () => {
    setEditingSong(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSong(song);
    setIsEditorOpen(true);
  };

  const handleDeleteSong = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${song.title}"?`)) {
      deleteSong(song.id);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header & Search */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="song-search"
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-fg-muted)" }}
          >
            Song Library
          </label>
          <button
            id="btn-new-song"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: "var(--color-primary-subtle)",
              color: "var(--color-primary)",
            }}
          >
            + New Song
          </button>
        </div>

        <input
          id="song-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, artist, or lyrics..."
          className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none transition-colors"
          style={{
            background: "var(--color-surface-1)",
            borderColor: "var(--color-border)",
            color: "var(--color-fg-default)",
          }}
        />
      </div>

      {/* Song List */}
      <div
        className="flex-1 overflow-y-auto space-y-2 pr-0.5"
        role="list"
        aria-label="Songs list"
      >
        {filteredSongs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 text-center gap-1"
            style={{ color: "var(--color-fg-subtle)" }}
          >
            <p className="text-sm font-medium">No songs found</p>
            <p className="text-xs">Try a different query or add a new song.</p>
          </div>
        ) : (
          filteredSongs.map((song) => {
            const isSelected = song.id === selectedSong?.id;
            return (
              <div
                key={song.id}
                role="listitem"
                onClick={() => selectSong(song.id)}
                className="rounded-lg p-3 border transition-all cursor-pointer space-y-2"
                style={{
                  background: isSelected
                    ? "var(--color-surface-2)"
                    : "var(--color-surface-1)",
                  borderColor: isSelected
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3
                      className="text-sm font-semibold truncate"
                      style={{
                        color: isSelected
                          ? "var(--color-primary)"
                          : "var(--color-fg-default)",
                      }}
                    >
                      {song.title}
                    </h3>
                    {song.artist && (
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: "var(--color-fg-subtle)" }}
                      >
                        {song.artist}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleOpenEditModal(song, e)}
                      className="p-1 rounded text-xs transition-colors hover:opacity-80"
                      style={{ color: "var(--color-fg-muted)" }}
                      title="Edit song"
                      aria-label={`Edit ${song.title}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => handleDeleteSong(song, e)}
                      className="p-1 rounded text-xs transition-colors hover:opacity-80"
                      style={{ color: "var(--color-error)" }}
                      title="Delete song"
                      aria-label={`Delete ${song.title}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Section Badges */}
                <div className="flex flex-wrap gap-1">
                  {song.sections.map((sec) => (
                    <span
                      key={sec.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        background:
                          sec.type === "chorus"
                            ? "var(--color-warning-subtle)"
                            : "var(--color-bg-base)",
                        color:
                          sec.type === "chorus"
                            ? "var(--color-warning)"
                            : "var(--color-fg-muted)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {sec.label}
                    </span>
                  ))}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStageSong(song);
                    }}
                    className="flex-1 py-1 px-2 rounded text-xs font-medium border transition-colors cursor-pointer"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg-default)",
                      background: "var(--color-surface-1)",
                    }}
                    title="Load slides into Stage Preview"
                  >
                    Preview
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToService(song);
                    }}
                    className="flex-1 py-1 px-2 rounded text-xs font-medium border transition-colors cursor-pointer"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg-default)",
                      background: "var(--color-surface-1)",
                    }}
                    title="Add to current Service Rundown"
                  >
                    + Service
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLiveSong(song);
                    }}
                    className="py-1 px-2.5 rounded text-xs font-semibold transition-colors cursor-pointer"
                    style={{
                      background: "var(--color-live)",
                      color: "#ffffff",
                    }}
                    title="Take song live immediately"
                  >
                    Live ↗
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Song Section-By-Section Live Grid */}
      {selectedSong && (
        <div
          className="border-t pt-2.5 shrink-0 flex flex-col gap-2 max-h-48 overflow-y-auto"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-xs font-semibold uppercase tracking-wider truncate"
              style={{ color: "var(--color-fg-muted)" }}
            >
              Direct Jump: {selectedSong.title}
            </p>
            <span className="text-[10px]" style={{ color: "var(--color-fg-subtle)" }}>
              Click to jump
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {selectedSong.sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleStageSong(selectedSong, sec.id)}
                onDoubleClick={() => handleLiveSong(selectedSong, sec.id)}
                className="text-left p-2 rounded border transition-all cursor-pointer group"
                style={{
                  background: "var(--color-surface-1)",
                  borderColor: "var(--color-border)",
                }}
                title={`${sec.label} — Click to preview, double click for live`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold truncate"
                    style={{ color: "var(--color-fg-default)" }}
                  >
                    {sec.label}
                  </span>
                  <span
                    className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--color-primary)" }}
                  >
                    ▶
                  </span>
                </div>
                <p
                  className="text-[11px] truncate mt-0.5 line-clamp-1"
                  style={{ color: "var(--color-fg-subtle)" }}
                >
                  {sec.body.split("\n")[0] || "..."}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <SongEditorModal
        key={editingSong?.id ?? "new-song"}
        isOpen={isEditorOpen}
        song={editingSong}
        onClose={() => setIsEditorOpen(false)}
        onSave={(data) => {
          if (editingSong) {
            updateSong(editingSong.id, data);
          } else {
            createSong(data);
          }
        }}
      />
    </div>
  );
}
