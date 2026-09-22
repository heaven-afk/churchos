/**
 * Web Media Adapter — Phase 1 §9.4
 *
 * Implements MediaAdapter for the web environment.
 * Provides curated starter worship assets (images and motion loops) and supports
 * local file uploads with object URL resolution.
 */

import type { MediaAdapter, MediaUploadOptions } from "./media.adapter";
import type { MediaItem, MediaType } from "@/types/media.types";

const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: "media-img-cross",
    type: "image",
    name: "Golden Worship Sunrise",
    mimeType: "image/jpeg",
    size: 1024 * 450,
    width: 1920,
    height: 1080,
    storageType: "cloud",
    storagePath: "curated/sunrise.jpg",
    url: "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1920&auto=format&fit=crop",
    tags: ["worship", "cross", "sunrise", "still"],
    organizationId: "org-default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "media-img-mountain",
    type: "image",
    name: "Majestic Mountain Peaks",
    mimeType: "image/jpeg",
    size: 1024 * 520,
    width: 1920,
    height: 1080,
    storageType: "cloud",
    storagePath: "curated/mountain.jpg",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop",
    tags: ["nature", "creation", "mountain", "still"],
    organizationId: "org-default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "media-img-stainedglass",
    type: "image",
    name: "Cathedral Stained Glass",
    mimeType: "image/jpeg",
    size: 1024 * 610,
    width: 1920,
    height: 1080,
    storageType: "cloud",
    storagePath: "curated/stainedglass.jpg",
    url: "https://images.unsplash.com/photo-1548625361-19597a15fa1d?q=80&w=1920&auto=format&fit=crop",
    tags: ["church", "traditional", "stained-glass", "still"],
    organizationId: "org-default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "media-vid-ambient",
    type: "video",
    name: "Ambient Light Particles Loop",
    mimeType: "video/mp4",
    size: 1024 * 1024 * 4,
    width: 1920,
    height: 1080,
    duration: 15,
    storageType: "cloud",
    storagePath: "curated/ambient-particles.mp4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    tags: ["motion", "ambient", "particles", "loop"],
    organizationId: "org-default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "media-vid-clouds",
    type: "video",
    name: "Gentle Cloud Movement Loop",
    mimeType: "video/mp4",
    size: 1024 * 1024 * 6,
    width: 1920,
    height: 1080,
    duration: 20,
    storageType: "cloud",
    storagePath: "curated/clouds.mp4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    tags: ["motion", "clouds", "sky", "loop"],
    organizationId: "org-default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class WebMediaAdapter implements MediaAdapter {
  private mediaItems: MediaItem[] = [...DEFAULT_MEDIA];

  async resolveUrl(storagePath: string, storageType: "local" | "cloud"): Promise<string> {
    const item = this.mediaItems.find((m) => m.storagePath === storagePath);
    if (item?.url) return item.url;
    return storageType === "local" ? `local://${storagePath}` : storagePath;
  }

  async listMedia(organizationId: string, type?: MediaType): Promise<MediaItem[]> {
    return this.mediaItems.filter((item) => {
      const matchesOrg =
        item.organizationId === organizationId ||
        item.organizationId === "org-default";
      const matchesType = type ? item.type === type : true;
      return matchesOrg && matchesType;
    });
  }

  async uploadMedia(file: File, options: MediaUploadOptions): Promise<MediaItem> {
    const isVideo = file.type.startsWith("video/");
    const type: MediaType = isVideo ? "video" : "image";
    const objectUrl = URL.createObjectURL(file);

    const newItem: MediaItem = {
      id: `media-upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      name: file.name.replace(/\.[^/.]+$/, ""),
      mimeType: file.type,
      size: file.size,
      storageType: "local",
      storagePath: `uploads/${file.name}`,
      url: objectUrl,
      tags: options.tags ?? ["user-upload"],
      organizationId: options.organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.mediaItems = [newItem, ...this.mediaItems];
    return newItem;
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const item = this.mediaItems.find((m) => m.id === mediaId);
    if (item?.url && item.storageType === "local" && item.url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(item.url);
      } catch {
        // ignore
      }
    }
    this.mediaItems = this.mediaItems.filter((m) => m.id !== mediaId);
  }

  async generateThumbnail(mediaId: string): Promise<string> {
    const item = this.mediaItems.find((m) => m.id === mediaId);
    return item?.url ?? "";
  }
}

export const mediaAdapter = new WebMediaAdapter();
