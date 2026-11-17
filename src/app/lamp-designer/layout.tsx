import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lamp generator: lamps I've printed, free 3MF and STL files",
  description:
    "Lamps printed on the Bambu Lab H2D in my workshop. Pick a height and a flower pattern, and download a file that went through the slicer and the print checks first.",
  alternates: {
    canonical: "/lamp-designer",
  },
};

export default function LampGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
