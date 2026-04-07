import type { Metadata } from "next";
import { ProductJsonLd } from "@/components/product-json-ld";

export const metadata: Metadata = {
  title: "Cone Lamp 3D Print Files — STL Download — Jesper Makes",
  description:
    "Complete 3D print file pack for the Jesper Makes Cone Lamp. STL files for all parts plus a full PDF instruction guide. Instant download.",
  openGraph: {
    title: "Cone Lamp 3D Print Files — STL Download",
    description:
      "Complete 3D print STL file pack for the Jesper Makes Cone Lamp with PDF instructions.",
    url: "https://jespermakes.com/shop/cone-lamp-3dprint",
    images: [
      {
        url: "https://jespermakes.com/images/cone-lamp-3dprint/hero-firewood.jpg",
        width: 1200,
        height: 630,
        alt: "Cone Lamp 3D print files",
      },
    ],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProductJsonLd
        name="Cone Lamp 3D Print Files (STL + PDF)"
        description="Complete 3D print file pack for the Jesper Makes Cone Lamp. STL files for all parts plus a full PDF instruction guide."
        price="5"
        image="/images/cone-lamp-3dprint/hero-firewood.jpg"
        url="https://jespermakes.com/shop/cone-lamp-3dprint"
        sku="cone-lamp-3dprint-stl"
      />
      {children}
    </>
  );
}
