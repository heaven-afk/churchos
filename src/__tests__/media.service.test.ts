import { describe, it, expect } from "vitest";
import {
  createMediaPresentationSlide,
  createMediaServiceItem,
} from "@/lib/content/media.service";
import type { MediaItem } from "@/types/media.types";

describe("Media Content Service (Phase 1 §9.2 & §9.3)", () => {
  const sampleImage: MediaItem = {
    id: "img-test-1",
    type: "image",
    name: "Worship Cross",
    mimeType: "image/jpeg",
    size: 204800,
    storageType: "cloud",
    storagePath: "curated/cross.jpg",
    url: "https://example.com/cross.jpg",
    tags: ["cross"],
    organizationId: "org-default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleVideo: MediaItem = {
    id: "vid-test-1",
    type: "video",
    name: "Motion Particles",
    mimeType: "video/mp4",
    size: 1048576,
    duration: 30,
    storageType: "cloud",
    storagePath: "curated/particles.mp4",
    url: "https://example.com/particles.mp4",
    tags: ["motion", "particles"],
    organizationId: "org-default",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("converts image media into presentation slide", () => {
    const slide = createMediaPresentationSlide(sampleImage);
    expect(slide.mediaType).toBe("image");
    expect(slide.mediaUrl).toBe("https://example.com/cross.jpg");
    expect(slide.background.type).toBe("image");
  });

  it("converts video media into video background slide", () => {
    const slide = createMediaPresentationSlide(sampleVideo);
    expect(slide.mediaType).toBe("video");
    expect(slide.mediaUrl).toBe("https://example.com/particles.mp4");
    expect(slide.background.type).toBe("video");
  });

  it("creates structured ServiceItems for images and videos", () => {
    const imgItem = createMediaServiceItem(sampleImage, 0);
    expect(imgItem.type).toBe("image");
    expect(imgItem.title).toBe("Worship Cross");
    expect(imgItem.order).toBe(0);

    const vidItem = createMediaServiceItem(sampleVideo, 1);
    expect(vidItem.type).toBe("video");
    expect(vidItem.title).toBe("Motion Particles");
    expect(vidItem.order).toBe(1);
  });
});
