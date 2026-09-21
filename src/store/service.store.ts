/**
 * Service Store — spec §37 (Application State) & Phase 1 §7
 *
 * Manages the current service, service catalog, selected item, and slide index.
 * Integrates with ServiceRepository for deterministic persistence and offline support.
 */

import { create } from "zustand";
import type { Service, ServiceItem } from "@/types/service.types";
import {
  serviceRepository,
  createDefaultService,
} from "@/lib/services/service.repository";

export type SyncStatus = "synced" | "local" | "syncing" | "error";

interface ServiceState {
  /** The service currently open in the operator workstation */
  currentService: Service | null;
  /** List of available services for switching */
  savedServices: Service[];
  /** ID of the selected service item */
  selectedItemId: string | null;
  /** Index of the selected slide within the selected item */
  selectedSlideIndex: number;
  /** True while the service is being loaded or saved */
  isLoading: boolean;
  /** Sync status with cloud/Supabase */
  syncStatus: SyncStatus;
  /** User-facing error message */
  error: string | null;

  // Actions
  loadServices: (organizationId?: string) => Promise<void>;
  switchService: (id: string) => Promise<void>;
  createService: (title: string, date?: string) => Promise<Service>;
  saveCurrentService: () => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  setCurrentService: (service: Service | null) => void;
  selectItem: (itemId: string) => void;
  setSelectedSlideIndex: (index: number) => void;
  addItem: (item: ServiceItem) => void;
  removeItem: (itemId: string) => void;
  moveItem: (itemId: string, direction: "up" | "down") => void;
  reorderItems: (itemIds: string[]) => void;
  updateItem: (itemId: string, patch: Partial<ServiceItem>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DEFAULT_INITIAL_SERVICE = createDefaultService();

export const useServiceStore = create<ServiceState>((set, get) => ({
  currentService: DEFAULT_INITIAL_SERVICE,
  savedServices: [DEFAULT_INITIAL_SERVICE],
  selectedItemId: null,
  selectedSlideIndex: 0,
  isLoading: false,
  syncStatus: "local",
  error: null,

  loadServices: async (organizationId = "org-default") => {
    set({ isLoading: true, error: null });
    try {
      const services = await serviceRepository.getServices(organizationId);
      const current = get().currentService;
      let activeService = current;

      // If current service not in list or is default placeholder, load first saved
      if (!current || !services.some((s) => s.id === current.id)) {
        if (services.length > 0) {
          activeService = await serviceRepository.getService(services[0].id);
        }
      }

      set({
        savedServices: services,
        currentService: activeService ?? services[0] ?? DEFAULT_INITIAL_SERVICE,
        syncStatus: activeService?.isSynced ? "synced" : "local",
        isLoading: false,
      });
    } catch {
      set({
        isLoading: false,
        error: "Unable to load services. Using local workspace data.",
      });
    }
  },

  switchService: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const service = await serviceRepository.getService(id);
      if (service) {
        set({
          currentService: service,
          selectedItemId: null,
          selectedSlideIndex: 0,
          syncStatus: service.isSynced ? "synced" : "local",
          isLoading: false,
        });
      } else {
        set({ isLoading: false, error: "Service not found." });
      }
    } catch {
      set({
        isLoading: false,
        error: "Unable to open service. Your changes are still available locally.",
      });
    }
  },

  createService: async (title: string, date?: string) => {
    set({ isLoading: true, error: null, syncStatus: "syncing" });
    try {
      const scheduledDate = date ?? new Date().toISOString();
      const newService = await serviceRepository.createService({
        title,
        date: scheduledDate,
        organizationId: "org-default",
        items: [],
      });

      set((state) => ({
        currentService: newService,
        savedServices: [newService, ...state.savedServices.filter((s) => s.id !== newService.id)],
        selectedItemId: null,
        selectedSlideIndex: 0,
        syncStatus: newService.isSynced ? "synced" : "local",
        isLoading: false,
      }));

      return newService;
    } catch {
      const fallback = createDefaultService(title);
      set((state) => ({
        currentService: fallback,
        savedServices: [fallback, ...state.savedServices],
        syncStatus: "local",
        isLoading: false,
        error: "Unable to create service in cloud. Created locally.",
      }));
      return fallback;
    }
  },

  saveCurrentService: async () => {
    const current = get().currentService;
    if (!current) return;

    set({ syncStatus: "syncing", error: null });
    try {
      const saved = await serviceRepository.saveServiceWithItems(current);
      set((state) => ({
        currentService: saved,
        savedServices: state.savedServices.map((s) =>
          s.id === saved.id ? saved : s
        ),
        syncStatus: saved.isSynced ? "synced" : "local",
      }));
    } catch {
      set({
        syncStatus: "error",
        error: "Unable to save service to cloud. Your changes are saved locally.",
      });
    }
  },

  deleteService: async (id: string) => {
    set({ isLoading: true });
    try {
      await serviceRepository.deleteService(id);
      set((state) => {
        const remaining = state.savedServices.filter((s) => s.id !== id);
        const nextCurrent =
          state.currentService?.id === id
            ? remaining[0] ?? DEFAULT_INITIAL_SERVICE
            : state.currentService;
        return {
          savedServices: remaining,
          currentService: nextCurrent,
          isLoading: false,
        };
      });
    } catch {
      set({
        isLoading: false,
        error: "Unable to delete service from cloud. Removed locally.",
      });
    }
  },

  setCurrentService: (service) =>
    set({ currentService: service, selectedItemId: null, selectedSlideIndex: 0 }),

  selectItem: (itemId) =>
    set({ selectedItemId: itemId, selectedSlideIndex: 0 }),

  setSelectedSlideIndex: (index) =>
    set({ selectedSlideIndex: index }),

  addItem: (item) => {
    set((s) => {
      const service = s.currentService ?? DEFAULT_INITIAL_SERVICE;
      const order = service.items.length;
      const newItem = { ...item, order };
      const updated = {
        ...service,
        items: [...service.items, newItem],
      };
      return {
        currentService: updated,
        syncStatus: "local",
      };
    });

    // Auto-save updated service in background
    get().saveCurrentService();
  },

  removeItem: (itemId) => {
    set((s) => {
      if (!s.currentService) return s;
      const updated = {
        ...s.currentService,
        items: s.currentService.items.map((item) =>
          item.id === itemId ? { ...item, isRemoved: true } : item
        ),
      };
      return {
        currentService: updated,
        selectedItemId: s.selectedItemId === itemId ? null : s.selectedItemId,
        syncStatus: "local",
      };
    });

    get().saveCurrentService();
  },

  moveItem: (itemId, direction) => {
    set((s) => {
      if (!s.currentService) return s;
      const activeItems = selectActiveItems(s);
      const currentIndex = activeItems.findIndex((i) => i.id === itemId);
      if (currentIndex === -1) return s;

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= activeItems.length) return s;

      // Swap in active list
      const reorderedActive = [...activeItems];
      const temp = reorderedActive[currentIndex];
      reorderedActive[currentIndex] = reorderedActive[targetIndex];
      reorderedActive[targetIndex] = temp;

      // Assign new sequential orders
      const orderMap = new Map<string, number>();
      reorderedActive.forEach((item, idx) => {
        orderMap.set(item.id, idx);
      });

      const updatedItems = s.currentService.items.map((item) => {
        if (orderMap.has(item.id)) {
          return { ...item, order: orderMap.get(item.id)! };
        }
        return item;
      });

      return {
        currentService: {
          ...s.currentService,
          items: updatedItems,
        },
        syncStatus: "local",
      };
    });

    get().saveCurrentService();
  },

  reorderItems: (itemIds) => {
    set((s) => {
      if (!s.currentService) return s;
      const itemMap = new Map(
        s.currentService.items.map((item) => [item.id, item])
      );
      const reordered = itemIds
        .map((id, index) => {
          const item = itemMap.get(id);
          return item ? { ...item, order: index } : null;
        })
        .filter(Boolean) as ServiceItem[];

      return {
        currentService: { ...s.currentService, items: reordered },
        syncStatus: "local",
      };
    });

    get().saveCurrentService();
  },

  updateItem: (itemId, patch) => {
    set((s) => {
      if (!s.currentService) return s;
      return {
        currentService: {
          ...s.currentService,
          items: s.currentService.items.map((item) =>
            item.id === itemId ? { ...item, ...patch } : item
          ),
        },
        syncStatus: "local",
      };
    });

    get().saveCurrentService();
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

// ─── Derived selectors ────────────────────────────────────────────────────────

const EMPTY_ITEMS: ServiceItem[] = [];
let lastItemsRef: ServiceItem[] | null = null;
let cachedActiveItems: ServiceItem[] = EMPTY_ITEMS;

/** Active (non-removed) items in order — cached for React 19 snapshot stability */
export function selectActiveItems(state: ServiceState): ServiceItem[] {
  const items = state.currentService?.items;
  if (!items || items.length === 0) return EMPTY_ITEMS;
  if (items === lastItemsRef) return cachedActiveItems;

  lastItemsRef = items;
  cachedActiveItems = items
    .filter((i) => !i.isRemoved)
    .sort((a, b) => a.order - b.order);
  return cachedActiveItems;
}
