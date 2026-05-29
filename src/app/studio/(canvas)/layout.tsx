import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2D Design Studio | Jesper Makes",
  description: "Browser-based 2D vector design studio for makers. Draw shapes, import SVGs, and share designs on the Marketplace.",
  robots: { index: false, follow: false },
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
