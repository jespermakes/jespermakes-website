import type { Metadata } from "next";

const description =
  "Not a woodworking newsletter. A letter about running a one-man creative business in public: the real problems, the real numbers, and the free tools I build to fix things.";

export const metadata: Metadata = {
  title: "Notes from the Workshop | Jesper Makes",
  description,
  alternates: { canonical: "/newsletter" },
  openGraph: {
    title: "Notes from the Workshop | Jesper Makes",
    description,
    type: "website",
    url: "https://jespermakes.com/newsletter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notes from the Workshop | Jesper Makes",
    description,
  },
};

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
