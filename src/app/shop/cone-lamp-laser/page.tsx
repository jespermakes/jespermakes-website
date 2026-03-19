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
  { name: "Stretcher A", desc: "Main structural support piece" },
  { name: "Stretcher B", desc: "Cross support piece" },
  { name: "Blade XS", desc: "Extra small blade" },
  { name: "Blade S", desc: "Small blade" },
  { name: "Blade M", desc: "Medium blade" },
  { name: "Blade L", desc: "Large blade" },
  { name: "Blade XL", desc: "Extra large blade" },
  { name: "Top circle", desc: "Top closure piece" },
  { name: "Bottom circle", desc: "Bottom closure piece" },
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
                    ? "border-amber"
                    : "border-transparent hover:border-amber/40"
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
          <p className="text-amber text-sm font-medium tracking-widest uppercase mb-3">
            Laser Cut File
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-wood mb-2">
            Cone Lamp Laser File
          </h1>
          <p className="text-3xl text-amber font-serif mb-6">€5</p>

          <p className="text-wood-light/80 leading-relaxed mb-8">
            The SVG laser cut file for the Jesper Makes Cone Lamp. Works with
            any laser cutter. Includes all parts — stretchers A &amp; B, blades
            XS/S/M/L/XL, top and bottom circles.
          </p>

          <BuyButton />

          <p className="text-wood-light/50 text-xs mt-3">
            Instant SVG download after purchase. Secure payment via Stripe.
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
              className="border border-wood/10 rounded-xl p-6 hover:border-amber/30 transition-colors"
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
