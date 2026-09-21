"use client";

import { useUIStore } from "@/store/ui.store";
import { usePresentationStore } from "@/store/presentation.store";
import { dispatch } from "@/actions/presentation.actions";
import type { LayoutId } from "@/types/presentation.types";

import { ScripturePanel } from "./ScripturePanel";

/**
 * ControlPanel — right panel for Scripture, layout, background, and media controls.
 *
 * Implements Phase 1 §5.3 Scripture Search & Selection.
 */
export function ControlPanel() {
  const isOpen = useUIStore((s) => s.isControlPanelOpen);
  const activeTab = useUIStore((s) => s.controlPanelTab);
  const setTab = useUIStore((s) => s.setControlPanelTab);
  const layoutOverride = usePresentationStore((s) => s.layoutOverride);

  if (!isOpen) return null;

  return (
    <aside
      className="flex flex-col border-l overflow-hidden shrink-0"
      style={{
        width: "var(--panel-control-width)",
        background: "var(--color-bg-elevated)",
        borderColor: "var(--color-border)",
      }}
      aria-label="Presentation controls"
      role="complementary"
    >
      {/* Tab bar */}
      <div
        className="flex border-b shrink-0"
        style={{ borderColor: "var(--color-border)" }}
        role="tablist"
        aria-label="Control panel tabs"
      >
        {(["scripture", "layout", "background", "media"] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            id={`tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`tabpanel-${tab}`}
            onClick={() => setTab(tab)}
            className="flex-1 py-3 text-xs font-semibold uppercase tracking-wide capitalize transition-colors"
            style={{
              color:
                activeTab === tab
                  ? "var(--color-primary)"
                  : "var(--color-fg-subtle)",
              borderBottom:
                activeTab === tab
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "scripture" && (
          <div
            id="tabpanel-scripture"
            role="tabpanel"
            aria-labelledby="tab-scripture"
          >
            <ScripturePanel />
          </div>
        )}

        {activeTab === "layout" && (
          <div
            id="tabpanel-layout"
            role="tabpanel"
            aria-labelledby="tab-layout"
          >
            <LayoutPicker currentLayout={layoutOverride} />
          </div>
        )}

        {activeTab === "background" && (
          <div
            id="tabpanel-background"
            role="tabpanel"
            aria-labelledby="tab-background"
          >
            <ComingSoon label="Background" phase="Phase 1" />
          </div>
        )}

        {activeTab === "media" && (
          <div
            id="tabpanel-media"
            role="tabpanel"
            aria-labelledby="tab-media"
          >
            <ComingSoon label="Media Library" phase="Phase 1" />
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Layout Picker ────────────────────────────────────────────────────────────

const LAYOUTS: { id: LayoutId; name: string; description: string }[] = [
  { id: "full-screen", name: "Full Screen", description: "Content fills the entire display" },
  { id: "lower-third", name: "Lower Third", description: "Content in the lower third of the display" },
  { id: "caption", name: "Caption", description: "Centred caption with subtitle bar" },
  { id: "corner", name: "Corner", description: "Content anchored to a corner" },
  { id: "overlay", name: "Overlay", description: "Semi-transparent overlay on background" },
];

function LayoutPicker({ currentLayout }: { currentLayout: LayoutId | null }) {
  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: "var(--color-fg-muted)" }}
      >
        Layout
      </p>
      {LAYOUTS.map((layout) => {
        const isActive = currentLayout === layout.id;
        return (
          <button
            key={layout.id}
            id={`layout-${layout.id}`}
            onClick={() =>
              dispatch({
                type: "CHANGE_LAYOUT",
                layoutId: layout.id,
              })
            }
            className="w-full text-left rounded-lg px-3 py-2.5 transition-all"
            style={{
              background: isActive
                ? "var(--color-primary-subtle)"
                : "var(--color-surface-1)",
              border: isActive
                ? "1px solid var(--color-primary)"
                : "1px solid var(--color-border)",
            }}
            aria-pressed={isActive}
          >
            <p
              className="text-sm font-medium"
              style={{
                color: isActive
                  ? "var(--color-primary)"
                  : "var(--color-fg-default)",
              }}
            >
              {layout.name}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-fg-subtle)" }}
            >
              {layout.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ─── Coming Soon placeholder ──────────────────────────────────────────────────

function ComingSoon({ label, phase }: { label: string; phase: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-2 text-center"
      style={{ color: "var(--color-fg-subtle)" }}
    >
      <p className="text-sm font-medium" style={{ color: "var(--color-fg-muted)" }}>
        {label}
      </p>
      <p className="text-xs">Coming in {phase}</p>
    </div>
  );
}
