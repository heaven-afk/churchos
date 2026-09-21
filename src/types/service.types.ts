/**
 * Service domain types.
 *
 * A Service represents a single church gathering's rundown.
 * ServiceItems are the ordered list of content within a service.
 */

export type ServiceItemType =
  | 'song'
  | 'scripture'
  | 'text'
  | 'image'
  | 'video'
  | 'announcement'
  | 'custom';

export interface ServiceItem {
  id: string;
  type: ServiceItemType;
  title: string;
  /** Stable sort order — integer-based to allow gapless re-ordering */
  order: number;
  /** Reference to the underlying content entity */
  contentId: string;
  /** Optional operator-facing notes, not displayed on output */
  notes?: string;
  /** Soft-deleted flag — never hard-delete items during a live service */
  isRemoved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  date: string;
  items: ServiceItem[];
  /** Organisation this service belongs to */
  organizationId: string;
  /** Whether this service has been saved to the cloud */
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}
