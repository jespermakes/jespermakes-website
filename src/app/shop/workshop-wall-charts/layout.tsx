import type { Metadata } from "next";
import { ProductJsonLd } from "@/components/product-json-ld";

export const metadata: Metadata = {
  title: "Jesper's Cheat Sheets — 8 Printable Workshop Wall Charts",
  description:
    "8 printable reference sheets for your workshop wall. Wood species, sandpaper grits, joinery, screws, metric/imperial conversions, and more. Instant PDF download.",
  openGraph: {
    title: "Jesper's Cheat Sheets — 8 Printable Workshop Wall Charts",
    description:
      "8 printable reference sheets for your workshop wall. Wood species, sandpaper grits, joinery, screws, and more.",
    url: "https://jespermakes.com/shop/workshop-wall-charts",
    images: [
      {
        url: "https://jespermakes.com/images/products/cheat-sheets-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Jesper's Cheat Sheets for the workshop",
      },
    ],
  },
};

export default function CheatSheetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProductJsonLd
        name="Jesper's Cheat Sheets — 8 Workshop Wall Charts"
        description="8 printable A4 reference sheets for your workshop wall. Covers wood species, sandpaper grits, joinery types, screws and fasteners, metric/imperial conversions, and more."
        price="3"
        image="/images/products/cheat-sheets-hero.jpg"
        url="https://jespermakes.com/shop/workshop-wall-charts"
        sku="cheat-sheets-8pack"
      />
      {children}
    </>
  );
}
