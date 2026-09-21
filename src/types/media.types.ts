/**
 * Media domain types.
 *
 * Media metadata is separated from the actual files. The MediaAdapter
 * abstraction handles resolution of local vs. cloud media.
 */

export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface MediaItem {
  id: string;
  type: MediaType;
  name: string;
  /** MIME type */
  mimeType: string;
  /** Size in bytes */
  size: number;
  /** Width in pixels (images/videos) */
  width?: number;
  /** Height in pixels (images/videos) */
  height?: number;
  /** Duration in seconds (video/audio) */
  duration?: number;
  /**
   * Where the file actually lives.
   * 'local' = filesystem (desktop), 'cloud' = Supabase Storage
   */
  storageType: 'local' | 'cloud';
  /**
   * Opaque path/key — interpreted by the MediaAdapter.
   * Never construct a URL from this directly in UI code.
   */
  storagePath: string;
  /** Resolved public URL — populated by the MediaAdapter at runtime */
  url?: string;
  /** Low-resolution base64 preview for thumbnails */
  blurDataUrl?: string;
  tags: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
