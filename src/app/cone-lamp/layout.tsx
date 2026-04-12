import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cone Lamp Designer — Jesper Makes",
  description:
    "Build the pinecone pendant lamp from any plywood thickness. Pick your stock, download a cut-ready SVG of all 159 pieces. Free, forever.",
  alternates: {
    canonical: "/cone-lamp",
  },
};

export default function ConeLampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
