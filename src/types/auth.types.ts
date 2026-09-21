/**
 * Authentication and Organization domain types — Phase 1 §8
 */

export type UserRole = "OWNER" | "ADMIN" | "OPERATOR";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: UserProfile;
  organization: Organization | null;
  token?: string;
}
