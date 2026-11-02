import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lamps I've printed: free 3MF and STL files",
  description:
    "Lamps printed on the Bambu Lab H2D in my workshop, with a few checked sizes and patterns. Every file went through the slicer and the print checks before it got a download button.",
  alternates: {
    canonical: "/printed-lamps",
  },
};

export default function PrintedLampsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
