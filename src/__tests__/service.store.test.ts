import { describe, it, expect, beforeEach } from "vitest";
import { useServiceStore, selectActiveItems } from "@/store/service.store";
import type { ServiceItem } from "@/types/service.types";

describe("Service Store (Phase 1 §7)", () => {
  beforeEach(() => {
    // Reset state
    const current = useServiceStore.getState().currentService;
    if (current) {
      useServiceStore.setState({
        currentService: { ...current, items: [] },
        selectedItemId: null,
        selectedSlideIndex: 0,
        syncStatus: "local",
        error: null,
      });
    }
  });

  it("initializes with an active service and stable selector", () => {
    const state = useServiceStore.getState();
    expect(state.currentService).not.toBeNull();
    expect(state.currentService?.title).toBeDefined();

    const activeItems = selectActiveItems(state);
    expect(Array.isArray(activeItems)).toBe(true);
  });

  it("adds items and auto-assigns deterministic order", () => {
    const item1: ServiceItem = {
      id: "item-test-1",
      type: "song",
      order: 0,
      title: "10,000 Reasons",
      contentId: "song-10k",
      isRemoved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useServiceStore.getState().addItem(item1);

    let state = useServiceStore.getState();
    let items = selectActiveItems(state);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("10,000 Reasons");
    expect(items[0].order).toBe(0);

    const item2: ServiceItem = {
      id: "item-test-2",
      type: "scripture",
      order: 0,
      title: "Psalm 23",
      contentId: "scr-ps23",
      isRemoved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useServiceStore.getState().addItem(item2);

    state = useServiceStore.getState();
    items = selectActiveItems(state);
    expect(items).toHaveLength(2);
    expect(items[1].title).toBe("Psalm 23");
    expect(items[1].order).toBe(1);
  });

  it("removes items via soft-delete", () => {
    const item1: ServiceItem = {
      id: "item-del-1",
      type: "song",
      order: 0,
      title: "How Great Thou Art",
      contentId: "song-hgta",
      isRemoved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useServiceStore.getState().addItem(item1);
    expect(selectActiveItems(useServiceStore.getState())).toHaveLength(1);

    useServiceStore.getState().removeItem("item-del-1");
    expect(selectActiveItems(useServiceStore.getState())).toHaveLength(0);
    // Raw item remains soft-deleted
    expect(
      useServiceStore.getState().currentService?.items.find((i) => i.id === "item-del-1")?.isRemoved
    ).toBe(true);
  });

  it("creates a new service and switches to it", async () => {
    const newService = await useServiceStore
      .getState()
      .createService("Youth Night");

    expect(newService.title).toBe("Youth Night");
    expect(useServiceStore.getState().currentService?.title).toBe("Youth Night");
    expect(
      useServiceStore.getState().savedServices.some((s) => s.title === "Youth Night")
    ).toBe(true);
  });
});
