"use client";

import Image from "next/image";
import { useState } from "react";
import { BuyButton } from "./buy-button";

const includes = [
  { name: "Blades XS, S, M, L, XL", desc: "All 5 blade sizes — 132 total" },
  { name: "Stretchers AA + BB", desc: "Structural arches, printed in 3 parts each" },
  { name: "Top & Bottom rings", desc: "Cap pieces for the frame" },
  { name: "Spacer", desc: "Optional spacer for extra support between top rings" },
  { name: "3MF project file", desc: "Ready-to-open in Bambu Studio or PrusaSlicer" },
  { name: "PDF Instruction Guide", desc: "Step-by-step guide co-created with Ron" },
];

const images = [
  { src: "/images/cone-lamp-3dprint/hero-firewood.jpg", alt: "Cone Lamp lit up against a firewood wall" },
  { src: "/images/cone-lamp-3dprint/hero-white.jpg", alt: "Cone Lamp full view on wooden floor" },
  { src: "/images/cone-lamp-3dprint/lit-floor.jpg", alt: "Cone Lamp glowing warm light on floor" },
  { src: "/images/cone-lamp-3dprint/top-down.jpg", alt: "Cone Lamp viewed from above" },
  { src: "/images/cone-lamp-3dprint/detail-gold.jpg", alt: "Close up of gold stretcher and white blades" },
  { src: "/images/cone-lamp-3dprint/print-files-preview.png", alt: "Preview of all 3D print files in slicer" },
];

export default function ConeLamp3DPrint() {
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
          {/* Thumbnail row */}
          <div className="grid grid-cols-6 gap-2">
            {images.map((img, i) => (
              <button
                key={img.src}
                onClick={() => setActiveImage(i)}
                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                  i === activeImage
                    ? "ring-2 ring-forest"
                    : "opacity-60 hover:opacity-100"
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
            3D Print Pack
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-wood mb-2">
            Cone Lamp 3D Print Files
          </h1>
          <p className="text-3xl text-forest font-serif mb-6">€5</p>

          <p className="text-wood-light/80 leading-relaxed mb-4">
            The complete file pack to 3D print the Jesper Makes Cone Lamp at home. Originally a laser cut design, brilliantly adapted for 3D printing by Ron.
          </p>
          <p className="text-wood-light/80 leading-relaxed mb-8">
            Total print time: ~60 hours. I used two Bambu Lab P1S printers — brass PLA for the stretchers, transparent ePETG for the blades. 132 blades in total.
          </p>

          <BuyButton />

          <p className="text-wood-light/50 text-xs mt-3">
            Instant ZIP download after purchase. Secure payment via Stripe.
          </p>
        </div>
      </div>

      {/* What's included */}
      <div className="mt-20">
        <h2 className="font-serif text-2xl text-wood mb-8">
          What&apos;s included
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {includes.map((item) => (
            <div
              key={item.name}
              className="border border-wood/10 rounded-xl p-6 hover:border-forest/30 transition-colors"
            >
              <h3 className="font-serif text-lg text-wood mb-1">
                {item.name}
              </h3>
              <p className="text-wood-light/60 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
