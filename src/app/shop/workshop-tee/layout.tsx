import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workshop Tee — Jesper Makes",
  description:
    "Unisex black tee with the Jesper Makes Workshop logo. Bella+Canvas 3001, printed on demand.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
