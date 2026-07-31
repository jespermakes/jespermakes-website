import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rubio Monocoat Finish Guide — Jesper Makes",
  description:
    "Find the right Rubio Monocoat product and color for your project. Interior or exterior, wood species aware, with honest coverage numbers from Jesper's workshop.",
  alternates: { canonical: "https://jespermakes.com/rubio" },
};

export default function RubioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
