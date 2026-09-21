"use client";

import { useKeyboard } from "@/hooks/useKeyboard";
import { ServicePanel } from "./ServicePanel";
import { ControlPanel } from "./ControlPanel";
import { OutputMonitor } from "./OutputMonitor";
import { TopBar } from "./TopBar";

/**
 * OperatorShell — the root layout for the operator workstation.
 *
 * Layout:
 * ┌─────────────────────────────────────────────┐
 * │ TopBar                                      │
 * ├─────────────┬────────────────┬──────────────┤
 * │ ServicePanel│   children     │ ControlPanel │
 * │  (left)     │   (centre)     │  (right)     │
 * ├─────────────┴────────────────┴──────────────┤
 * │ OutputMonitor (bottom strip)                │
 * └─────────────────────────────────────────────┘
 *
 * EmergencyControls are embedded in the TopBar so they're always visible.
 */
export function OperatorShell({ children }: { children: React.ReactNode }) {
  // Register global keyboard handler once at the shell level
  useKeyboard();

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: "var(--color-bg-base)" }}
    >
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <ServicePanel />
        <main
          className="flex-1 overflow-hidden"
          role="main"
          aria-label="Presentation preview"
        >
          {children}
        </main>
        <ControlPanel />
      </div>

      <OutputMonitor />
    </div>
  );
}
