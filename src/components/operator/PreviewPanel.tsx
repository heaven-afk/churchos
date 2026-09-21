"use client";

import React from "react";
import { usePresentationStore } from "@/store/presentation.store";
import { dispatch } from "@/actions/presentation.actions";
import { PresentationCanvas } from "@/components/presentation/PresentationCanvas";
import type { LayoutId, BackgroundType } from "@/types/presentation.types";

/**
 * PreviewPanel — the central panel showing Preview (Staged), Live, and Next slides.
 *
 * Implements Phase 1 §4.2 (Live / Preview Separation) and §4.5 (Current / Next).
 * Uses PresentationCanvas for identical rendering between operator and live output.
 */
export function PreviewPanel() {
  const {
    liveSlide,
    previewSlide,
    nextSlide,
    status,
    layoutOverride,
    backgroundOverride,
  } = usePresentationStore();

  const handleSendLive = () => {
    dispatch({ type: "SEND_LIVE" });
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const layoutId = e.target.value as LayoutId;
    dispatch({ type: "SET_LAYOUT", layoutId });
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bgType = e.target.value as BackgroundType;
    if (bgType === "none") {
      dispatch({
        type: "SET_BACKGROUND",
        background: { id: "bg-none", type: "none", name: "Transparent" },
      });
    } else if (bgType === "image") {
      dispatch({
        type: "SET_BACKGROUND",
        background: {
          id: "bg-sample",
          type: "image",
          name: "Atmospheric",
          value:
            "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1200&auto=format&fit=crop",
        },
      });
    } else {
      dispatch({
        type: "SET_BACKGROUND",
        background: { id: "bg-black", type: "color", name: "Solid Black", value: "#000000" },
      });
    }
  };

  return (
    <div
      className="flex h-full flex-col p-4 gap-3 select-none overflow-y-auto"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* Header & Quick Controls */}
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-fg-muted)" }}
          >
            Presentation Stage
          </h2>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase"
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
            {status}
          </span>
        </div>

        {/* Layout & Background Overrides */}
        <div className="flex items-center gap-2">
          <select
            id="select-layout-override"
            value={layoutOverride ?? "full-screen"}
            onChange={handleLayoutChange}
            className="text-xs px-2 py-1 rounded bg-black/40 border text-white/90 outline-none cursor-pointer"
            style={{ borderColor: "var(--color-border)" }}
            aria-label="Layout override"
          >
            <option value="full-screen">Full Screen</option>
            <option value="lower-third">Lower Third</option>
            <option value="caption">Caption</option>
            <option value="overlay">Overlay</option>
          </select>

          <select
            id="select-bg-override"
            value={backgroundOverride?.type ?? "color"}
            onChange={handleBackgroundChange}
            className="text-xs px-2 py-1 rounded bg-black/40 border text-white/90 outline-none cursor-pointer"
            style={{ borderColor: "var(--color-border)" }}
            aria-label="Background override"
          >
            <option value="color">Solid Black</option>
            <option value="image">Image Background</option>
            <option value="none">Transparent (None)</option>
          </select>
        </div>
      </div>

      {/* Main Viewports: STAGED PREVIEW vs LIVE OUTPUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* 1. Staged Preview (Preview State - not live yet) */}
        <div className="flex flex-col gap-1.5 flex-1 min-h-[160px]">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{ color: "var(--color-primary)" }}
            >
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Stage Preview
            </span>
            <button
              id="btn-send-live"
              onClick={handleSendLive}
              className="text-xs font-semibold px-3 py-1 rounded transition-all flex items-center gap-1"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-primary-fg)",
              }}
              title="Push staged slide live (Enter)"
            >
              Take Live ↗
            </button>
          </div>

          <div
            className="flex-1 rounded-xl overflow-hidden relative border"
            style={{
              borderColor: "var(--color-primary)",
              boxShadow: "0 0 12px rgba(59, 130, 246, 0.15)",
              aspectRatio: "16 / 9",
            }}
          >
            {previewSlide ? (
              <PresentationCanvas
                slide={previewSlide}
                status="live"
                layoutOverride={layoutOverride}
                backgroundOverride={backgroundOverride}
                isThumbnail={true}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-black/30 text-white/40 text-xs">
                No slide staged in preview
              </div>
            )}
          </div>
        </div>

        {/* 2. Live Output (Live State - active broadcast) */}
        <div className="flex flex-col gap-1.5 flex-1 min-h-[160px]">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{ color: "var(--color-live)" }}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "live" ? "bg-red-500 animate-pulse" : "bg-zinc-600"
                }`}
              />
              Live Output
            </span>
            <span
              className="text-[11px] font-mono"
              style={{ color: "var(--color-fg-subtle)" }}
            >
              [{status.toUpperCase()}]
            </span>
          </div>

          <div
            className="flex-1 rounded-xl overflow-hidden relative border"
            style={{
              borderColor:
                status === "live"
                  ? "var(--color-live)"
                  : "var(--color-border)",
              boxShadow:
                status === "live"
                  ? "0 0 16px rgba(239, 68, 68, 0.2)"
                  : "none",
              aspectRatio: "16 / 9",
            }}
          >
            <PresentationCanvas
              slide={liveSlide}
              status={status}
              layoutOverride={layoutOverride}
              backgroundOverride={backgroundOverride}
              isThumbnail={true}
            />
          </div>
        </div>
      </div>

      {/* Next Up preview & Navigation bar */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
        {/* Next Slide Preview thumbnail */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span
            className="text-[10px] font-bold tracking-wider uppercase shrink-0"
            style={{ color: "var(--color-fg-subtle)" }}
          >
            Next Up:
          </span>
          {nextSlide ? (
            <div
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-black/40 border truncate cursor-pointer hover:border-white/30 transition-colors"
              style={{ borderColor: "var(--color-border)" }}
              onClick={() => dispatch({ type: "SET_PREVIEW", slide: nextSlide })}
              title="Click to stage this slide in preview"
            >
              <span className="text-xs text-white/90 truncate font-medium">
                {nextSlide.text}
              </span>
              {nextSlide.subtext && (
                <span className="text-[10px] text-white/50 truncate">
                  · {nextSlide.subtext}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-white/30 italic">End of service item</span>
          )}
        </div>

        {/* Global Presentation Navigation Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-prev-slide"
            onClick={() => dispatch({ type: "PREVIOUS_SLIDE" })}
            className="px-3 py-1.5 rounded text-xs font-medium transition-colors border"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-fg-default)",
              borderColor: "var(--color-border)",
            }}
            aria-keyshortcuts="ArrowLeft ArrowUp"
            title="Previous slide (Arrow Left)"
          >
            ← Previous
          </button>

          <button
            id="btn-next-slide"
            onClick={() => dispatch({ type: "NEXT_SLIDE" })}
            className="px-4 py-1.5 rounded text-xs font-semibold transition-colors"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-fg)",
            }}
            aria-keyshortcuts="ArrowRight ArrowDown Space"
            title="Next slide (Space / Arrow Right)"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
