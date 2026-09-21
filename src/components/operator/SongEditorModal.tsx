"use client";

import { useState } from "react";
import type { Song, LyricSection, LyricSectionType } from "@/types/content.types";
import { splitSectionIntoSlides } from "@/lib/lyrics/lyric.service";

interface SongEditorModalProps {
  song?: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (songData: Omit<Song, "id" | "createdAt" | "updatedAt">) => void;
}

const SECTION_TYPE_OPTIONS: { type: LyricSectionType; label: string }[] = [
  { type: "verse", label: "Verse" },
  { type: "chorus", label: "Chorus" },
  { type: "bridge", label: "Bridge" },
  { type: "pre-chorus", label: "Pre-Chorus" },
  { type: "tag", label: "Tag" },
  { type: "outro", label: "Outro" },
  { type: "interlude", label: "Interlude" },
];

let sectionIdCounter = 1;
function generateSectionId(prefix: string): string {
  sectionIdCounter += 1;
  return `sec-${prefix}-${sectionIdCounter}`;
}

const INITIAL_DEFAULT_SECTIONS: LyricSection[] = [
  {
    id: "sec-v1-init",
    type: "verse",
    label: "Verse 1",
    body: "",
    order: 0,
    slides: [],
  },
  {
    id: "sec-c-init",
    type: "chorus",
    label: "Chorus",
    body: "",
    order: 1,
    slides: [],
  },
];

export function SongEditorModal({
  song,
  isOpen,
  onClose,
  onSave,
}: SongEditorModalProps) {
  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [author, setAuthor] = useState(song?.author ?? "");
  const [ccliNumber, setCcliNumber] = useState(song?.ccliNumber ?? "");
  const [sections, setSections] = useState<LyricSection[]>(
    song?.sections && song.sections.length > 0
      ? song.sections
      : INITIAL_DEFAULT_SECTIONS
  );
  const [arrangement, setArrangement] = useState<string[]>(
    song?.arrangement ?? sections.map((s) => s.id)
  );

  if (!isOpen) return null;

  const handleAddSection = (type: LyricSectionType) => {
    const existingCount = sections.filter((s) => s.type === type).length;
    const typeLabel =
      SECTION_TYPE_OPTIONS.find((t) => t.type === type)?.label ?? "Section";
    const label =
      type === "chorus" && existingCount === 0
        ? "Chorus"
        : `${typeLabel} ${existingCount + 1}`;

    const newSecId = generateSectionId(type.slice(0, 2));
    const newSection: LyricSection = {
      id: newSecId,
      type,
      label,
      body: "",
      order: sections.length,
      slides: [],
    };

    setSections([...sections, newSection]);
    setArrangement([...arrangement, newSecId]);
  };

  const handleUpdateSection = (
    id: string,
    field: keyof LyricSection,
    value: unknown
  ) => {
    setSections(
      sections.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: value };
        if (field === "body") {
          updated.slides = splitSectionIntoSlides(String(value));
        }
        return updated;
      })
    );
  };

  const handleRemoveSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
    setArrangement(arrangement.filter((arrId) => arrId !== id));
  };

  const handleAddToArrangement = (id: string) => {
    setArrangement([...arrangement, id]);
  };

  const handleRemoveFromArrangement = (index: number) => {
    setArrangement(arrangement.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Normalize slides for all sections before saving
    const normalizedSections = sections.map((sec, idx) => ({
      ...sec,
      order: idx,
      slides: splitSectionIntoSlides(sec.body),
    }));

    onSave({
      title: title.trim(),
      artist: artist.trim() || undefined,
      author: author.trim() || undefined,
      ccliNumber: ccliNumber.trim() || undefined,
      sections: normalizedSections,
      arrangement: arrangement.length > 0 ? arrangement : normalizedSections.map((s) => s.id),
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="song-editor-title"
    >
      <div
        className="w-full max-w-3xl rounded-xl border flex flex-col max-h-[90vh] shadow-2xl overflow-hidden"
        style={{
          background: "var(--color-bg-elevated)",
          borderColor: "var(--color-border-strong)",
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2
            id="song-editor-title"
            className="text-base font-semibold"
            style={{ color: "var(--color-fg-default)" }}
          >
            {song ? `Edit "${song.title}"` : "Add New Song"}
          </h2>
          <button
            onClick={onClose}
            className="text-lg leading-none rounded p-1.5 transition-colors cursor-pointer"
            style={{ color: "var(--color-fg-muted)" }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  Song Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10,000 Reasons"
                  className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
                  style={{
                    background: "var(--color-surface-1)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg-default)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  Artist / Author
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Matt Redman"
                  className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
                  style={{
                    background: "var(--color-surface-1)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg-default)",
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  CCLI Number
                </label>
                <input
                  type="text"
                  value={ccliNumber}
                  onChange={(e) => setCcliNumber(e.target.value)}
                  placeholder="e.g. 6016351"
                  className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
                  style={{
                    background: "var(--color-surface-1)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg-default)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  Copyright / License Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Jonas Myrin, Matt Redman"
                  className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none"
                  style={{
                    background: "var(--color-surface-1)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg-default)",
                  }}
                />
              </div>
            </div>

            {/* Arrangement Sequence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  Service Arrangement Sequence
                </label>
                <span className="text-xs" style={{ color: "var(--color-fg-subtle)" }}>
                  Order of sections during presentation
                </span>
              </div>
              <div
                className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border min-h-[44px]"
                style={{
                  background: "var(--color-surface-1)",
                  borderColor: "var(--color-border)",
                }}
              >
                {arrangement.length === 0 ? (
                  <span className="text-xs italic" style={{ color: "var(--color-fg-subtle)" }}>
                    No arrangement set. Sections will play in default order.
                  </span>
                ) : (
                  arrangement.map((secId, idx) => {
                    const sec = sections.find((s) => s.id === secId);
                    return (
                      <span
                        key={`${secId}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border"
                        style={{
                          background: "var(--color-primary-subtle)",
                          borderColor: "var(--color-primary)",
                          color: "var(--color-primary)",
                        }}
                      >
                        {sec?.label ?? secId}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromArrangement(idx)}
                          className="hover:opacity-75 cursor-pointer"
                          aria-label={`Remove ${sec?.label} from arrangement`}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sections Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  Song Sections ({sections.length})
                </label>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium mr-1" style={{ color: "var(--color-fg-subtle)" }}>
                    + Add:
                  </span>
                  {SECTION_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => handleAddSection(opt.type)}
                      className="px-2 py-1 rounded text-xs font-medium border transition-colors cursor-pointer"
                      style={{
                        background: "var(--color-surface-2)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-fg-default)",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="p-4 rounded-xl border space-y-3"
                    style={{
                      background: "var(--color-surface-1)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider"
                          style={{
                            background:
                              section.type === "chorus"
                                ? "var(--color-warning-subtle)"
                                : "var(--color-surface-2)",
                            color:
                              section.type === "chorus"
                                ? "var(--color-warning)"
                                : "var(--color-fg-muted)",
                          }}
                        >
                          {section.type}
                        </span>
                        <input
                          type="text"
                          value={section.label}
                          onChange={(e) =>
                            handleUpdateSection(section.id, "label", e.target.value)
                          }
                          className="text-sm font-semibold rounded px-2 py-1 border focus:outline-none"
                          style={{
                            background: "var(--color-bg-base)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-fg-default)",
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddToArrangement(section.id)}
                          className="px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                          style={{
                            background: "var(--color-primary-subtle)",
                            color: "var(--color-primary)",
                          }}
                          title="Append to arrangement sequence"
                        >
                          + Arrange
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(section.id)}
                          className="px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
                          style={{
                            background: "var(--color-error-subtle)",
                            color: "var(--color-error)",
                          }}
                          aria-label={`Delete ${section.label}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div>
                      <textarea
                        rows={4}
                        value={section.body}
                        onChange={(e) =>
                          handleUpdateSection(section.id, "body", e.target.value)
                        }
                        placeholder="Enter lyrics here... (Separate slides with blank lines)"
                        className="w-full rounded-lg p-3 text-sm font-mono border focus:outline-none resize-y"
                        style={{
                          background: "var(--color-bg-base)",
                          borderColor: "var(--color-border)",
                          color: "var(--color-fg-default)",
                        }}
                      />
                      <p className="text-xs mt-1" style={{ color: "var(--color-fg-subtle)" }}>
                        Tip: Blank lines break into separate presentation slides automatically.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0"
            style={{ borderColor: "var(--color-border)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-fg-muted)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-primary-fg)",
              }}
            >
              Save Song
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
