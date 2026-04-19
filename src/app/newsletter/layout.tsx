import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter | Jesper Makes",
  description:
    "Join 3,300+ makers who get behind-the-scenes on my builds, first access to new tools, and longer thoughts on craft. Once a month, never spam.",
  openGraph: {
    title: "Newsletter | Jesper Makes",
    description:
      "Join 3,300+ makers who get behind-the-scenes on my builds, first access to new tools, and longer thoughts on craft. Once a month, never spam.",
    type: "website",
    url: "https://jespermakes.com/newsletter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsletter | Jesper Makes",
    description:
      "Join 3,300+ makers who get behind-the-scenes on my builds, first access to new tools, and longer thoughts on craft.",
  },
};

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
