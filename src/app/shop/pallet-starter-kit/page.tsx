import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Pallet Builder's Starter Kit — Jesper Makes",
  description:
    "5 complete build guides written the way Jesper actually builds. Real measurements, honest about what goes wrong.",
};

const includes = [
  { name: "Simple Table", desc: "The first build everyone should make" },
  { name: "Chair", desc: "Because sitting on what you built hits different" },
  { name: "Garden Bench", desc: "Weekend project, years of use" },
  { name: "Planter", desc: "Quick build, great gift" },
  { name: "Floating Wall Shelf", desc: "Clean look, hidden joinery" },
  {
    name: "Tool Guide",
    desc: "Budget kit & pro kit — what to buy and what to skip",
  },
];

export default function PalletStarterKit() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Image */}
        <div className="relative aspect-video md:aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-wood/10">
          <Image
            src="https://i.ytimg.com/vi/SycRO164gt8/maxresdefault.jpg"
            alt="The Pallet Builder's Starter Kit"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Details */}
        <div>
          <p className="text-amber text-sm font-medium tracking-widest uppercase mb-3">
            PDF Bundle
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-wood mb-2">
            The Pallet Builder&apos;s Starter Kit
          </h1>
          <p className="text-3xl text-amber font-serif mb-6">€35</p>

          <p className="text-wood-light/80 leading-relaxed mb-8">
            5 complete build guides written the way I actually build — rough
            starting point, real measurements, honest about what goes wrong and
            how to fix it. This is not a generic PDF with CAD drawings.
            It&apos;s written in my voice, the same way I&apos;d explain it if
            you were standing next to me in the workshop.
          </p>

          <div className="bg-wood/10 border border-wood/20 rounded-lg px-6 py-4 text-center">
            <p className="font-medium text-wood mb-1">Coming Soon</p>
            <p className="text-wood-light/60 text-sm">
              <Link href="/#newsletter" className="text-amber hover:text-amber-dark underline transition-colors">
                Join the newsletter
              </Link>{" "}
              to be the first to know
            </p>
          </div>
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

      {/* Trust section */}
      <div className="mt-20 max-w-2xl mx-auto text-center">
        <p className="font-serif text-xl text-wood mb-4">
          &ldquo;I wrote these guides the way I wish someone had explained
          woodworking to me when I started — with real talk about mistakes,
          not just the finished product.&rdquo;
        </p>
        <p className="text-wood-light/60 text-sm">
          — Jesper, 351K subscribers on YouTube
        </p>
      </div>
    </div>
  );
}
