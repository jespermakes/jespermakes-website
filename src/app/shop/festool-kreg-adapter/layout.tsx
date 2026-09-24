import type { Metadata } from "next";
import { ProductJsonLd } from "@/components/product-json-ld";

export const metadata: Metadata = {
  title: "Festool to Kreg dust adapter: 3D print file",
  description:
    "Free 3D print file for a push-fit adapter between a Festool D27 extractor hose and a Kreg K5 / K5MS pocket hole jig. STL + STEP, tested in the workshop.",
  openGraph: {
    title: "Festool to Kreg dust adapter: 3D print file",
    description:
      "Push-fit adapter between a Festool D27 hose and a Kreg K5 pocket hole jig. Free STL + STEP download.",
    url: "https://jespermakes.com/shop/festool-kreg-adapter",
    images: [
      {
        url: "https://jespermakes.com/images/festool-kreg-adapter/hero.jpg",
        width: 1600,
        height: 1600,
        alt: "Festool to Kreg dust adapter with the Jesper Makes logo",
      },
    ],
  },
  alternates: { canonical: "/shop/festool-kreg-adapter" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProductJsonLd
        name="Festool to Kreg Dust Adapter (3D print file)"
        description="Push-fit adapter between a Festool D27 extractor hose and a Kreg K5 / K5MS pocket hole jig. STL + STEP."
        price="0"
        image="/images/festool-kreg-adapter/hero.jpg"
        url="https://jespermakes.com/shop/festool-kreg-adapter"
        sku="festool-kreg-adapter"
      />
      {children}
    </>
  );
}
