"use client";

import React, { useState } from "react";
import { useServiceStore, selectActiveItems } from "@/store/service.store";
import { useUIStore } from "@/store/ui.store";
import { dispatch } from "@/actions/presentation.actions";
import type { ServiceItem } from "@/types/service.types";
import type { Scripture, Song } from "@/types/content.types";
import type { MediaItem } from "@/types/media.types";
import type { PresentationSlide } from "@/types/presentation.types";
import { songToPresentationSlides } from "@/lib/lyrics/lyric.service";
import { createTextPresentationSlides } from "@/lib/content/text.service";
import { createMediaPresentationSlide } from "@/lib/content/media.service";
import { ServiceModal } from "./ServiceModal";

const ITEM_TYPE_ICONS: Record<string, string> = {
  song: "🎵",
  scripture: "📖",
  text: "✏️",
  image: "🖼️",
  video: "🎬",
  announcement: "📢",
  custom: "⭐",
};

/**
 * ServicePanel — left panel showing the service item list.
 *
 * Implements Phase 1 §7 (Service Persistence, Item Reordering, and Sync State).
 */
export function ServicePanel() {
  const currentService = useServiceStore((s) => s.currentService);
  const items = useServiceStore(selectActiveItems);
  const isLoading = useServiceStore((s) => s.isLoading);
  const syncStatus = useServiceStore((s) => s.syncStatus);
  const error = useServiceStore((s) => s.error);
  const setError = useServiceStore((s) => s.setError);

  const isOpen = useUIStore((s) => s.isServicePanelOpen);
  const isControlPanelOpen = useUIStore((s) => s.isControlPanelOpen);
  const toggleControlPanel = useUIStore((s) => s.toggleControlPanel);
  const setControlPanelTab = useUIStore((s) => s.setControlPanelTab);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const handleAddClick = () => {
    setControlPanelTab("songs");
    if (!isControlPanelOpen) {
      toggleControlPanel();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <aside
        className="flex flex-col border-r overflow-hidden shrink-0"
        style={{
          width: "var(--panel-service-width)",
          background: "var(--color-bg-elevated)",
          borderColor: "var(--color-border)",
        }}
        aria-label="Service items"
        role="complementary"
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-3 py-2.5 border-b gap-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="flex items-center gap-1.5 min-w-0 flex-1 text-left rounded p-1 hover:bg-white/5 transition-colors cursor-pointer group"
            title="Switch or create service"
            aria-label="Switch or create service"
          >
            <span
              className="text-xs font-semibold uppercase tracking-wider truncate block"
              style={{ color: "var(--color-fg-default)" }}
            >
              {currentService ? currentService.title : "Service"}
            </span>
            <span
              className="text-[10px] shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--color-primary)" }}
            >
              ▾
            </span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sync status indicator */}
            <span
              className="text-[11px] select-none flex items-center gap-1 px-1.5 py-0.5 rounded"
              style={{
                color:
                  syncStatus === "synced"
                    ? "var(--color-success)"
                    : syncStatus === "error"
                    ? "var(--color-warning)"
                    : "var(--color-fg-subtle)",
                background: "var(--color-surface-1)",
              }}
              title={
                syncStatus === "synced"
                  ? "Changes synced to cloud"
                  : syncStatus === "syncing"
                  ? "Saving changes..."
                  : syncStatus === "error"
                  ? "Saved locally (cloud offline)"
                  : "Saved locally"
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    syncStatus === "synced"
                      ? "var(--color-success)"
                      : syncStatus === "syncing"
                      ? "var(--color-primary)"
                      : syncStatus === "error"
                      ? "var(--color-warning)"
                      : "var(--color-fg-muted)",
                }}
              />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {syncStatus === "synced"
                  ? "Cloud"
                  : syncStatus === "syncing"
                  ? "Saving"
                  : "Local"}
              </span>
            </span>

            <button
              id="btn-add-item"
              onClick={handleAddClick}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
              style={{
                color: "var(--color-primary)",
                background: "var(--color-primary-subtle)",
              }}
              aria-label="Add service item"
              title="Add songs or scripture"
            >
              + Add
            </button>
          </div>
        </div>

        {/* User-friendly Error Banner (§7.7) */}
        {error && (
          <div
            className="flex items-center justify-between px-3 py-1.5 text-xs border-b gap-2"
            style={{
              background: "var(--color-warning-subtle)",
              borderColor: "var(--color-border)",
              color: "var(--color-warning)",
            }}
          >
            <span className="truncate">{error}</span>
            <button
              onClick={() => setError(null)}
              className="font-bold hover:opacity-80 p-0.5 cursor-pointer"
              aria-label="Dismiss error notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* Item list */}
        <div
          className="flex-1 overflow-y-auto"
          role="list"
          aria-label="Service items"
        >
          {isLoading ? (
            <ServicePanelSkeleton />
          ) : items.length === 0 ? (
            <ServicePanelEmptyState hasService={!!currentService} />
          ) : (
            <div role="listbox" aria-label="Service items" className="py-1">
              {items.map((item, index) => (
                <ServiceItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Service Switch / Create Modal */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
      />
    </>
  );
}

// ─── Skeleton Loading (§7.6) ──────────────────────────────────────────────────

function ServicePanelSkeleton() {
  return (
    <div className="p-3 space-y-2.5 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-10 rounded-lg flex items-center gap-3 px-3"
          style={{ background: "var(--color-surface-1)" }}
        >
          <div
            className="w-4 h-4 rounded"
            style={{ background: "var(--color-surface-2)" }}
          />
          <div
            className="h-3 rounded flex-1"
            style={{ background: "var(--color-surface-2)" }}
          />
          <div
            className="w-6 h-3 rounded"
            style={{ background: "var(--color-surface-2)" }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function ServicePanelEmptyState({ hasService }: { hasService: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full px-4 text-center gap-3 py-12"
      style={{ color: "var(--color-fg-muted)" }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: "var(--color-surface-1)" }}
        aria-hidden="true"
      >
        {hasService ? "📭" : "📋"}
      </div>
      <div>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-fg-default)" }}
        >
          {hasService ? "No items in rundown" : "No service open"}
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-fg-subtle)" }}
        >
          {hasService
            ? "Add songs or Scripture from the control panel."
            : "Create or open a service to begin."}
        </p>
      </div>
    </div>
  );
}

// ─── Item Row with Deterministic Reordering (§7.4) ────────────────────────────

function ServiceItemRow({
  item,
  index,
  isFirst,
  isLast,
}: {
  item: ServiceItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const selectedId = useServiceStore((s) => s.selectedItemId);
  const selectItem = useServiceStore((s) => s.selectItem);
  const moveItem = useServiceStore((s) => s.moveItem);
  const removeItem = useServiceStore((s) => s.removeItem);
  const isSelected = item.id === selectedId;

  const handleSelect = () => {
    selectItem(item.id);
    if (item.type === "scripture" && item.content) {
      const scripture = item.content as Scripture;
      if (Array.isArray(scripture.slides) && scripture.slides.length > 0) {
        const presentationSlides: PresentationSlide[] = scripture.slides.map(
          (s, idx) => ({
            id: `scr-${item.id}-${idx}`,
            text: s.text,
            subtext: `${s.ref.book} ${s.ref.chapter}:${s.ref.verse} (${s.ref.translation})`,
            layout: "full-screen",
            background: {
              id: "black",
              type: "color",
              name: "Black",
              value: "#000000",
            },
          })
        );
        dispatch({ type: "SET_SLIDES", slides: presentationSlides });
        dispatch({ type: "SET_PREVIEW", slide: presentationSlides[0] });
      }
    } else if (item.type === "song" && item.content) {
      const song = item.content as Song;
      const presentationSlides = songToPresentationSlides(song);
      if (presentationSlides.length > 0) {
        dispatch({ type: "SET_SLIDES", slides: presentationSlides });
        dispatch({ type: "SET_PREVIEW", slide: presentationSlides[0] });
      }
    } else if (item.type === "text" && item.content) {
      const textContent = item.content as {
        slides?: PresentationSlide[];
        body?: string;
        title?: string;
        subtext?: string;
      };
      const slides =
        textContent.slides && textContent.slides.length > 0
          ? textContent.slides
          : createTextPresentationSlides({
              title: textContent.title,
              body: textContent.body || item.title,
              subtext: textContent.subtext,
            });
      if (slides.length > 0) {
        dispatch({ type: "SET_SLIDES", slides });
        dispatch({ type: "SET_PREVIEW", slide: slides[0] });
      }
    } else if (
      (item.type === "image" || item.type === "video") &&
      item.content
    ) {
      const mediaContent = item.content as {
        slides?: PresentationSlide[];
        media?: MediaItem;
      };
      const slides =
        mediaContent.slides && mediaContent.slides.length > 0
          ? mediaContent.slides
          : mediaContent.media
          ? [createMediaPresentationSlide(mediaContent.media)]
          : [];
      if (slides.length > 0) {
        dispatch({ type: "SET_SLIDES", slides });
        dispatch({ type: "SET_PREVIEW", slide: slides[0] });
      }
    }
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveItem(item.id, "up");
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveItem(item.id, "down");
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeItem(item.id);
  };

  return (
    <div
      role="option"
      className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors group relative"
      style={{
        background: isSelected ? "var(--color-primary-subtle)" : "transparent",
        borderLeft: isSelected
          ? "2px solid var(--color-primary)"
          : "2px solid transparent",
      }}
      onClick={handleSelect}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleSelect()}
      aria-selected={isSelected}
      aria-label={`${item.title}, item ${index + 1}`}
    >
      <span className="text-sm select-none shrink-0" aria-hidden="true">
        {ITEM_TYPE_ICONS[item.type] ?? "⭐"}
      </span>

      <div className="flex-1 min-w-0">
        <p
          className="text-xs truncate font-medium"
          style={{
            color: isSelected
              ? "var(--color-primary)"
              : "var(--color-fg-default)",
          }}
        >
          {item.title}
        </p>
        <p
          className="text-[10px] capitalize leading-none mt-0.5"
          style={{ color: "var(--color-fg-subtle)" }}
        >
          {item.type}
        </p>
      </div>

      {/* Reorder & Remove Actions — visible on hover/focus */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={handleMoveUp}
          disabled={isFirst}
          className="p-1 rounded text-[10px] hover:bg-white/10 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
          style={{ color: "var(--color-fg-muted)" }}
          title="Move item up"
          aria-label={`Move ${item.title} up`}
        >
          ▲
        </button>
        <button
          type="button"
          onClick={handleMoveDown}
          disabled={isLast}
          className="p-1 rounded text-[10px] hover:bg-white/10 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
          style={{ color: "var(--color-fg-muted)" }}
          title="Move item down"
          aria-label={`Move ${item.title} down`}
        >
          ▼
        </button>
        <button
          type="button"
          onClick={handleRemove}
          className="p-1 rounded text-[10px] hover:bg-red-500/20 cursor-pointer"
          style={{ color: "var(--color-error)" }}
          title="Remove item"
          aria-label={`Remove ${item.title}`}
        >
          ✕
        </button>
      </div>

      {/* Deterministic Order Number */}
      <span
        className="text-[10px] tabular-nums shrink-0 font-mono"
        style={{ color: "var(--color-fg-subtle)" }}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}
