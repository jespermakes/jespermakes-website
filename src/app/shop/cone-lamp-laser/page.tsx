"use client";

import { useState } from "react";
import Image from "next/image";
import { BuyButton } from "./buy-button";

const images = [
  { src: "/images/products/cone-lamp-laser-1.jpg", alt: "Finished cone lamp, studio shot" },
  { src: "/images/products/cone-lamp-laser-2.jpg", alt: "Jesper holding the cone lamp outdoors" },
  { src: "/images/products/cone-lamp-laser-3.jpg", alt: "SVG laser cut layout diagram" },
  { src: "/images/products/cone-lamp-laser-4.jpg", alt: "Close-up detail of the cone lamp" },
];

const includes = [
  { name: "SVG Laser Cut File", qty: "1", desc: "All shapes in one file, ready to cut" },
  { name: "PDF Assembly Guide", qty: "1", desc: "Step-by-step instructions with cut list and build video link" },
  { name: "Bottom circle", qty: "1", desc: "Base of the lamp" },
  { name: "Top circles", qty: "2", desc: "Top closure pieces" },
  { name: "Stretcher A", qty: "12", desc: "Main structural support" },
  { name: "Stretcher B", qty: "12", desc: "Cross support" },
  { name: "Blade XL", qty: "48", desc: "Extra large blades" },
  { name: "Blade L", qty: "24", desc: "Large blades" },
  { name: "Blade M", qty: "24", desc: "Medium blades" },
  { name: "Blade S", qty: "24", desc: "Small blades" },
  { name: "Blade XS", qty: "12", desc: "Extra small blades" },
];

export default function ConeLampLaser() {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Image gallery */}
        <div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-wood/10">
            <Image
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {images.map((img, i) => (
              <button
                key={img.src}
                onClick={() => setSelectedImage(i)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  i === selectedImage
                    ? "border-forest"
                    : "border-transparent hover:border-forest/40"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-forest text-sm font-medium tracking-widest uppercase mb-3">
            Laser Cut File
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-wood mb-2">
            Cone Lamp Laser File
          </h1>
          <p className="text-3xl text-forest font-serif mb-6">€5</p>

          <p className="text-wood-light/80 leading-relaxed mb-4">
            The SVG laser cut template for the Jesper Makes Cone Lamp. One file
            with all the shapes you need. Works with any laser cutter.
          </p>

          <div className="bg-wood/5 rounded-xl p-5 mb-8 space-y-2">
            <p className="text-wood font-medium text-sm">Before you cut:</p>
            <ul className="text-wood-light/70 text-sm space-y-1 list-disc pl-5">
              <li>Designed for <strong className="text-wood">6.4mm thick material</strong>: plywood, acrylic, cardboard, MDF</li>
              <li>One SVG file with all shapes included</li>
              <li>159 total pieces to cut (see full list below)</li>
              <li>No special tools beyond a laser cutter needed</li>
            </ul>
          </div>

          <BuyButton />

          <p className="text-wood-light/50 text-xs mt-3">
            Instant download after purchase: SVG file + PDF assembly guide. Secure payment via Stripe.
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
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-serif text-lg text-wood">
                  {item.name}
                </h3>
                <span className="text-forest font-medium text-sm">x{item.qty}</span>
              </div>
              <p className="text-wood-light/60 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-wood-light/50 text-sm mt-6">
          Total: 159 pieces from one SVG file. Material: 6.4mm plywood, acrylic, or cardboard.
        </p>
      </div>
    </div>
  );
}
