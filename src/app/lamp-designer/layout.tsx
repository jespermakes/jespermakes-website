import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "3D Lamp Designer | Jesper Makes",
  alternates: {
    canonical: "/lamp-designer",
  },
};

export default function LampDesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
