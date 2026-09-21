/**
 * Keyboard Shortcut Configuration Tests
 */

import { describe, it, expect } from "vitest";
import SHORTCUTS, { findShortcut, getShortcutsByContext } from "@/config/shortcuts";

describe("Shortcut Configuration", () => {
  it("has at least one shortcut defined", () => {
    expect(SHORTCUTS.length).toBeGreaterThan(0);
  });

  it("finds arrowright → NEXT_SLIDE in operator context", () => {
    const binding = findShortcut("arrowright", "operator");
    expect(binding).toBeDefined();
    expect(binding?.action.type).toBe("NEXT_SLIDE");
  });

  it("finds arrowleft → PREVIOUS_SLIDE in operator context", () => {
    const binding = findShortcut("arrowleft", "operator");
    expect(binding).toBeDefined();
    expect(binding?.action.type).toBe("PREVIOUS_SLIDE");
  });

  it("finds b → BLACK_SCREEN in operator context", () => {
    const binding = findShortcut("b", "operator");
    expect(binding).toBeDefined();
    expect(binding?.action.type).toBe("BLACK_SCREEN");
  });

  it("finds c → CLEAR_OUTPUT in operator context", () => {
    const binding = findShortcut("c", "operator");
    expect(binding?.action.type).toBe("CLEAR_OUTPUT");
  });

  it("finds f → FREEZE_OUTPUT in operator context", () => {
    const binding = findShortcut("f", "operator");
    expect(binding?.action.type).toBe("FREEZE_OUTPUT");
  });

  it("returns all operator shortcuts via getShortcutsByContext", () => {
    const operatorShortcuts = getShortcutsByContext("operator");
    expect(operatorShortcuts.every((s) => s.context === "operator")).toBe(true);
  });

  it("arrow keys in scripture context navigate slides", () => {
    const next = findShortcut("arrowright", "scripture");
    const prev = findShortcut("arrowleft", "scripture");
    expect(next?.action.type).toBe("NEXT_SLIDE");
    expect(prev?.action.type).toBe("PREVIOUS_SLIDE");
  });

  it("all shortcuts have required fields", () => {
    for (const shortcut of SHORTCUTS) {
      expect(shortcut.key).toBeTruthy();
      expect(shortcut.action).toBeDefined();
      expect(shortcut.description).toBeTruthy();
      expect(shortcut.context).toBeTruthy();
      expect(typeof shortcut.preventDefault).toBe("boolean");
    }
  });
});
