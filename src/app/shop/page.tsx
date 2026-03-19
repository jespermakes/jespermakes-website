import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop — Jesper Makes",
  description: "Build guides and resources from Jesper's workshop.",
};

const products = [
  {
    href: "/shop/pallet-starter-kit",
    image: "https://i.ytimg.com/vi/SycRO164gt8/maxresdefault.jpg",
    title: "The Pallet Builder\u2019s Starter Kit",
    subtitle: "5 build guides + tool recommendations",
    comingSoon: true,
  },
  {
    href: "/shop/cone-lamp-laser",
    image: "/images/products/cone-lamp-laser-1.jpg",
    title: "Cone Lamp Laser File",
    subtitle: "SVG laser cut file — all parts included",
    price: "€5",
  },
  {
    href: "/shop/cone-lamp-3dprint",
    image: "/images/cone-lamp-3dprint/hero-firewood.jpg",
    title: "Cone Lamp 3D Print Files",
    subtitle: "STL files + PDF instruction guide",
    price: "€5",
  },
];

export default function Shop() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="max-w-2xl mb-12">
        <h1 className="font-serif text-4xl md:text-5xl text-wood mb-4">
          Shop
        </h1>
        <p className="text-wood-light/80 text-lg">
          Build guides written the way I actually work — not polished CAD
          drawings, but real plans from real builds.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => {
          const cardContent = (
            <>
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-lg shadow-wood/5 group-hover:shadow-xl transition-shadow bg-wood/5">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-amber/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                      />
                    </svg>
                  </div>
                )}
                {product.comingSoon && (
                  <div className="absolute inset-0 bg-wood/60 flex items-center justify-center">
                    <span className="bg-amber text-cream px-4 py-2 rounded-lg font-medium text-sm">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
              <h2 className="font-serif text-xl text-wood group-hover:text-amber transition-colors mb-1">
                {product.title}
              </h2>
              <p className="text-wood-light/60 text-sm mb-2">
                {product.subtitle}
              </p>
              {product.price && (
                <p className="text-amber font-medium">{product.price}</p>
              )}
            </>
          );

          return product.comingSoon ? (
            <div key={product.href} className="group block">
              {cardContent}
            </div>
          ) : (
            <Link key={product.href} href={product.href} className="group block">
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
