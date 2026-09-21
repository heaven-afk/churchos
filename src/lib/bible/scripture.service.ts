/**
 * Scripture Service Helper — Phase 1 §5.5
 *
 * Converts Scripture data into structured ServiceItems and PresentationSlides.
 * Does not store Scripture as an unstructured text blob.
 */

import type { BiblePassage } from "@/types/bible.types";
import type { ServiceItem } from "@/types/service.types";
import type {
  PresentationSlide,
  LayoutId,
  Background,
} from "@/types/presentation.types";

/**
 * Creates presentation slides from a Bible passage.
 * Generates one slide per verse with reference subtext.
 */
export function passageToPresentationSlides(
  passage: BiblePassage,
  layout: LayoutId = "full-screen",
  background: Background = {
    id: "default-black",
    type: "color",
    name: "Solid Black",
    value: "#000000",
  }
): PresentationSlide[] {
  return passage.verses.map((verse) => ({
    id: `scripture-${verse.book}-${verse.chapter}-${verse.verse}`,
    text: verse.text,
    subtext: `${verse.verse}. ${passage.reference} (${passage.translation})`,
    layout,
    background,
  }));
}

/**
 * Creates a structured ServiceItem for a Scripture passage.
 */
export function createScriptureServiceItem(
  passage: BiblePassage,
  order: number,
  layout: LayoutId = "full-screen",
  background?: Background
): ServiceItem {
  const slides = passageToPresentationSlides(passage, layout, background);
  const now = new Date().toISOString();
  const contentId = `content-scr-${Date.now()}`;

  return {
    id: `item-scripture-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: "scripture",
    title: `${passage.reference} (${passage.translation})`,
    order,
    contentId,
    isRemoved: false,
    content: {
      id: contentId,
      ref: {
        book: passage.verses[0]?.book ?? "Unknown",
        chapter: passage.verses[0]?.chapter ?? 1,
        verse: passage.verses[0]?.verse ?? 1,
        verseEnd: passage.verses[passage.verses.length - 1]?.verse,
        translation: passage.translation,
      },
      slides: slides.map((s, idx) => ({
        ref: {
          book: passage.verses[idx]?.book ?? "Unknown",
          chapter: passage.verses[idx]?.chapter ?? 1,
          verse: passage.verses[idx]?.verse ?? 1,
          translation: passage.translation,
        },
        text: s.text,
      })),
      createdAt: now,
    },
    createdAt: now,
    updatedAt: now,
  };
}
