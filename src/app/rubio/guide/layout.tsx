import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to finish wood with Rubio Monocoat",
  description:
    "Find the right Rubio Monocoat product and color for your project. Interior or exterior, wood species aware, with honest coverage numbers from Jesper's workshop.",
  alternates: { canonical: "https://jespermakes.com/rubio/guide" },
};

export default function RubioGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
