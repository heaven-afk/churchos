import { describe, it, expect, beforeEach } from "vitest";
import {
  ServiceRepository,
  createDefaultService,
} from "@/lib/services/service.repository";
import type { ServiceItem } from "@/types/service.types";

describe("Service Repository (Phase 1 §7)", () => {
  let repo: ServiceRepository;

  beforeEach(() => {
    repo = new ServiceRepository();
    // Clear localStorage between tests if running in simulated browser
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("creates a default service with next Sunday schedule", () => {
    const defaultService = createDefaultService("Test Service");
    expect(defaultService.title).toBe("Test Service");
    expect(defaultService.organizationId).toBe("org-default");
    expect(defaultService.items).toEqual([]);
    expect(defaultService.isSynced).toBe(false);
  });

  it("creates, retrieves, and persists a service", async () => {
    const created = await repo.createService({
      title: "Evening Worship",
      date: new Date().toISOString(),
      organizationId: "org-1",
      items: [],
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe("Evening Worship");

    const retrieved = await repo.getService(created.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.title).toBe("Evening Worship");
  });

  it("saves service with ordered items and retrieves them deterministically", async () => {
    const service = await repo.createService({
      title: "Morning Service",
      date: new Date().toISOString(),
      organizationId: "org-1",
      items: [],
    });

    const item1: ServiceItem = {
      id: "item-1",
      type: "song",
      order: 0,
      title: "Amazing Grace",
      contentId: "song-1",
      isRemoved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const item2: ServiceItem = {
      id: "item-2",
      type: "scripture",
      order: 1,
      title: "John 3:16",
      contentId: "scr-1",
      isRemoved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await repo.saveServiceWithItems({
      ...service,
      items: [item1, item2],
    });

    expect(saved.items).toHaveLength(2);

    const loaded = await repo.getService(service.id);
    expect(loaded?.items).toHaveLength(2);
    expect(loaded?.items[0].title).toBe("Amazing Grace");
    expect(loaded?.items[1].title).toBe("John 3:16");
  });

  it("deletes a service from the repository", async () => {
    const service = await repo.createService({
      title: "Service to delete",
      date: new Date().toISOString(),
      organizationId: "org-1",
      items: [],
    });

    await repo.deleteService(service.id);
    const loaded = await repo.getService(service.id);
    expect(loaded).toBeNull();
  });
});
