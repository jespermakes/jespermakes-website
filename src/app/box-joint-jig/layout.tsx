import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Box Joint Jig Designer — Jesper Makes",
  description:
    "Generate a cut-ready box joint template for any wood thickness. Drop the SVG into Shaper Origin, your laser cutter, or any CNC router. Free, forever.",
  alternates: {
    canonical: "/box-joint-jig",
  },
};

export default function BoxJointJigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
