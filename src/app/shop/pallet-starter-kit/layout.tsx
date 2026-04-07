import type { Metadata } from "next";
import { ProductJsonLd } from "@/components/product-json-ld";

export const metadata: Metadata = {
  title: "The Pallet Builder's Starter Kit — Jesper Makes",
  description:
    "5 build guides and tool recommendations to start building with pallet wood. From Jesper Makes, the woodworker who started with pallets.",
  openGraph: {
    title: "The Pallet Builder's Starter Kit — Jesper Makes",
    description:
      "5 build guides and tool recommendations to start building with pallet wood.",
    url: "https://jespermakes.com/shop/pallet-starter-kit",
    images: [
      {
        url: "https://i.ytimg.com/vi/SycRO164gt8/maxresdefault.jpg",
        width: 1280,
        height: 720,
        alt: "The Pallet Builder's Starter Kit",
      },
    ],
  },
};

export default function PalletStarterKitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProductJsonLd
        name="The Pallet Builder's Starter Kit"
        description="5 build guides and tool recommendations to start building with pallet wood."
        price="0"
        image="https://i.ytimg.com/vi/SycRO164gt8/maxresdefault.jpg"
        url="https://jespermakes.com/shop/pallet-starter-kit"
        availability="PreOrder"
        sku="pallet-starter-kit"
      />
      {children}
    </>
  );
}
