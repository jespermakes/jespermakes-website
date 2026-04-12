import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Storyteller Engine — Jesper Makes",
  description:
    "Find the hidden story inside your project. AI-powered story excavation, story cards, arc mapping, and creator DNA analysis for makers and YouTubers.",
  alternates: {
    canonical: "/storyteller",
  },
};

export default function StorytellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
