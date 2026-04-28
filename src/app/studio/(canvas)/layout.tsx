import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio — Jesper Makes",
  description: "Browser-based 2D vector design studio.",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-cream">
      {children}
    </div>
  );
}
