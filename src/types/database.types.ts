/**
 * Supabase Database Types — Phase 1 §7.1
 *
 * Types for database records and JSON structures in Supabase.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          organization_id: string | null;
          email: string;
          display_name: string;
          role: "OWNER" | "ADMIN" | "OPERATOR";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          email: string;
          display_name: string;
          role?: "OWNER" | "ADMIN" | "OPERATOR";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          email?: string;
          display_name?: string;
          role?: "OWNER" | "ADMIN" | "OPERATOR";
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          description: string | null;
          scheduled_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          description?: string | null;
          scheduled_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          title?: string;
          description?: string | null;
          scheduled_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_items: {
        Row: {
          id: string;
          service_id: string;
          type:
            | "song"
            | "scripture"
            | "text"
            | "image"
            | "video"
            | "announcement"
            | "custom";
          order: number;
          title: string;
          content_id: string;
          content: Json;
          notes: string | null;
          is_removed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          type:
            | "song"
            | "scripture"
            | "text"
            | "image"
            | "video"
            | "announcement"
            | "custom";
          order: number;
          title: string;
          content_id: string;
          content?: Json;
          notes?: string | null;
          is_removed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          type?:
            | "song"
            | "scripture"
            | "text"
            | "image"
            | "video"
            | "announcement"
            | "custom";
          order?: number;
          title?: string;
          content_id?: string;
          content?: Json;
          notes?: string | null;
          is_removed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
