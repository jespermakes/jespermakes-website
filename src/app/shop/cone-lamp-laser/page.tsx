import type { Metadata } from "next";
import { BuyButton } from "./buy-button";

export const metadata: Metadata = {
  title: "Cone Lamp Laser File — Jesper Makes",
  description:
    "SVG laser cut file for the Jesper Makes Cone Lamp. All parts included — stretchers A & B, rings XS/S/M/L/XL.",
};

const includes = [
  { name: "Stretcher A", desc: "Main structural support piece" },
  { name: "Stretcher B", desc: "Cross support piece" },
  { name: "Ring XS", desc: "Extra small ring" },
  { name: "Ring S", desc: "Small ring" },
  { name: "Ring M", desc: "Medium ring" },
  { name: "Ring L", desc: "Large ring" },
  { name: "Ring XL", desc: "Extra large ring" },
];

export default function ConeLampLaser() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Image placeholder */}
        <div className="relative aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-wood/10 bg-wood/5 flex items-center justify-center">
          <div className="text-center p-8">
            <svg
              className="w-16 h-16 text-amber/40 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            <p className="font-serif text-wood/40 text-lg">SVG Laser File</p>
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
            any laser cutter. Includes all parts — stretchers A &amp; B, rings
            XS/S/M/L/XL.
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
