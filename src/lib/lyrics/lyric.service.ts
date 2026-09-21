/**
 * Lyric Service Helper — Phase 1 §6.2
 *
 * Converts songs and lyric sections into presentation slides and service items.
 */

import type { Song, LyricSection } from "@/types/content.types";
import type { ServiceItem } from "@/types/service.types";
import type {
  PresentationSlide,
  LayoutId,
  Background,
} from "@/types/presentation.types";

const DEFAULT_BACKGROUND: Background = {
  id: "default-black",
  type: "color",
  name: "Solid Black",
  value: "#000000",
};

/**
 * Splits a section's text body into individual presentation slides.
 * - Prioritizes empty-line breaks (\n\n)
 * - If a single block has > 4 lines, chunks into 2-4 lines per slide.
 */
export function splitSectionIntoSlides(body: string): string[] {
  if (!body || !body.trim()) return [];

  // Normalize newlines
  const normalized = body.replace(/\r\n/g, "\n").trim();

  // Split by double newlines (paragraphs)
  const paragraphs = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const slides: string[] = [];

  for (const para of paragraphs) {
    const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 4) {
      slides.push(lines.join("\n"));
    } else {
      // Chunk into blocks of 2 to 4 lines
      const chunkSize = lines.length % 2 === 0 ? 2 : (lines.length % 3 === 0 ? 3 : 2);
      for (let i = 0; i < lines.length; i += chunkSize) {
        slides.push(lines.slice(i, i + chunkSize).join("\n"));
      }
    }
  }

  return slides.length > 0 ? slides : [normalized];
}

/**
 * Transforms a Song into an ordered array of PresentationSlides based on its arrangement.
 */
export function songToPresentationSlides(
  song: Song,
  layout: LayoutId = "full-screen",
  background: Background = DEFAULT_BACKGROUND
): PresentationSlide[] {
  const sectionMap = new Map<string, LyricSection>();
  for (const section of song.sections) {
    sectionMap.set(section.id, section);
  }

  // Use arrangement sequence or fallback to sections order
  const arrangementIds =
    song.arrangement && song.arrangement.length > 0
      ? song.arrangement
      : song.sections.map((s) => s.id);

  const slides: PresentationSlide[] = [];

  for (let seqIdx = 0; seqIdx < arrangementIds.length; seqIdx++) {
    const sectionId = arrangementIds[seqIdx];
    const section = sectionMap.get(sectionId);
    if (!section) continue;

    const rawSlides =
      section.slides && section.slides.length > 0
        ? section.slides
        : splitSectionIntoSlides(section.body);

    for (let slideIdx = 0; slideIdx < rawSlides.length; slideIdx++) {
      const text = rawSlides[slideIdx].trim();
      if (!text) continue;

      slides.push({
        id: `slide-${song.id}-${section.id}-${seqIdx}-${slideIdx}`,
        text,
        subtext: `${song.title} · ${section.label}`,
        layout,
        background,
      });
    }
  }

  return slides;
}

/**
 * Creates a structured ServiceItem for a song to be included in a service rundown.
 */
export function createSongServiceItem(
  song: Song,
  order: number,
  layout: LayoutId = "full-screen",
  background: Background = DEFAULT_BACKGROUND
): ServiceItem {
  const now = new Date().toISOString();
  const slides = songToPresentationSlides(song, layout, background);

  return {
    id: `item-song-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: "song",
    title: song.title,
    order,
    contentId: song.id,
    isRemoved: false,
    notes: song.artist ? `Artist: ${song.artist}` : undefined,
    content: {
      ...song,
      slides,
    },
    createdAt: now,
    updatedAt: now,
  };
}
