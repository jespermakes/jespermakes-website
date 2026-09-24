"use client";

import Image from "next/image";
import { useState } from "react";
import { FreePlanClaim } from "@/components/shop/free-plan-claim";

const includes = [
  { name: "STL file", desc: "The adapter with the Jesper Makes logo raised on the side" },
  { name: "STEP file", desc: "The plain body without the logo, ready to change in your own CAD" },
  { name: "Print notes", desc: "Material, orientation and what to do if your hose fits tight or loose" },
];

const specs = [
  { name: "Wide end", desc: "The Festool D27 hose pushes in: 35 mm tapered socket" },
  { name: "Narrow end", desc: "Pushes into the Kreg K5 / K5MS port: 31 mm tapered spigot" },
  { name: "Print", desc: "PETG, standing up, no supports. About 1 h 20 min and 17 g" },
];

const images = [
  { src: "/images/festool-kreg-adapter/hero.jpg", alt: "Festool to Kreg dust adapter with the raised Jesper Makes logo" },
  { src: "/images/festool-kreg-adapter/top.jpg", alt: "The adapter from above, looking into the hose socket" },
  { src: "/images/festool-kreg-adapter/side.jpg", alt: "The adapter from the side" },
];

export default function FestoolKregAdapter() {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl shadow-wood/10">
            <Image
              src={images[activeImage].src}
              alt={images[activeImage].alt}
              fill
              className="object-cover transition-opacity duration-200"
              priority
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {images.map((img, i) => (
              <button
                key={img.src}
                onClick={() => setActiveImage(i)}
                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                  i === activeImage ? "ring-2 ring-forest" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-forest text-sm font-medium tracking-widest uppercase mb-3">
            3D Print File
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-wood mb-2">
            Festool to Kreg Dust Adapter
          </h1>
          <p className="text-3xl text-forest font-serif mb-6">Pay what you want</p>

          <p className="text-wood-light/80 leading-relaxed mb-4">
            My Festool extractor hose did not fit the dust port on my Kreg pocket hole jig, so I
            designed an adapter. The hose pushes into one end, the other end pushes into the jig.
            No tape, no clamps.
          </p>
          <p className="text-wood-light/80 leading-relaxed mb-8">
            Fits a Festool D27 hose and a Kreg K5 or K5MS. I tested it on my own hose and jig in
            the workshop. Print it in PETG, standing up, no supports.
          </p>

          <FreePlanClaim sku="festool-kreg-adapter" downloadLabel="Download ZIP" suggested={[3, 5, 10]} />

          <p className="text-wood-light/50 text-xs mt-3">
            Instant ZIP download. If you choose to pay, Stripe handles it securely.
          </p>
          <p className="text-wood-light/40 text-xs mt-3">
            Not made or endorsed by Festool or Kreg. The names only say what it fits.
          </p>
        </div>
      </div>

      {/* Fit and print */}
      <div className="mt-20">
        <h2 className="font-serif text-2xl text-wood mb-8">How it fits</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((item) => (
            <div key={item.name} className="border border-wood/10 rounded-xl p-6 hover:border-forest/30 transition-colors">
              <h3 className="font-serif text-lg text-wood mb-1">{item.name}</h3>
              <p className="text-wood-light/60 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What's included */}
      <div className="mt-16">
        <h2 className="font-serif text-2xl text-wood mb-8">What&apos;s included</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {includes.map((item) => (
            <div key={item.name} className="border border-wood/10 rounded-xl p-6 hover:border-forest/30 transition-colors">
              <h3 className="font-serif text-lg text-wood mb-1">{item.name}</h3>
              <p className="text-wood-light/60 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
