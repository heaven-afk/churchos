import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/store/auth.store";

describe("Auth Store (Phase 1 §8)", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("initializes with authenticated operator in default workspace", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.displayName).toBe("Lead Operator");
    expect(state.organization?.name).toBe("Grace Community Church");
  });

  it("handles sign in and updates user state", async () => {
    await useAuthStore.getState().signIn("tech@church.org", "password");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe("tech@church.org");
    expect(state.user?.displayName).toBe("Tech");
  });

  it("handles sign up and establishes owner role", async () => {
    await useAuthStore.getState().signUp(
      "lead@calvary.org",
      "password",
      "Pastor David",
      "Calvary Chapel"
    );

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.displayName).toBe("Pastor David");
    expect(state.user?.role).toBe("OWNER");
    expect(state.organization?.name).toBe("Calvary Chapel");
  });

  it("handles sign out cleanly", async () => {
    await useAuthStore.getState().signOut();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
