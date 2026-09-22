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
 * Implements Workstream 1 (§4.7 Layouts & §4.8 Backgrounds) and
 * Workstream 6 (§9 Text, Image, Video Presentation).
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

  const isVideoBackground =
    status !== "black" &&
    resolvedBackground.type === "video" &&
    resolvedBackground.value;

  return (
    <div
      className={`relative h-full w-full flex items-center justify-center overflow-hidden select-none transition-colors duration-200 ${className}`}
      style={getBackgroundStyle()}
      role="region"
      aria-label="Presentation canvas"
      aria-live="polite"
    >
      {/* Video background loop (§9.3 & §9.4) */}
      {isVideoBackground && (
        <video
          src={resolvedBackground.value}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Scrim for image or video backgrounds to guarantee text legibility */}
      {status !== "black" &&
        (resolvedBackground.type === "image" ||
          resolvedBackground.type === "video") &&
        (liveSlide?.text || liveSlide?.title) && (
          <div
            className="absolute inset-0 bg-black/40 pointer-events-none z-[1]"
            aria-hidden="true"
          />
        )}

      {/* Output Status: BLACK */}
      {status === "black" && (
        <div
          className="absolute inset-0 bg-black z-20"
          aria-label="Black screen"
        />
      )}

      {/* Output Status: CLEAR */}
      {status === "clear" && (
        <div
          className="text-center opacity-30 select-none z-10"
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
              className={`absolute top-3 right-3 font-bold uppercase rounded tracking-wider shadow z-30 ${
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
          className="absolute bottom-2 left-2 text-[10px] font-mono opacity-30 z-30"
          style={{ color: "#ffffff" }}
          aria-hidden="true"
        >
          [{status}] layout: {resolvedLayout} | bg: {resolvedBackground.type}
        </div>
      )}
    </div>
  );
}

// ─── Layout & Content Renderer (§9 & §11) ───────────────────────────────────

function SlideRenderer({
  slide,
  layout,
  isThumbnail,
}: {
  slide: PresentationSlide;
  layout: LayoutId | string;
  isThumbnail: boolean;
}) {
  // If slide is a full-bleed media item without overlay layout
  if (slide.mediaType === "image" && slide.mediaUrl && !slide.text && !slide.title) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.mediaUrl}
          alt={slide.title || "Presentation media"}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (slide.mediaType === "video" && slide.mediaUrl && !slide.text && !slide.title) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
        <video
          src={slide.mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  const textAlign = slide.textAlign ?? "center";
  const alignClass =
    textAlign === "left"
      ? "text-left items-start"
      : textAlign === "right"
      ? "text-right items-end"
      : "text-center items-center";

  switch (layout) {
    case "lower-third":
      return (
        <div
          className={`absolute bottom-0 left-0 right-0 z-10 flex flex-col ${alignClass} ${
            isThumbnail ? "px-3 py-2" : "px-12 py-8"
          }`}
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)",
          }}
        >
          {slide.title && (
            <p
              className={`font-bold tracking-wide uppercase text-blue-400 leading-tight ${
                isThumbnail ? "text-[9px]" : "text-lg md:text-xl mb-1"
              }`}
            >
              {slide.title}
            </p>
          )}
          {slide.text && (
            <p
              className={`font-semibold text-white leading-tight drop-shadow ${
                isThumbnail ? "text-xs" : "text-3xl md:text-4xl"
              }`}
            >
              {slide.text}
            </p>
          )}
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
            className={`rounded-lg backdrop-blur-sm shadow-lg flex flex-col ${alignClass} ${
              isThumbnail ? "px-2 py-1 max-w-[90%]" : "px-8 py-4 max-w-3xl"
            }`}
            style={{ background: "rgba(0, 0, 0, 0.78)" }}
          >
            {slide.title && (
              <p
                className={`font-bold text-blue-400 ${
                  isThumbnail ? "text-[9px]" : "text-sm uppercase tracking-wider mb-1"
                }`}
              >
                {slide.title}
              </p>
            )}
            {slide.text && (
              <p
                className={`font-medium text-white leading-snug ${
                  isThumbnail ? "text-[10px]" : "text-xl md:text-2xl"
                }`}
              >
                {slide.text}
              </p>
            )}
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
            className={`rounded-lg backdrop-blur-sm text-left shadow-lg border border-white/10 flex flex-col ${
              isThumbnail ? "p-2 max-w-[70%]" : "p-6 max-w-md"
            }`}
            style={{ background: "rgba(10, 11, 13, 0.85)" }}
          >
            {slide.title && (
              <p
                className={`font-bold text-blue-400 mb-1 ${
                  isThumbnail ? "text-[9px]" : "text-sm uppercase tracking-wider"
                }`}
              >
                {slide.title}
              </p>
            )}
            {slide.text && (
              <p
                className={`font-semibold text-white leading-tight ${
                  isThumbnail ? "text-[10px]" : "text-xl"
                }`}
              >
                {slide.text}
              </p>
            )}
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
          className={`z-10 max-w-5xl mx-auto flex flex-col justify-center ${alignClass} ${
            isThumbnail ? "px-4" : "px-16"
          }`}
        >
          {slide.title && (
            <h2
              className={`font-bold text-blue-400 tracking-wide uppercase drop-shadow-sm ${
                isThumbnail
                  ? "text-[9px] mb-1"
                  : "text-2xl md:text-3xl lg:text-4xl mb-4"
              }`}
            >
              {slide.title}
            </h2>
          )}
          {slide.text && (
            <p
              className={`font-semibold text-white leading-tight drop-shadow-md whitespace-pre-line ${
                isThumbnail ? "text-xs" : "text-4xl md:text-5xl lg:text-6xl"
              }`}
            >
              {slide.text}
            </p>
          )}
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
