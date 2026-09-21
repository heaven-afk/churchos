"use client";

import { EmergencyControls } from "./EmergencyControls";

/**
 * TopBar — the persistent top navigation bar.
 *
 * Contains:
 * - Product wordmark
 * - Service title (when open)
 * - Emergency controls (always visible — spec §27)
 * - Output status indicator
 */
export function TopBar() {
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

      {/* Emergency controls — always visible */}
      <EmergencyControls />
    </header>
  );
}
