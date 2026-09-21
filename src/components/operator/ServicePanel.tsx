"use client";

import { useServiceStore, selectActiveItems } from "@/store/service.store";
import { useUIStore } from "@/store/ui.store";

/**
 * ServicePanel — left panel showing the service item list.
 *
 * In Phase 0 this renders the panel chrome and empty state.
 * Phase 1 will add item rendering, drag-and-drop, and search.
 */
export function ServicePanel() {
  const currentService = useServiceStore((s) => s.currentService);
  const items = useServiceStore(selectActiveItems);
  const isOpen = useUIStore((s) => s.isServicePanelOpen);

  const isControlPanelOpen = useUIStore((s) => s.isControlPanelOpen);
  const toggleControlPanel = useUIStore((s) => s.toggleControlPanel);
  const setControlPanelTab = useUIStore((s) => s.setControlPanelTab);

  const handleAddClick = () => {
    setControlPanelTab("scripture");
    if (!isControlPanelOpen) {
      toggleControlPanel();
    }
  };

  if (!isOpen) return null;

  return (
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
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-fg-muted)" }}
        >
          {currentService ? currentService.title : "Service"}
        </h2>
        <button
          id="btn-add-item"
          onClick={handleAddClick}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors cursor-pointer"
          style={{
            color: "var(--color-primary)",
            background: "var(--color-primary-subtle)",
          }}
          aria-label="Add service item"
          title="Add scripture or content"
        >
          + Add
        </button>
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Service items">
        {items.length === 0 ? (
          <ServicePanelEmptyState hasService={!!currentService} />
        ) : (
          <div role="listbox" aria-label="Service items" className="py-1">
            {items.map((item, index) => (
              <ServiceItemRow
                key={item.id}
                item={item}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function ServicePanelEmptyState({ hasService }: { hasService: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full px-4 text-center gap-3"
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
        <p className="text-sm font-medium" style={{ color: "var(--color-fg-default)" }}>
          {hasService ? "No items yet" : "No service open"}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-fg-subtle)" }}>
          {hasService
            ? "Add songs, Scripture, or text to get started."
            : "Create or open a service to begin."}
        </p>
      </div>
    </div>
  );
}

import { dispatch } from "@/actions/presentation.actions";
import type { ServiceItem } from "@/types/service.types";
import type { Scripture, Song } from "@/types/content.types";
import type { PresentationSlide } from "@/types/presentation.types";
import { songToPresentationSlides } from "@/lib/lyrics/lyric.service";

const ITEM_TYPE_ICONS: Record<string, string> = {
  song: "🎵",
  scripture: "📖",
  text: "✏️",
  image: "🖼️",
  video: "🎬",
  announcement: "📢",
  custom: "⭐",
};

function ServiceItemRow({
  item,
  index,
}: {
  item: ServiceItem;
  index: number;
}) {
  const selectedId = useServiceStore((s) => s.selectedItemId);
  const selectItem = useServiceStore((s) => s.selectItem);
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
    }
  };

  return (
    <div
      role="option"
      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors group"
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
      <span className="text-base select-none" aria-hidden="true">
        {ITEM_TYPE_ICONS[item.type] ?? "⭐"}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm truncate font-medium"
          style={{
            color: isSelected
              ? "var(--color-primary)"
              : "var(--color-fg-default)",
          }}
        >
          {item.title}
        </p>
        <p
          className="text-xs capitalize"
          style={{ color: "var(--color-fg-subtle)" }}
        >
          {item.type}
        </p>
      </div>
      <span
        className="text-xs tabular-nums shrink-0"
        style={{ color: "var(--color-fg-subtle)" }}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}
