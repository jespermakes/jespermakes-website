import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cone Lamp 3D Print Files — Jesper Makes",
  description:
    "Complete 3D print file pack for the Jesper Makes Cone Lamp. STL files for all parts plus a full PDF instruction guide.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
