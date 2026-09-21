import type { Metadata } from "next";
import { PresentationCanvas } from "@/components/presentation/PresentationCanvas";

export const metadata: Metadata = {
  title: "Presentation Output — Veyrin",
};

/**
 * Presentation output window.
 *
 * This route is opened as a separate browser window/tab targeting the
 * congregation display. It subscribes to presentation state and renders
 * the live slide.
 *
 * In Phase 0, this renders a development view showing the current output state.
 * In Phase 2+, this becomes a full-bleed presentation canvas.
 */
export default function PresentationPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <PresentationCanvas />
    </main>
  );
}
