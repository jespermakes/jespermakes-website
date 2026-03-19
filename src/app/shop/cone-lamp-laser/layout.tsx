import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cone Lamp Laser File — Jesper Makes",
  description:
    "SVG laser cut file for the Jesper Makes Cone Lamp. All parts included — stretchers A & B, rings XS/S/M/L/XL, top and bottom circles.",
};

export default function ConeLampLaserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
