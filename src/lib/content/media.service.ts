/**
 * Media Content Service — Phase 1 §9.2 & §9.3
 *
 * Converts Image and Video media items into presentation slides and service items.
 */

import type { MediaItem } from "@/types/media.types";
import type { ServiceItem } from "@/types/service.types";
import type {
  PresentationSlide,
  LayoutId,
  Background,
} from "@/types/presentation.types";

/**
 * Creates a PresentationSlide for an Image or Video media item.
 */
export function createMediaPresentationSlide(
  media: MediaItem,
  layout: LayoutId = "full-screen",
  background?: Background
): PresentationSlide {
  const isVideo = media.type === "video";

  const resolvedBackground: Background = background ?? (
    isVideo
      ? {
          id: `bg-vid-${media.id}`,
          type: "video",
          name: media.name,
          value: media.url,
          mediaId: media.id,
        }
      : {
          id: `bg-img-${media.id}`,
          type: "image",
          name: media.name,
          value: media.url,
          mediaId: media.id,
        }
  );

  return {
    id: `slide-media-${media.id}`,
    title: media.name,
    text: "",
    subtext: undefined,
    layout,
    background: resolvedBackground,
    mediaUrl: media.url,
    mediaType: isVideo ? "video" : "image",
  };
}

/**
 * Creates a structured ServiceItem for a Media item (image or video).
 */
export function createMediaServiceItem(
  media: MediaItem,
  order: number,
  layout: LayoutId = "full-screen"
): ServiceItem {
  const now = new Date().toISOString();
  const slide = createMediaPresentationSlide(media, layout);

  return {
    id: `item-media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: media.type === "video" ? "video" : "image",
    title: media.name,
    order,
    contentId: media.id,
    isRemoved: false,
    content: {
      media,
      slides: [slide],
    },
    notes: `${media.type.toUpperCase()} · ${media.width || 1920}x${media.height || 1080}`,
    createdAt: now,
    updatedAt: now,
  };
}
