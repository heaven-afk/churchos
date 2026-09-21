/**
 * Auth Store — Phase 1 §8
 *
 * Manages authenticated user state and active organization tenant.
 */

import { create } from "zustand";
import type { UserProfile, Organization } from "@/types/auth.types";
import {
  authService,
  DEFAULT_LOCAL_USER,
  DEFAULT_LOCAL_ORG,
} from "@/lib/auth/auth.service";

interface AuthState {
  user: UserProfile | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    orgName?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_LOCAL_USER,
  organization: DEFAULT_LOCAL_ORG,
  isAuthenticated: true,
  isLoading: false,
  error: null,

  initAuth: async () => {
    set({ isLoading: true });
    try {
      const session = await authService.getSession();
      if (session) {
        set({
          user: session.user,
          organization: session.organization,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          organization: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await authService.signInWithPassword(email, password);
      set({
        user: session.user,
        organization: session.organization,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  signUp: async (
    email: string,
    password: string,
    displayName: string,
    orgName?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const session = await authService.signUp(
        email,
        password,
        displayName,
        orgName
      );
      set({
        user: session.user,
        organization: session.organization,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to sign up.";
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({
        user: null,
        organization: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setError: (error) => set({ error }),
}));
