/**
 * Authentication & Organization Service — Phase 1 §8
 *
 * Provides authentication and organization tenant management via Supabase Auth.
 * Includes offline/local development fallback when running without cloud credentials.
 */

import { createClient } from "@/lib/supabase/client";
import type { UserProfile, Organization, AuthSession } from "@/types/auth.types";

const LOCAL_STORAGE_AUTH_KEY = "veyrin_auth_session";

export const DEFAULT_LOCAL_ORG: Organization = {
  id: "org-default",
  name: "Grace Community Church",
  slug: "grace-community",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_LOCAL_USER: UserProfile = {
  id: "user-local-operator",
  email: "operator@veyrin.local",
  displayName: "Lead Operator",
  role: "OPERATOR",
  organizationId: DEFAULT_LOCAL_ORG.id,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  if (url.includes("placeholder.supabase.co") || key.includes("placeholder")) {
    return false;
  }
  return true;
}

let memorySession: AuthSession | null = null;

export class AuthService {
  /**
   * Retrieves the current active session.
   */
  async getSession(): Promise<AuthSession | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!error && user) {
          const profile = await this.getUserProfile(user.id);
          const organization = profile?.organizationId
            ? await this.getOrganization(profile.organizationId)
            : DEFAULT_LOCAL_ORG;

          const sessionUser: UserProfile = profile ?? {
            id: user.id,
            email: user.email ?? "unknown@user.com",
            displayName:
              user.user_metadata?.display_name ??
              user.email?.split("@")[0] ??
              "Operator",
            role: "OPERATOR",
            organizationId: organization.id,
            createdAt: user.created_at,
            updatedAt: user.updated_at ?? user.created_at,
          };

          return {
            user: sessionUser,
            organization,
          };
        }
      } catch {
        // Fall through to local
      }
    }

    // Local / offline session recovery
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch {
        // fall through
      }
    }

    if (memorySession) {
      return memorySession;
    }

    // Default development operator session
    return {
      user: DEFAULT_LOCAL_USER,
      organization: DEFAULT_LOCAL_ORG,
    };
  }

  /**
   * Signs in with email and password.
   */
  async signInWithPassword(
    email: string,
    password: string
  ): Promise<AuthSession> {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        throw new Error(error?.message ?? "Invalid email or password.");
      }

      const profile = await this.getUserProfile(data.user.id);
      const organization = profile?.organizationId
        ? await this.getOrganization(profile.organizationId)
        : DEFAULT_LOCAL_ORG;

      const session: AuthSession = {
        user: profile ?? {
          id: data.user.id,
          email: data.user.email ?? email,
          displayName:
            data.user.user_metadata?.display_name ??
            email.split("@")[0] ??
            "Operator",
          role: "OPERATOR",
          organizationId: organization.id,
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at ?? data.user.created_at,
        },
        organization,
        token: data.session?.access_token,
      };

      this.saveLocalSession(session);
      return session;
    }

    // Local development fallback authentication
    const displayName = email.split("@")[0] || "Operator";
    const session: AuthSession = {
      user: {
        id: `user-${Date.now().toString(36)}`,
        email,
        displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        role: "OPERATOR",
        organizationId: DEFAULT_LOCAL_ORG.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      organization: DEFAULT_LOCAL_ORG,
    };

    this.saveLocalSession(session);
    return session;
  }

  /**
   * Signs up a new user with optional organization creation.
   */
  async signUp(
    email: string,
    password: string,
    displayName: string,
    organizationName = "My Church"
  ): Promise<AuthSession> {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            organization_name: organizationName,
          },
        },
      });

      if (error || !data.user) {
        throw new Error(error?.message ?? "Failed to create account.");
      }

      // Create organization and profile
      const org = await this.createOrganization(organizationName);
      const profile: UserProfile = {
        id: data.user.id,
        email,
        displayName,
        role: "OWNER",
        organizationId: org.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await supabase.from("profiles").upsert({
          id: profile.id,
          email: profile.email,
          display_name: profile.displayName,
          role: profile.role,
          organization_id: profile.organizationId,
        });
      } catch {
        // Safe fall-through
      }

      const session: AuthSession = {
        user: profile,
        organization: org,
        token: data.session?.access_token,
      };

      this.saveLocalSession(session);
      return session;
    }

    // Local fallback signup
    const org: Organization = {
      id: `org-${Date.now().toString(36)}`,
      name: organizationName,
      slug: organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      user: {
        id: `user-${Date.now().toString(36)}`,
        email,
        displayName: displayName || "Operator",
        role: "OWNER",
        organizationId: org.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      organization: org,
    };

    this.saveLocalSession(session);
    return session;
  }

  /**
   * Signs out the active user.
   */
  async signOut(): Promise<void> {
    memorySession = null;
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // fall through
      }
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      } catch {
        // fall through
      }
    }
  }

  /**
   * Loads user profile from database.
   */
  private async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          email: data.email,
          displayName: data.display_name,
          role: data.role as UserProfile["role"],
          organizationId: data.organization_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Loads organization by ID.
   */
  private async getOrganization(orgId: string): Promise<Organization> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", orgId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_LOCAL_ORG;
  }

  /**
   * Creates an organization in database.
   */
  private async createOrganization(name: string): Promise<Organization> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("organizations")
        .insert({ name, slug })
        .select("*")
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {
      // ignore
    }

    return {
      id: `org-${Date.now().toString(36)}`,
      name,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private saveLocalSession(session: AuthSession): void {
    memorySession = session;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(session));
      } catch {
        // ignore
      }
    }
  }
}

export const authService = new AuthService();
