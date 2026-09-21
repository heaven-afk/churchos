import { describe, it, expect, beforeEach } from "vitest";
import { useServiceStore, selectActiveItems } from "@/store/service.store";
import type { ServiceItem } from "@/types/service.types";

describe("Service Item Deterministic Ordering (Phase 1 §7.4)", () => {
  const itemA: ServiceItem = {
    id: "item-a",
    type: "song",
    order: 0,
    title: "Opening Song: Amazing Grace",
    contentId: "song-ag",
    isRemoved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const itemB: ServiceItem = {
    id: "item-b",
    type: "scripture",
    order: 1,
    title: "Scripture: John 3:16",
    contentId: "scr-jhn3",
    isRemoved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const itemC: ServiceItem = {
    id: "item-c",
    type: "song",
    order: 2,
    title: "Closing Song: How Great Thou Art",
    contentId: "song-hgta",
    isRemoved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    const current = useServiceStore.getState().currentService;
    useServiceStore.setState({
      currentService: {
        ...(current ?? {
          id: "svc-test",
          title: "Order Test Service",
          date: new Date().toISOString(),
          organizationId: "org-1",
          isSynced: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        items: [{ ...itemA }, { ...itemB }, { ...itemC }],
      },
    });
  });

  it("moves an item down deterministically", () => {
    // Initial order: A (0), B (1), C (2)
    let items = selectActiveItems(useServiceStore.getState());
    expect(items.map((i) => i.id)).toEqual(["item-a", "item-b", "item-c"]);

    // Move A down
    useServiceStore.getState().moveItem("item-a", "down");

    items = selectActiveItems(useServiceStore.getState());
    expect(items.map((i) => i.id)).toEqual(["item-b", "item-a", "item-c"]);
    expect(items[0].order).toBe(0);
    expect(items[1].order).toBe(1);
    expect(items[2].order).toBe(2);
  });

  it("moves an item up deterministically", () => {
    // Move C up
    useServiceStore.getState().moveItem("item-c", "up");

    const items = selectActiveItems(useServiceStore.getState());
    expect(items.map((i) => i.id)).toEqual(["item-a", "item-c", "item-b"]);
    expect(items[0].order).toBe(0);
    expect(items[1].order).toBe(1);
    expect(items[2].order).toBe(2);
  });

  it("handles boundary conditions safely without mutating list", () => {
    // Try moving top item up
    useServiceStore.getState().moveItem("item-a", "up");
    let items = selectActiveItems(useServiceStore.getState());
    expect(items.map((i) => i.id)).toEqual(["item-a", "item-b", "item-c"]);

    // Try moving bottom item down
    useServiceStore.getState().moveItem("item-c", "down");
    items = selectActiveItems(useServiceStore.getState());
    expect(items.map((i) => i.id)).toEqual(["item-a", "item-b", "item-c"]);
  });

  it("reorders arbitrary array of IDs cleanly", () => {
    useServiceStore.getState().reorderItems(["item-c", "item-a", "item-b"]);
    const items = selectActiveItems(useServiceStore.getState());
    expect(items.map((i) => i.id)).toEqual(["item-c", "item-a", "item-b"]);
  });
});
