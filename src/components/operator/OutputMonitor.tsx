"use client";

import { usePresentationStore } from "@/store/presentation.store";
import { useServiceStore } from "@/store/service.store";
import { displayAdapter } from "@/providers/display/browser.adapter";

/**
 * OutputMonitor — the bottom strip showing live output status.
 *
 * Provides at-a-glance visibility of:
 * - Current output status (live/black/clear/frozen)
 * - Active layout
 * - Slide position in current item
 */
export function OutputMonitor() {
  const { status, liveSlide, layoutOverride, liveSlideIndex, slides } =
    usePresentationStore();
  const selectedItemTitle = useServiceStore((s) => {
    const id = s.selectedItemId;
    if (!id || !s.currentService) return null;
    return s.currentService.items.find((i) => i.id === id)?.title ?? null;
  });

  return (
    <footer
      className="flex items-center gap-4 px-4 border-t shrink-0"
      style={{
        height: "var(--panel-output-height)",
        background: "var(--color-bg-elevated)",
        borderColor: "var(--color-border)",
      }}
      role="status"
      aria-label="Output monitor"
      aria-live="polite"
    >
      {/* Output status */}
      <StatusPill status={status} />

      <div
        className="h-4 w-px"
        style={{ background: "var(--color-border)" }}
        aria-hidden="true"
      />

      {/* Current content */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span
          className="text-xs"
          style={{ color: "var(--color-fg-subtle)" }}
        >
          {selectedItemTitle ?? "—"}
        </span>
        {liveSlide && (
          <span
            className="text-xs truncate max-w-xs"
            style={{ color: "var(--color-fg-muted)" }}
          >
            · {liveSlide.text}
          </span>
        )}
      </div>

      {/* Slide counter */}
      {slides.length > 0 && (
        <span
          className="text-xs tabular-nums shrink-0"
          style={{ color: "var(--color-fg-subtle)" }}
          aria-label={`Slide ${liveSlideIndex + 1} of ${slides.length}`}
        >
          {liveSlideIndex + 1} / {slides.length}
        </span>
      )}

      {/* Active layout */}
      {layoutOverride && (
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{
            background: "var(--color-surface-2)",
            color: "var(--color-fg-muted)",
          }}
          aria-label={`Layout: ${layoutOverride}`}
        >
          {layoutOverride}
        </span>
      )}

      {/* Output window trigger */}
      <button
        id="btn-open-output"
        onClick={() => {
          displayAdapter.activateOutput("congregation");
        }}
        className="ml-auto text-xs px-2 py-1 rounded transition-colors"
        style={{
          color: "var(--color-fg-subtle)",
          border: "1px solid var(--color-border)",
          background: "transparent",
        }}
        title="Open presentation output window"
        aria-label="Open presentation output in a new window"
      >
        Open Output ↗
      </button>
    </footer>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string }
> = {
  live: {
    bg: "var(--color-live-subtle)",
    color: "var(--color-live)",
  },
  black: {
    bg: "rgba(255 255 255 / 0.04)",
    color: "var(--color-fg-muted)",
  },
  clear: {
    bg: "var(--color-primary-subtle)",
    color: "var(--color-primary)",
  },
  frozen: {
    bg: "var(--color-warning-subtle)",
    color: "var(--color-warning)",
  },
};

function StatusPill({ status }: { status: string }) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.clear;
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full tracking-wider"
      style={{ background: styles.bg, color: styles.color }}
    >
      {status.toUpperCase()}
    </span>
  );
}
