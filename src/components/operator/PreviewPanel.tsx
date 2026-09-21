"use client";

import { usePresentationStore } from "@/store/presentation.store";
import { dispatch } from "@/actions/presentation.actions";

/**
 * PreviewPanel — the centre panel showing current and next slide previews.
 *
 * In Phase 0 this renders the panel chrome and state-aware placeholder.
 * Phase 1 will add real slide rendering using PresentationCanvas.
 */
export function PreviewPanel() {
  const { liveSlide, nextSlide, status } = usePresentationStore();

  return (
    <div
      className="flex h-full flex-col p-4 gap-4"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* Preview header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-fg-muted)" }}
        >
          Preview
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            background:
              status === "live"
                ? "var(--color-live-subtle)"
                : "var(--color-surface-1)",
            color:
              status === "live"
                ? "var(--color-live)"
                : "var(--color-fg-subtle)",
          }}
        >
          {status.toUpperCase()}
        </span>
      </div>

      {/* Current (live) preview */}
      <div className="flex flex-col gap-2 flex-1">
        <p
          className="text-xs font-medium"
          style={{ color: "var(--color-fg-subtle)" }}
        >
          LIVE
        </p>
        <SlidePreviewCard
          slide={liveSlide}
          isEmpty={!liveSlide}
          emptyLabel={status === "black" ? "Black Screen" : status === "clear" ? "Output Clear" : "No slide live"}
          isLive
        />
      </div>

      {/* Next preview */}
      <div className="flex flex-col gap-2" style={{ height: "30%" }}>
        <p
          className="text-xs font-medium"
          style={{ color: "var(--color-fg-subtle)" }}
        >
          NEXT
        </p>
        <SlidePreviewCard
          slide={nextSlide}
          isEmpty={!nextSlide}
          emptyLabel="No next slide"
          isLive={false}
        />
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-2 justify-center pb-2">
        <NavButton
          id="btn-prev-slide"
          label="← Previous"
          onClick={() => dispatch({ type: "PREVIOUS_SLIDE" })}
          aria-keyshortcuts="ArrowLeft ArrowUp"
        />
        <NavButton
          id="btn-next-slide"
          label="Next →"
          onClick={() => dispatch({ type: "NEXT_SLIDE" })}
          aria-keyshortcuts="ArrowRight ArrowDown Space"
          isPrimary
        />
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

import type { PresentationSlide } from "@/types/presentation.types";

function SlidePreviewCard({
  slide,
  isEmpty,
  emptyLabel,
  isLive,
}: {
  slide: PresentationSlide | null;
  isEmpty: boolean;
  emptyLabel: string;
  isLive: boolean;
}) {
  return (
    <div
      className="flex-1 rounded-xl flex items-center justify-center overflow-hidden relative"
      style={{
        background: isEmpty ? "var(--color-surface-1)" : "#000",
        border: isLive
          ? "1.5px solid var(--color-live)"
          : "1.5px solid var(--color-border)",
        aspectRatio: "16 / 9",
        maxHeight: "100%",
      }}
      role="img"
      aria-label={
        isEmpty
          ? emptyLabel
          : `${isLive ? "Live" : "Next"} slide: ${slide?.text}`
      }
    >
      {isEmpty ? (
        <span
          className="text-xs"
          style={{ color: "var(--color-fg-subtle)" }}
        >
          {emptyLabel}
        </span>
      ) : (
        <div className="p-6 text-center">
          <p
            className="text-lg font-medium leading-snug"
            style={{ color: "#fff" }}
          >
            {slide?.text}
          </p>
          {slide?.subtext && (
            <p
              className="text-sm mt-2"
              style={{ color: "rgba(255 255 255 / 0.6)" }}
            >
              {slide.subtext}
            </p>
          )}
        </div>
      )}

      {isLive && !isEmpty && (
        <div
          className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{
            background: "var(--color-live)",
            color: "#fff",
          }}
          aria-hidden="true"
        >
          LIVE
        </div>
      )}
    </div>
  );
}

function NavButton({
  id,
  label,
  onClick,
  isPrimary = false,
  "aria-keyshortcuts": keyshortcuts,
}: {
  id: string;
  label: string;
  onClick: () => void;
  isPrimary?: boolean;
  "aria-keyshortcuts"?: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="flex-1 rounded-lg py-2 text-sm font-medium transition-all"
      style={{
        background: isPrimary
          ? "var(--color-primary)"
          : "var(--color-surface-2)",
        color: isPrimary
          ? "var(--color-primary-fg)"
          : "var(--color-fg-default)",
        border: isPrimary ? "none" : "1px solid var(--color-border)",
      }}
      aria-keyshortcuts={keyshortcuts}
    >
      {label}
    </button>
  );
}
