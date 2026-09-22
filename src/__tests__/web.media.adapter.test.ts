import { describe, it, expect, beforeEach } from "vitest";
import { WebMediaAdapter } from "@/providers/media/web.media.adapter";

describe("Web Media Adapter (Phase 1 §9.4)", () => {
  let adapter: WebMediaAdapter;

  beforeEach(() => {
    adapter = new WebMediaAdapter();
  });

  it("lists curated default media assets", async () => {
    const list = await adapter.listMedia("org-default");
    expect(list.length).toBeGreaterThanOrEqual(4);

    const hasImage = list.some((m) => m.type === "image");
    const hasVideo = list.some((m) => m.type === "video");
    expect(hasImage).toBe(true);
    expect(hasVideo).toBe(true);
  });

  it("filters media by type", async () => {
    const images = await adapter.listMedia("org-default", "image");
    expect(images.every((m) => m.type === "image")).toBe(true);

    const videos = await adapter.listMedia("org-default", "video");
    expect(videos.every((m) => m.type === "video")).toBe(true);
  });

  it("resolves storage path to public url", async () => {
    const list = await adapter.listMedia("org-default");
    const first = list[0];
    const resolved = await adapter.resolveUrl(first.storagePath, first.storageType);
    expect(resolved).toBe(first.url);
  });

  it("generates thumbnail url", async () => {
    const list = await adapter.listMedia("org-default");
    const thumb = await adapter.generateThumbnail(list[0].id);
    expect(thumb).toBe(list[0].url);
  });

  it("deletes media from adapter list", async () => {
    const list = await adapter.listMedia("org-default");
    const targetId = list[0].id;
    await adapter.deleteMedia(targetId);

    const afterList = await adapter.listMedia("org-default");
    expect(afterList.some((m) => m.id === targetId)).toBe(false);
  });
});
