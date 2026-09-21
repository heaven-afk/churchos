"use client";

import { dispatch } from "@/actions/presentation.actions";
import { usePresentationStore } from "@/store/presentation.store";

/**
 * EmergencyControls — spec §27
 *
 * Always-visible controls for BLACK, CLEAR, and FREEZE.
 * These must NEVER be buried inside a settings panel or modal.
 * Keyboard shortcuts: B (black), C (clear), F (freeze)
 */
export function EmergencyControls() {
  const status = usePresentationStore((s) => s.status);

  return (
    <div
      className="flex items-center gap-1"
      role="toolbar"
      aria-label="Emergency controls"
    >
      <EmergencyButton
        id="btn-black"
        label="BLACK"
        shortcut="B"
        isActive={status === "black"}
        activeColor="var(--color-fg-default)"
        activeBg="var(--color-black-btn)"
        onClick={() => dispatch({ type: status === "black" ? "UNFREEZE_OUTPUT" : "BLACK_SCREEN" })}
        aria-pressed={status === "black"}
        aria-keyshortcuts="b"
      />
      <EmergencyButton
        id="btn-clear"
        label="CLEAR"
        shortcut="C"
        isActive={status === "clear"}
        activeColor="var(--color-primary)"
        activeBg="var(--color-primary-subtle)"
        onClick={() => dispatch({ type: "CLEAR_OUTPUT" })}
        aria-pressed={status === "clear"}
        aria-keyshortcuts="c"
      />
      <EmergencyButton
        id="btn-freeze"
        label="FREEZE"
        shortcut="F"
        isActive={status === "frozen"}
        activeColor="var(--color-warning)"
        activeBg="var(--color-warning-subtle)"
        onClick={() =>
          dispatch({
            type: status === "frozen" ? "UNFREEZE_OUTPUT" : "FREEZE_OUTPUT",
          })
        }
        aria-pressed={status === "frozen"}
        aria-keyshortcuts="f"
      />

      {/* Live status dot */}
      <LiveIndicator status={status} />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface EmergencyButtonProps {
  id: string;
  label: string;
  shortcut: string;
  isActive: boolean;
  activeColor: string;
  activeBg: string;
  onClick: () => void;
  "aria-pressed": boolean;
  "aria-keyshortcuts": string;
}

function EmergencyButton({
  id,
  label,
  shortcut,
  isActive,
  activeColor,
  activeBg,
  onClick,
  ...ariaProps
}: EmergencyButtonProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold tracking-wider transition-all"
      style={{
        background: isActive ? activeBg : "transparent",
        color: isActive ? activeColor : "var(--color-fg-subtle)",
        border: `1px solid ${isActive ? activeColor : "var(--color-border)"}`,
        transitionDuration: "var(--duration-fast)",
      }}
      title={`${label} (${shortcut})`}
      {...ariaProps}
    >
      {label}
      <kbd
        className="ml-0.5 rounded px-0.5 text-[10px]"
        style={{
          background: "rgba(255 255 255 / 0.06)",
          color: "var(--color-fg-subtle)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {shortcut}
      </kbd>
    </button>
  );
}

function LiveIndicator({ status }: { status: string }) {
  const isLive = status === "live";

  return (
    <div
      className="flex items-center gap-1.5 ml-2 px-2 py-1 rounded text-xs font-semibold tracking-wider"
      style={{
        background: isLive ? "var(--color-live-subtle)" : "transparent",
        color: isLive ? "var(--color-live)" : "var(--color-fg-subtle)",
        border: `1px solid ${isLive ? "var(--color-live)" : "var(--color-border)"}`,
      }}
      aria-live="polite"
      aria-label={`Output status: ${status.toUpperCase()}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: isLive ? "var(--color-live)" : "var(--color-fg-subtle)",
          boxShadow: isLive ? "var(--shadow-glow-live)" : "none",
          animation: isLive ? "pulse 2s ease-in-out infinite" : "none",
        }}
      />
      {status.toUpperCase()}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pulse { 0%, 100% { opacity: 1; } }
        }
      `}</style>
    </div>
  );
}
