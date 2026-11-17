import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Lamp Designer | Jesper Makes",
  // The August designer, parked here with its download off (DR-301). Nothing
  // links to it and search engines are asked to stay out.
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/lamp-designer/classic",
  },
};

export default function LampDesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
