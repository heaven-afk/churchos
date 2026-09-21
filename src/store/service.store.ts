/**
 * Service Store — spec §37 (Application State)
 *
 * Manages the current service, selected item, and slide index.
 * Persistence (Supabase / local) is handled by separate service layer functions,
 * not in this store.
 */

import { create } from 'zustand';
import type { Service, ServiceItem } from '@/types/service.types';

interface ServiceState {
  /** The service currently open in the operator workstation */
  currentService: Service | null;
  /** ID of the selected service item */
  selectedItemId: string | null;
  /** Index of the selected slide within the selected item */
  selectedSlideIndex: number;
  /** True while the service is being loaded */
  isLoading: boolean;
  /** Non-null if a load/save error has occurred */
  error: string | null;

  // Actions
  setCurrentService: (service: Service | null) => void;
  selectItem: (itemId: string) => void;
  setSelectedSlideIndex: (index: number) => void;
  addItem: (item: ServiceItem) => void;
  removeItem: (itemId: string) => void;
  reorderItems: (itemIds: string[]) => void;
  updateItem: (itemId: string, patch: Partial<ServiceItem>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useServiceStore = create<ServiceState>((set) => ({
  currentService: null,
  selectedItemId: null,
  selectedSlideIndex: 0,
  isLoading: false,
  error: null,

  setCurrentService: (service) =>
    set({ currentService: service, selectedItemId: null, selectedSlideIndex: 0 }),

  selectItem: (itemId) =>
    set({ selectedItemId: itemId, selectedSlideIndex: 0 }),

  setSelectedSlideIndex: (index) =>
    set({ selectedSlideIndex: index }),

  addItem: (item) =>
    set((s) => {
      if (!s.currentService) return s;
      return {
        currentService: {
          ...s.currentService,
          items: [...s.currentService.items, item],
        },
      };
    }),

  removeItem: (itemId) =>
    set((s) => {
      if (!s.currentService) return s;
      return {
        currentService: {
          ...s.currentService,
          items: s.currentService.items.map((item) =>
            item.id === itemId ? { ...item, isRemoved: true } : item
          ),
        },
        selectedItemId:
          s.selectedItemId === itemId ? null : s.selectedItemId,
      };
    }),

  reorderItems: (itemIds) =>
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
      };
    }),

  updateItem: (itemId, patch) =>
    set((s) => {
      if (!s.currentService) return s;
      return {
        currentService: {
          ...s.currentService,
          items: s.currentService.items.map((item) =>
            item.id === itemId ? { ...item, ...patch } : item
          ),
        },
      };
    }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

// ─── Derived selectors ────────────────────────────────────────────────────────

/** Active (non-removed) items in order */
export function selectActiveItems(state: ServiceState): ServiceItem[] {
  if (!state.currentService) return [];
  return [...state.currentService.items]
    .filter((i) => !i.isRemoved)
    .sort((a, b) => a.order - b.order);
}
