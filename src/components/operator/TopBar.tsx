"use client";

import React from "react";
import { EmergencyControls } from "./EmergencyControls";
import { displayAdapter } from "@/providers/display/browser.adapter";
import { useOperatorBroadcaster } from "@/hooks/usePresentationSync";

import { useServiceStore } from "@/store/service.store";

/**
 * TopBar — the persistent top navigation bar.
 *
 * Contains:
 * - Product wordmark
 * - Dynamic Service title & sync state
 * - Display output trigger button
 * - Emergency controls (always visible — spec §27)
 */
export function TopBar() {
  // Listen for sync requests from external presentation windows
  useOperatorBroadcaster();

  const currentService = useServiceStore((s) => s.currentService);
  const syncStatus = useServiceStore((s) => s.syncStatus);

  const handleOpenOutput = async () => {
    await displayAdapter.activateOutput("congregation");
  };

  const formattedDate = currentService
    ? new Date(currentService.date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

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

      {/* Service title & sync status */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span
          className="text-sm font-medium truncate"
          style={{
            color: currentService
              ? "var(--color-fg-default)"
              : "var(--color-fg-muted)",
          }}
          aria-live="polite"
          aria-label="Current service"
        >
          {currentService ? currentService.title : "No service open"}
        </span>

        {formattedDate && (
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              color: "var(--color-fg-subtle)",
              background: "var(--color-surface-1)",
            }}
          >
            {formattedDate}
          </span>
        )}

        {currentService && (
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded select-none"
            style={{
              color:
                syncStatus === "synced"
                  ? "var(--color-success)"
                  : syncStatus === "error"
                  ? "var(--color-warning)"
                  : "var(--color-fg-subtle)",
              background: "var(--color-surface-1)",
            }}
          >
            {syncStatus === "synced"
              ? "Synced"
              : syncStatus === "syncing"
              ? "Saving"
              : "Local"}
          </span>
        )}
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
