import { describe, it, expect, beforeEach } from "vitest";
import {
  AuthService,
  DEFAULT_LOCAL_ORG,
  DEFAULT_LOCAL_USER,
} from "@/lib/auth/auth.service";

describe("Auth Service (Phase 1 §8)", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("returns default local operator session when unconfigured", async () => {
    const session = await authService.getSession();
    expect(session).not.toBeNull();
    expect(session?.user.displayName).toBe(DEFAULT_LOCAL_USER.displayName);
    expect(session?.organization?.name).toBe(DEFAULT_LOCAL_ORG.name);
  });

  it("signs in with credentials locally in offline/dev fallback", async () => {
    const session = await authService.signInWithPassword(
      "pastor@grace.org",
      "password123"
    );

    expect(session.user.email).toBe("pastor@grace.org");
    expect(session.user.displayName).toBe("Pastor");
    expect(session.organization?.name).toBe(DEFAULT_LOCAL_ORG.name);

    // Verify persisted session
    const current = await authService.getSession();
    expect(current?.user.email).toBe("pastor@grace.org");
  });

  it("signs up a new user and creates organization tenant", async () => {
    const session = await authService.signUp(
      "worship@hope.org",
      "securepass",
      "Worship Leader",
      "Hope City Church"
    );

    expect(session.user.email).toBe("worship@hope.org");
    expect(session.user.displayName).toBe("Worship Leader");
    expect(session.user.role).toBe("OWNER");
    expect(session.organization?.name).toBe("Hope City Church");
  });

  it("signs out and clears session", async () => {
    await authService.signInWithPassword("test@church.org", "pass");
    await authService.signOut();

    // After signout without stored session, returns default local dev session
    const session = await authService.getSession();
    expect(session?.user.id).toBe(DEFAULT_LOCAL_USER.id);
  });
});
