import type { Metadata } from "next";
import { PreviewPanel } from "@/components/operator/PreviewPanel";

export const metadata: Metadata = {
  title: "Operator — Veyrin",
};

/**
 * Main operator workstation page.
 * The three-panel layout (service | preview | controls) is provided by
 * OperatorShell in (operator)/layout.tsx.
 * This page renders the centre content zone.
 */
export default function OperatorPage() {
  return <PreviewPanel />;
}
