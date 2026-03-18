import type { Metadata } from "next";
import { BuyButton } from "./buy-button";

export const metadata: Metadata = {
  title: "Cone Lamp 3D Print Files — Jesper Makes",
  description:
    "Complete 3D print file pack for the Jesper Makes Cone Lamp. STL files for all parts plus a full PDF instruction guide.",
};

const includes = [
  { name: "Ring XS", desc: "Extra small ring STL" },
  { name: "Ring S", desc: "Small ring STL" },
  { name: "Ring M", desc: "Medium ring STL" },
  { name: "Ring L", desc: "Large ring STL" },
  { name: "Ring XL", desc: "Extra large ring STL" },
  { name: "Stretchers", desc: "Structural support STL files" },
  { name: "Top & Bottom", desc: "Cap pieces STL" },
  { name: "Spacer", desc: "Spacer piece STL" },
  { name: "Instruction Guide", desc: "Full PDF guide co-created with Ron" },
];

export default function ConeLamp3DPrint() {
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
                d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
            <p className="font-serif text-wood/40 text-lg">3D Print Files</p>
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-amber text-sm font-medium tracking-widest uppercase mb-3">
            3D Print Pack
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-wood mb-2">
            Cone Lamp 3D Print Files
          </h1>
          <p className="text-3xl text-amber font-serif mb-6">€9</p>

          <p className="text-wood-light/80 leading-relaxed mb-8">
            Complete 3D print file pack for the Jesper Makes Cone Lamp. Includes
            STL files for all parts (XS, S, M, L, XL rings, stretchers, top,
            bottom, spacer) plus a full PDF instruction guide co-created with
            Ron.
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
