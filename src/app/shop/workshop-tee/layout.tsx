import type { Metadata } from "next";
import { ProductJsonLd } from "@/components/product-json-ld";

export const metadata: Metadata = {
  title: "Workshop Tee — Jesper Makes",
  description:
    "Unisex black tee with the Jesper Makes Workshop logo. Bella+Canvas 3001, printed on demand and shipped worldwide.",
  openGraph: {
    title: "Jesper Makes Workshop Tee",
    description:
      "Unisex black tee with the Jesper Makes Workshop logo. Printed on demand, shipped worldwide.",
    url: "https://jespermakes.com/shop/workshop-tee",
    images: [
      {
        url: "https://jespermakes.com/images/products/tshirt-mockup-front.jpg",
        width: 1200,
        height: 630,
        alt: "Jesper Makes Workshop Tee",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProductJsonLd
        name="Jesper Makes Workshop Tee"
        description="Unisex black tee with the Jesper Makes Workshop logo. Bella+Canvas 3001, printed on demand and shipped worldwide."
        price="35"
        image="/images/products/tshirt-mockup-front.jpg"
        url="https://jespermakes.com/shop/workshop-tee"
        sku="workshop-tee-black"
      />
      {children}
    </>
  );
}
