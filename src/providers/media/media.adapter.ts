/**
 * MediaAdapter interface
 *
 * Abstracts media file access across storage backends.
 * Web implementation: Supabase Storage URLs.
 * Desktop implementation: local filesystem paths via Tauri.
 */

import type { MediaItem, MediaType } from '@/types/media.types';

export interface MediaUploadOptions {
  organizationId: string;
  tags?: string[];
}

export interface MediaAdapter {
  /**
   * Resolve a storage path to a usable URL for the current environment.
   */
  resolveUrl(storagePath: string, storageType: 'local' | 'cloud'): Promise<string>;

  /**
   * List media items, optionally filtered by type.
   */
  listMedia(organizationId: string, type?: MediaType): Promise<MediaItem[]>;

  /**
   * Upload a file and return the created MediaItem.
   */
  uploadMedia(file: File, options: MediaUploadOptions): Promise<MediaItem>;

  /**
   * Delete a media item by ID.
   */
  deleteMedia(mediaId: string): Promise<void>;

  /**
   * Generate a thumbnail/preview for an image or video.
   */
  generateThumbnail(mediaId: string): Promise<string>;
}
