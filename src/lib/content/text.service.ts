/**
 * Text Content Service — Phase 1 §9.1
 *
 * Converts announcements, sermon notes, speaker names, and quotes into
 * presentation slides and service items.
 */

import type { ServiceItem } from "@/types/service.types";
import type {
  PresentationSlide,
  LayoutId,
  Background,
} from "@/types/presentation.types";

export interface CreateTextOptions {
  title?: string;
  body: string;
  subtext?: string;
  layout?: LayoutId;
  background?: Background;
  textAlign?: "left" | "center" | "right";
}

const DEFAULT_BACKGROUND: Background = {
  id: "default-black",
  type: "color",
  name: "Solid Black",
  value: "#000000",
};

/**
 * Creates presentation slides from text content.
 * Splits double newlines into separate slides if body has multiple paragraphs.
 */
export function createTextPresentationSlides(
  options: CreateTextOptions
): PresentationSlide[] {
  const {
    title,
    body,
    subtext,
    layout = "full-screen",
    background = DEFAULT_BACKGROUND,
    textAlign = "center",
  } = options;

  if (!body.trim() && !title?.trim()) return [];

  // Split on double newlines if present, otherwise single slide
  const paragraphs = body
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const slideTexts = paragraphs.length > 0 ? paragraphs : [body.trim()];

  return slideTexts.map((text, idx) => ({
    id: `slide-text-${Date.now().toString(36)}-${idx}`,
    title: idx === 0 ? title : undefined,
    text,
    subtext,
    layout,
    background,
    textAlign,
  }));
}

/**
 * Creates a structured ServiceItem for text content.
 */
export function createTextServiceItem(
  options: CreateTextOptions,
  order: number
): ServiceItem {
  const now = new Date().toISOString();
  const slides = createTextPresentationSlides(options);
  const title = options.title?.trim() || options.body.trim().split("\n")[0] || "Text Slide";

  return {
    id: `item-text-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: "text",
    title,
    order,
    contentId: `content-text-${Date.now()}`,
    isRemoved: false,
    content: {
      ...options,
      slides,
    },
    notes: options.subtext,
    createdAt: now,
    updatedAt: now,
  };
}
