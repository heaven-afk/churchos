/**
 * Service Repository — Phase 1 §7.5
 *
 * Provides persistence abstraction between application state and Supabase / local storage.
 * Follows offline-first design: operations succeed locally if Supabase is offline or unconfigured.
 */

import { createClient } from "@/lib/supabase/client";
import type { Service, ServiceItem } from "@/types/service.types";

const LOCAL_STORAGE_SERVICES_KEY = "veyrin_services_index";
const LOCAL_STORAGE_SERVICE_PREFIX = "veyrin_service_";

/** In-memory fallback for SSR or environments without localStorage */
const memoryStore = new Map<string, Service>();

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes("placeholder.supabase.co") || key.includes("placeholder")) {
    return false;
  }
  return true;
}

function getLocalServiceIds(): string[] {
  if (typeof window === "undefined") return Array.from(memoryStore.keys());
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SERVICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalServiceIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_SERVICES_KEY, JSON.stringify(ids));
  } catch {
    // Storage quota or private browsing exceptions safely handled
  }
}

function getLocalService(id: string): Service | null {
  if (typeof window === "undefined") return memoryStore.get(id) ?? null;
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_SERVICE_PREFIX}${id}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through
  }
  return memoryStore.get(id) ?? null;
}

function setLocalService(service: Service): void {
  memoryStore.set(service.id, service);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_SERVICE_PREFIX}${service.id}`,
      JSON.stringify(service)
    );
    const ids = getLocalServiceIds();
    if (!ids.includes(service.id)) {
      setLocalServiceIds([service.id, ...ids]);
    }
  } catch {
    // Storage quota or private browsing exceptions safely handled
  }
}

function removeLocalService(id: string): void {
  memoryStore.delete(id);
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_SERVICE_PREFIX}${id}`);
    const ids = getLocalServiceIds().filter((i) => i !== id);
    setLocalServiceIds(ids);
  } catch {
    // fall through
  }
}

/** Default starter service for new workspaces */
export function createDefaultService(title = "Sunday Morning Service"): Service {
  const now = new Date();
  // Next Sunday at 10:00 AM
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7));
  nextSunday.setHours(10, 0, 0, 0);

  const id = `service-default-${Date.now().toString(36)}`;
  return {
    id,
    title,
    date: nextSunday.toISOString(),
    organizationId: "org-default",
    items: [],
    isSynced: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export class ServiceRepository {
  /**
   * Retrieves all services for an organization.
   */
  async getServices(organizationId = "org-default"): Promise<Service[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("services")
          .select("id, organization_id, title, description, scheduled_at, created_at, updated_at")
          .eq("organization_id", organizationId)
          .order("scheduled_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row) => ({
            id: row.id,
            title: row.title,
            date: row.scheduled_at,
            organizationId: row.organization_id,
            items: [],
            isSynced: true,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
        }
      } catch {
        // Network or credential failure — fall through to local storage
      }
    }

    // Local fallback
    const ids = getLocalServiceIds();
    const services: Service[] = [];
    for (const id of ids) {
      const s = getLocalService(id);
      if (s) services.push(s);
    }

    if (services.length === 0) {
      const initial = createDefaultService();
      setLocalService(initial);
      return [initial];
    }

    return services.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Loads a complete service with all its items in deterministic order.
   */
  async getService(id: string): Promise<Service | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: sRow, error: sErr } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();

        if (!sErr && sRow) {
          const { data: itemRows, error: iErr } = await supabase
            .from("service_items")
            .select("*")
            .eq("service_id", id)
            .order("order", { ascending: true });

          const items: ServiceItem[] =
            !iErr && itemRows
              ? itemRows.map((r) => ({
                  id: r.id,
                  type: r.type,
                  order: r.order,
                  title: r.title,
                  contentId: r.content_id,
                  content: r.content,
                  notes: r.notes ?? undefined,
                  isRemoved: r.is_removed,
                  createdAt: r.created_at,
                  updatedAt: r.updated_at,
                }))
              : [];

          const service: Service = {
            id: sRow.id,
            title: sRow.title,
            date: sRow.scheduled_at,
            organizationId: sRow.organization_id,
            items,
            isSynced: true,
            createdAt: sRow.created_at,
            updatedAt: sRow.updated_at,
          };

          // Cache locally
          setLocalService(service);
          return service;
        }
      } catch {
        // Fall back to local
      }
    }

    return getLocalService(id);
  }

  /**
   * Creates and stores a new service.
   */
  async createService(
    serviceData: Omit<Service, "id" | "createdAt" | "updatedAt" | "isSynced">
  ): Promise<Service> {
    const now = new Date().toISOString();
    const id = `svc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const isSynced = false;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("services")
          .insert({
            organization_id: serviceData.organizationId,
            title: serviceData.title,
            scheduled_at: serviceData.date,
          })
          .select("id, created_at, updated_at")
          .single();

        if (!error && data) {
          const service: Service = {
            ...serviceData,
            id: data.id,
            isSynced: true,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
          setLocalService(service);
          return service;
        }
      } catch {
        // Save locally
      }
    }

    const localService: Service = {
      ...serviceData,
      id,
      isSynced,
      createdAt: now,
      updatedAt: now,
    };

    setLocalService(localService);
    return localService;
  }

  /**
   * Saves a service and its ordered items.
   */
  async saveServiceWithItems(service: Service): Promise<Service> {
    const now = new Date().toISOString();
    let isSynced = false;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // 1. Upsert service
        const { error: sErr } = await supabase.from("services").upsert({
          id: service.id,
          organization_id: service.organizationId,
          title: service.title,
          scheduled_at: service.date,
          updated_at: now,
        });

        if (!sErr) {
          // 2. Upsert items
          if (service.items.length > 0) {
            const payload = service.items.map((item, idx) => ({
              id: item.id,
              service_id: service.id,
              type: item.type,
              order: idx,
              title: item.title,
              content_id: item.contentId,
              content: (item.content as object) ?? {},
              notes: item.notes ?? null,
              is_removed: item.isRemoved,
              updated_at: now,
            }));

            const { error: iErr } = await supabase
              .from("service_items")
              .upsert(payload);

            if (!iErr) {
              isSynced = true;
            }
          } else {
            isSynced = true;
          }
        }
      } catch {
        // Fall back to local
      }
    }

    const updatedService: Service = {
      ...service,
      isSynced,
      updatedAt: now,
    };

    setLocalService(updatedService);
    return updatedService;
  }

  /**
   * Deletes a service.
   */
  async deleteService(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from("services").delete().eq("id", id);
      } catch {
        // fall through
      }
    }

    removeLocalService(id);
  }
}

export const serviceRepository = new ServiceRepository();
