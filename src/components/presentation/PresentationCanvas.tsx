"use client";

import { usePresentationStore } from "@/store/presentation.store";

/**
 * PresentationCanvas — the audience-facing rendering surface.
 *
 * This component subscribes to the presentation store and renders
 * the live slide into a full-screen black canvas.
 *
 * Phase 0: renders a dev view of the current output state.
 * Phase 2+: full layout/background rendering system.
 *
 * This component is designed to run in a separate browser window
 * (the /presentation route), not embedded in the operator workstation.
 */
export function PresentationCanvas() {
  const { status, liveSlide, layoutOverride } = usePresentationStore();

  return (
    <div
      className="relative h-full w-full flex items-center justify-center"
      style={{ background: "#000" }}
      role="region"
      aria-label="Presentation output"
      aria-live="polite"
    >
      {status === "black" && (
        <div
          className="absolute inset-0"
          style={{ background: "#000" }}
          aria-label="Black screen"
        />
      )}

      {status === "clear" && (
        <div className="text-center" style={{ color: "rgba(255 255 255 / 0.15)" }}>
          <p className="text-2xl font-light tracking-widest">CLEAR</p>
          <p className="text-sm mt-2 opacity-60">Output is clear</p>
        </div>
      )}

      {status === "frozen" && liveSlide && (
        <>
          <SlideContent slide={liveSlide} layout={layoutOverride} />
          <div
            className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded"
            style={{
              background: "rgba(245 158 11 / 0.9)",
              color: "#000",
            }}
            aria-label="Output is frozen"
          >
            FROZEN
          </div>
        </>
      )}

      {status === "live" && liveSlide && (
        <SlideContent slide={liveSlide} layout={layoutOverride} />
      )}

      {/* Dev mode indicator — hidden in production */}
      {process.env.NODE_ENV === "development" && (
        <div
          className="absolute bottom-4 left-4 text-xs font-mono opacity-40"
          style={{ color: "#fff" }}
          aria-hidden="true"
        >
          [{status}] {layoutOverride ?? "no layout override"}
        </div>
      )}
    </div>
  );
}

// ─── Slide Content Renderer ───────────────────────────────────────────────────

import type { PresentationSlide, LayoutId } from "@/types/presentation.types";

function SlideContent({
  slide,
  layout,
}: {
  slide: PresentationSlide;
  layout: LayoutId | null;
}) {
  const resolvedLayout = layout ?? slide.layout;

  if (resolvedLayout === "lower-third") {
    return (
      <div
        className="absolute bottom-0 left-0 right-0 px-16 py-10"
        style={{
          background:
            "linear-gradient(to top, rgba(0 0 0 / 0.85) 0%, transparent 100%)",
        }}
      >
        <p className="text-4xl font-semibold text-white leading-tight">
          {slide.text}
        </p>
        {slide.subtext && (
          <p className="text-xl text-white/70 mt-2">{slide.subtext}</p>
        )}
      </div>
    );
  }

  // Default: full-screen centred
  return (
    <div className="px-24 text-center max-w-5xl">
      <p className="text-5xl font-semibold text-white leading-tight">
        {slide.text}
      </p>
      {slide.subtext && (
        <p className="text-2xl text-white/60 mt-6">{slide.subtext}</p>
      )}
    </div>
  );
}
