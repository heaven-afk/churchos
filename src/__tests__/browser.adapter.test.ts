/**
 * BrowserDisplayAdapter Tests
 *
 * Verifies window lifecycle management and output enumeration in the browser adapter.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserDisplayAdapter } from "@/providers/display/browser.adapter";

describe("BrowserDisplayAdapter", () => {
  let adapter: BrowserDisplayAdapter;
  const originalWindow = globalThis.window;

  beforeEach(() => {
    adapter = new BrowserDisplayAdapter();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it("enumerates the congregation display output when window is undefined", async () => {
    // In node environment, window is initially undefined
    delete (globalThis as Record<string, unknown>).window;
    const outputs = await adapter.getOutputs();
    expect(outputs).toHaveLength(1);
    expect(outputs[0].id).toBe("congregation");
    expect(outputs[0].type).toBe("congregation");
    expect(outputs[0].isActive).toBe(false);
  });

  it("activates congregation output by opening a new window", async () => {
    const mockWindow = {
      closed: false,
      focus: vi.fn(),
      close: vi.fn(),
    };

    const mockOpen = vi.fn().mockReturnValue(mockWindow);
    (globalThis as Record<string, unknown>).window = {
      open: mockOpen,
      screen: { width: 1920, height: 1080 },
    };

    await adapter.activateOutput("congregation");

    expect(mockOpen).toHaveBeenCalledWith(
      "/presentation",
      "veyrin-output-window",
      expect.stringContaining("width=1280")
    );
    expect(adapter.isOutputOpen("congregation")).toBe(true);

    const outputs = await adapter.getOutputs();
    expect(outputs[0].isActive).toBe(true);
  });

  it("focuses existing window when activateOutput is called repeatedly", async () => {
    const mockWindow = {
      closed: false,
      focus: vi.fn(),
      close: vi.fn(),
    };

    const mockOpen = vi.fn().mockReturnValue(mockWindow);
    (globalThis as Record<string, unknown>).window = {
      open: mockOpen,
      screen: { width: 1920, height: 1080 },
    };

    await adapter.activateOutput("congregation");
    await adapter.activateOutput("congregation");

    expect(mockWindow.focus).toHaveBeenCalledTimes(1);
  });

  it("deactivates congregation output by closing the window", async () => {
    const mockWindow = {
      closed: false,
      focus: vi.fn(),
      close: vi.fn(),
    };

    const mockOpen = vi.fn().mockReturnValue(mockWindow);
    (globalThis as Record<string, unknown>).window = {
      open: mockOpen,
      screen: { width: 1920, height: 1080 },
    };

    await adapter.activateOutput("congregation");
    await adapter.deactivateOutput("congregation");

    expect(mockWindow.close).toHaveBeenCalledTimes(1);
    expect(adapter.isOutputOpen("congregation")).toBe(false);
  });
});
