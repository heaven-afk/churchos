import type { Metadata } from "next";
import { OperatorShell } from "@/components/operator/OperatorShell";

export const metadata: Metadata = {
  title: "Operator Workstation",
};

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OperatorShell>{children}</OperatorShell>;
}
