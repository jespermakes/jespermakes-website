import type { Metadata } from "next";
import { ProductJsonLd } from "@/components/product-json-ld";

export const metadata: Metadata = {
  title: "Cone Lamp Laser Cut File — SVG Download — Jesper Makes",
  description:
    "SVG laser cut file for the Jesper Makes Cone Lamp. All parts included: stretchers, rings in 5 sizes, top and bottom circles. Instant download.",
  openGraph: {
    title: "Cone Lamp Laser Cut File — SVG Download",
    description:
      "SVG laser cut file for the Jesper Makes Cone Lamp. All parts included.",
    url: "https://jespermakes.com/shop/cone-lamp-laser",
    images: [
      {
        url: "https://jespermakes.com/images/products/cone-lamp-laser-1.jpg",
        width: 1200,
        height: 630,
        alt: "Cone Lamp laser cut file",
      },
    ],
  },
};

export default function ConeLampLaserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProductJsonLd
        name="Cone Lamp Laser Cut File (SVG)"
        description="SVG laser cut file for the Jesper Makes Cone Lamp. Includes stretchers A and B, rings in 5 sizes (XS to XL), top and bottom circles."
        price="5"
        image="/images/products/cone-lamp-laser-1.jpg"
        url="https://jespermakes.com/shop/cone-lamp-laser"
        sku="cone-lamp-laser-svg"
      />
      {children}
    </>
  );
}
