import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Title Lab — Jesper Makes",
  description:
    "AI-powered YouTube title tool. Repackage existing videos or brainstorm titles for new ones in Jesper's style, MrBeast's style, and more.",
  alternates: {
    canonical: "/title-lab",
  },
};

export default function TitleLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
