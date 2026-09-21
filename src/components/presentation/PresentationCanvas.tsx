"use client";

import React from "react";
import { usePresentationStore } from "@/store/presentation.store";
import { usePresentationReceiver } from "@/hooks/usePresentationSync";
import type {
  PresentationSlide,
  LayoutId,
  Background,
  OutputStatus,
} from "@/types/presentation.types";

interface PresentationCanvasProps {
  /** Explicit slide override (useful when used as a preview canvas) */
  slide?: PresentationSlide | null;
  /** Explicit layout override */
  layoutOverride?: LayoutId | null;
  /** Explicit background override */
  backgroundOverride?: Background | null;
  /** Explicit output status override */
  status?: OutputStatus;
  /** Enable cross-window sync receiver (only true on real output window) */
  isReceiver?: boolean;
  /** Optional custom CSS classes */
  className?: string;
  /** Is this being rendered inside a compact thumbnail/card */
  isThumbnail?: boolean;
}

/**
 * PresentationCanvas — the audience-facing rendering surface.
 *
 * Implements Workstream 1 (§4.7 Layouts & §4.8 Backgrounds).
 * Used both for the live presentation output (/presentation) and
 * for faithful previews inside the Operator Workstation.
 */
export function PresentationCanvas({
  slide: propSlide,
  layoutOverride: propLayoutOverride,
  backgroundOverride: propBackgroundOverride,
  status: propStatus,
  isReceiver = false,
  className = "",
  isThumbnail = false,
}: PresentationCanvasProps) {
  // Activate sync receiver when mounted as an output window
  usePresentationReceiver(isReceiver);

  const store = usePresentationStore();

  const status = propStatus ?? store.status;
  const liveSlide = propSlide !== undefined ? propSlide : store.liveSlide;
  const layoutOverride =
    propLayoutOverride !== undefined
      ? propLayoutOverride
      : store.layoutOverride;
  const backgroundOverride =
    propBackgroundOverride !== undefined
      ? propBackgroundOverride
      : store.backgroundOverride;

  const resolvedLayout = layoutOverride ?? liveSlide?.layout ?? "full-screen";
  const resolvedBackground =
    backgroundOverride ??
    liveSlide?.background ?? {
      id: "default-black",
      type: "color",
      name: "Black",
      value: "#000000",
    };

  // Determine container background styling
  const getBackgroundStyle = (): React.CSSProperties => {
    if (status === "black") {
      return { background: "#000000" };
    }

    if (resolvedBackground.type === "none") {
      return { background: "transparent" };
    }

    if (resolvedBackground.type === "color") {
      return { background: resolvedBackground.value || "#000000" };
    }

    if (
      resolvedBackground.type === "image" &&
      resolvedBackground.value
    ) {
      return {
        backgroundImage: `url(${resolvedBackground.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    return { background: "#000000" };
  };

  return (
    <div
      className={`relative h-full w-full flex items-center justify-center overflow-hidden select-none transition-colors duration-200 ${className}`}
      style={getBackgroundStyle()}
      role="region"
      aria-label="Presentation canvas"
      aria-live="polite"
    >
      {/* Background scrim for image backgrounds to guarantee text legibility */}
      {status !== "black" &&
        resolvedBackground.type === "image" && (
          <div
            className="absolute inset-0 bg-black/40 pointer-events-none"
            aria-hidden="true"
          />
        )}

      {/* Output Status: BLACK */}
      {status === "black" && (
        <div
          className="absolute inset-0 bg-black"
          aria-label="Black screen"
        />
      )}

      {/* Output Status: CLEAR */}
      {status === "clear" && (
        <div
          className="text-center opacity-30 select-none"
          style={{ color: "#ffffff" }}
        >
          <p
            className={`font-mono tracking-widest uppercase ${
              isThumbnail ? "text-[10px]" : "text-sm"
            }`}
          >
            OUTPUT CLEAR
          </p>
        </div>
      )}

      {/* Output Status: FROZEN or LIVE */}
      {(status === "live" || status === "frozen") && liveSlide && (
        <>
          <SlideRenderer
            slide={liveSlide}
            layout={resolvedLayout}
            isThumbnail={isThumbnail}
          />

          {status === "frozen" && (
            <div
              className={`absolute top-3 right-3 font-bold uppercase rounded tracking-wider shadow ${
                isThumbnail
                  ? "text-[8px] px-1 py-0.5"
                  : "text-xs px-2.5 py-1"
              }`}
              style={{
                background: "var(--color-warning, #f59e0b)",
                color: "#000000",
              }}
              aria-label="Output is frozen"
            >
              FROZEN
            </div>
          )}
        </>
      )}

      {/* Development status indicator on presentation window */}
      {isReceiver && process.env.NODE_ENV === "development" && (
        <div
          className="absolute bottom-2 left-2 text-[10px] font-mono opacity-30"
          style={{ color: "#ffffff" }}
          aria-hidden="true"
        >
          [{status}] layout: {resolvedLayout} | bg: {resolvedBackground.type}
        </div>
      )}
    </div>
  );
}

// ─── Layout Renderer ─────────────────────────────────────────────────────────

function SlideRenderer({
  slide,
  layout,
  isThumbnail,
}: {
  slide: PresentationSlide;
  layout: LayoutId | string;
  isThumbnail: boolean;
}) {
  switch (layout) {
    case "lower-third":
      return (
        <div
          className={`absolute bottom-0 left-0 right-0 z-10 ${
            isThumbnail ? "px-3 py-2" : "px-12 py-8"
          }`}
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)",
          }}
        >
          <p
            className={`font-semibold text-white leading-tight drop-shadow ${
              isThumbnail ? "text-xs" : "text-3xl md:text-4xl"
            }`}
          >
            {slide.text}
          </p>
          {slide.subtext && (
            <p
              className={`font-medium text-white/80 ${
                isThumbnail ? "text-[9px] mt-0.5" : "text-lg md:text-xl mt-2"
              }`}
            >
              {slide.subtext}
            </p>
          )}
        </div>
      );

    case "caption":
      return (
        <div
          className={`absolute bottom-4 left-0 right-0 z-10 flex justify-center px-4`}
        >
          <div
            className={`rounded-lg backdrop-blur-sm text-center shadow-lg ${
              isThumbnail ? "px-2 py-1 max-w-[90%]" : "px-8 py-4 max-w-3xl"
            }`}
            style={{ background: "rgba(0, 0, 0, 0.78)" }}
          >
            <p
              className={`font-medium text-white leading-snug ${
                isThumbnail ? "text-[10px]" : "text-xl md:text-2xl"
              }`}
            >
              {slide.text}
            </p>
            {slide.subtext && (
              <p
                className={`text-white/70 ${
                  isThumbnail ? "text-[8px] mt-0.5" : "text-sm mt-1"
                }`}
              >
                {slide.subtext}
              </p>
            )}
          </div>
        </div>
      );

    case "overlay":
      return (
        <div
          className={`absolute bottom-4 right-4 z-10 flex justify-end px-2`}
        >
          <div
            className={`rounded-lg backdrop-blur-sm text-left shadow-lg border border-white/10 ${
              isThumbnail ? "p-2 max-w-[70%]" : "p-6 max-w-md"
            }`}
            style={{ background: "rgba(10, 11, 13, 0.85)" }}
          >
            <p
              className={`font-semibold text-white leading-tight ${
                isThumbnail ? "text-[10px]" : "text-xl"
              }`}
            >
              {slide.text}
            </p>
            {slide.subtext && (
              <p
                className={`text-white/75 ${
                  isThumbnail ? "text-[8px] mt-1" : "text-sm mt-2"
                }`}
              >
                {slide.subtext}
              </p>
            )}
          </div>
        </div>
      );

    case "full-screen":
    default:
      return (
        <div
          className={`z-10 text-center max-w-5xl mx-auto flex flex-col items-center justify-center ${
            isThumbnail ? "px-4" : "px-16"
          }`}
        >
          <p
            className={`font-semibold text-white leading-tight drop-shadow-md whitespace-pre-line ${
              isThumbnail ? "text-xs" : "text-4xl md:text-5xl lg:text-6xl"
            }`}
          >
            {slide.text}
          </p>
          {slide.subtext && (
            <p
              className={`font-normal text-white/70 drop-shadow ${
                isThumbnail
                  ? "text-[9px] mt-1"
                  : "text-xl md:text-2xl lg:text-3xl mt-6"
              }`}
            >
              {slide.subtext}
            </p>
          )}
        </div>
      );
  }
}
