import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop — Jesper Makes",
  description: "Build guides and resources from Jesper's workshop.",
};

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

      {/* Product card */}
      <Link href="/shop/pallet-starter-kit" className="group block max-w-md">
        <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-lg shadow-wood/5 group-hover:shadow-xl transition-shadow">
          <Image
            src="https://i.ytimg.com/vi/SycRO164gt8/maxresdefault.jpg"
            alt="The Pallet Builder's Starter Kit"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <h2 className="font-serif text-xl text-wood group-hover:text-amber transition-colors mb-1">
          The Pallet Builder&apos;s Starter Kit
        </h2>
        <p className="text-wood-light/60 text-sm mb-2">
          5 build guides + tool recommendations
        </p>
        <p className="text-amber font-medium">€35</p>
      </Link>
    </div>
  );
}
