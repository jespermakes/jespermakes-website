"use client";

import { useState } from "react";
import Image from "next/image";

const images = [
  { src: "/images/products/tshirt-mockup-front.jpg", alt: "Workshop Tee — front" },
  { src: "/images/products/tshirt-mockup-back.jpg", alt: "Workshop Tee — back" },
];

const sizes = ["S", "M", "L", "XL", "2XL"];

export default function WorkshopTee() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: "workshop-tee", size: selectedSize }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Image gallery */}
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl shadow-wood/10 bg-[#f5f5f5]">
            <Image
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.map((img, i) => (
              <button
                key={img.src}
                onClick={() => setSelectedImage(i)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors bg-[#f5f5f5] ${
                  i === selectedImage
                    ? "border-forest"
                    : "border-transparent hover:border-forest/40"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-forest text-sm font-medium tracking-widest uppercase mb-3">
            Merch
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-wood mb-2">
            Jesper Makes Workshop Tee
          </h1>
          <p className="text-3xl text-forest font-serif mb-6">€35</p>

          <p className="text-wood-light/80 leading-relaxed mb-8">
            Unisex black tee with the Jesper Makes Workshop logo — small on the
            front left chest, large and centered on the back. Bella+Canvas 3001,
            super soft ringspun cotton. Printed on demand and shipped worldwide.
          </p>

          {/* Size selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-wood mb-3">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? "border-forest bg-forest text-cream"
                      : "border-wood/20 text-wood hover:border-forest/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full sm:w-auto bg-forest hover:bg-forest-dark disabled:opacity-60 text-cream px-8 py-4 rounded-lg font-medium text-lg transition-colors"
          >
            {loading ? "Redirecting…" : "Buy now — €35"}
          </button>

          <p className="text-wood-light/50 text-xs mt-3">
            Printed &amp; shipped by Printful. Secure payment via Stripe.
          </p>
        </div>
      </div>

      {/* Details section */}
      <div className="mt-20">
        <h2 className="font-serif text-2xl text-wood mb-8">Details</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Material", desc: "100% ringspun cotton, pre-shrunk" },
            { name: "Fit", desc: "Unisex retail fit — true to size" },
            { name: "Weight", desc: "4.2 oz / 142 gsm — lightweight" },
            { name: "Print", desc: "Direct-to-garment (DTG), front & back" },
            { name: "Brand", desc: "Bella+Canvas 3001 — industry standard" },
            { name: "Shipping", desc: "Printed on demand, worldwide delivery" },
          ].map((item) => (
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
