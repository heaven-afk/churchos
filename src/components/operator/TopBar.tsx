"use client";

import React from "react";
import { EmergencyControls } from "./EmergencyControls";
import { displayAdapter } from "@/providers/display/browser.adapter";
import { useOperatorBroadcaster } from "@/hooks/usePresentationSync";

/**
 * TopBar — the persistent top navigation bar.
 *
 * Contains:
 * - Product wordmark
 * - Service title (when open)
 * - Display output trigger button
 * - Emergency controls (always visible — spec §27)
 */
export function TopBar() {
  // Listen for sync requests from external presentation windows
  useOperatorBroadcaster();

  const handleOpenOutput = async () => {
    await displayAdapter.activateOutput("congregation");
  };

  return (
    <header
      className="flex items-center gap-4 border-b px-4"
      style={{
        height: "var(--topbar-height)",
        background: "var(--color-bg-elevated)",
        borderColor: "var(--color-border)",
      }}
      role="banner"
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-sm font-semibold tracking-wide select-none"
          style={{ color: "var(--color-fg-default)" }}
          aria-label="Veyrin"
        >
          VEYRIN
        </span>
      </div>

      {/* Service title placeholder */}
      <div className="flex-1 min-w-0">
        <span
          className="text-sm truncate"
          style={{ color: "var(--color-fg-muted)" }}
          aria-live="polite"
          aria-label="Current service"
        >
          No service open
        </span>
      </div>

      {/* Open Presentation Output Trigger */}
      <button
        id="btn-topbar-output"
        onClick={handleOpenOutput}
        className="text-xs px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 border"
        style={{
          background: "var(--color-surface-2)",
          color: "var(--color-fg-default)",
          borderColor: "var(--color-border)",
        }}
        title="Open presentation output window"
        aria-label="Open presentation output window"
      >
        <span>Output Window</span>
        <span className="text-[10px] opacity-60">↗</span>
      </button>

      {/* Emergency controls — always visible */}
      <EmergencyControls />
    </header>
  );
}
