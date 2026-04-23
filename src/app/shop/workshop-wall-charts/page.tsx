"use client";

import ImageGallery from "@/components/image-gallery";
import type { GalleryImage } from "@/components/image-gallery";
import { BuyButton } from "./buy-button";

const images: GalleryImage[] = [
  {
    id: "0",
    url: "/images/products/cheat-sheets-hero.jpg",
    alt: "Jesper with his Cheat Sheets in the workshop",
    width: null,
    height: null,
  },
  {
    id: "1",
    url: "/images/products/wall-charts-page-1.jpg",
    alt: "Page 1: Wood Species Reference",
    width: null,
    height: null,
  },
  {
    id: "2",
    url: "/images/products/wall-charts-page-2.jpg",
    alt: "Page 2: Sandpaper & Finishing Guide",
    width: null,
    height: null,
  },
  {
    id: "3",
    url: "/images/products/wall-charts-page-3.jpg",
    alt: "Page 3: Joinery Quick Reference",
    width: null,
    height: null,
  },
  {
    id: "4",
    url: "/images/products/wall-charts-page-4.jpg",
    alt: "Page 4: Screws, Nails & Fasteners",
    width: null,
    height: null,
  },
];

const charts = [
  {
    title: "Wood Species Reference",
    desc: "Hardwoods, softwoods, Janka hardness, workability, best uses, and finish recommendations. Plus a pallet wood cheat sheet.",
  },
  {
    title: "Sandpaper & Finishing Guide",
    desc: "Every grit from 40 to 400+, recommended sanding sequences for different finishes, and a full finish comparison table.",
  },
  {
    title: "Joinery Quick Reference",
    desc: "17 joint types with strength ratings, difficulty levels, tools needed, and best uses. Plus wood glue comparison.",
  },
  {
    title: "Screws, Nails & Fasteners",
    desc: "Pilot hole sizes for every screw gauge (metric + imperial), screw length rules of thumb, and nail/brad sizes.",
  },
  {
    title: "Drill Bit Reference",
    desc: "Bit types, recommended drilling speeds by material and hole size, and router bit essentials.",
  },
  {
    title: "Metric / Imperial Conversions",
    desc: "Common lumber dimensions (nominal vs actual vs metric), and fractional inch to millimeter conversions.",
  },
  {
    title: "Angles, Geometry & Layout",
    desc: "Common mitre angles, polygon mitre formulas, the 3-4-5 rule, board feet calculation, and wood expansion math.",
  },
  {
    title: "Safety & Workshop Essentials",
    desc: "PPE guide for every task, 10 rules that save fingers, and dust collection basics.",
  },
];

export default function WorkshopWallCharts() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Image gallery */}
        <ImageGallery images={images} altPrefix="Workshop Wall Charts" />

        {/* Details */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-forest text-sm font-medium tracking-widest uppercase">
              Instant Download
            </p>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              NEW
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-wood mb-2">
            Jesper&apos;s Cheat Sheets
          </h1>
          <p className="text-wood-light/60 text-sm mb-1">
            8 printable reference sheets for your workshop wall
          </p>
          <p className="text-3xl text-forest font-serif mb-6">&euro;3</p>

          <p className="text-wood-light/80 leading-relaxed mb-6">
            These started as notes on my own workshop wall because I keep
            forgetting things. Pilot hole sizes, sandpaper grits, joinery
            types. I&apos;m a fumbler and I need the cheat-way to do things.
            So I made them into proper printable sheets and now they&apos;re
            available for everyone. Print them out, pin them up, stop Googling
            the same stuff over and over.
          </p>

          <div className="bg-wood/5 rounded-lg p-4 mb-6">
            <p className="text-wood-light/70 text-sm leading-relaxed">
              <span className="font-medium text-wood">What you get:</span> An
              8-page PDF with wood species reference, sandpaper &amp; finishing
              guide, joinery reference, screw &amp; fastener charts, drill bit
              sizes, metric/imperial conversions, angles &amp; geometry, and
              safety guidelines. Designed for A4, works on US Letter too.
            </p>
          </div>

          <BuyButton />

          <p className="text-wood-light/50 text-xs mt-3">
            Instant PDF download after purchase. Secure payment via Stripe.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 text-wood-light/60 text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12H5.25" />
              </svg>
              Print-ready A4 / Letter
            </span>
            <span className="inline-flex items-center gap-1.5 text-wood-light/60 text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              8-page PDF
            </span>
            <span className="inline-flex items-center gap-1.5 text-wood-light/60 text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Instant download
            </span>
          </div>
        </div>
      </div>

      {/* What's included */}
      <div className="mt-20">
        <h2 className="font-serif text-2xl text-wood mb-3">
          All 8 charts
        </h2>
        <p className="text-wood-light/60 mb-8">
          Each page is a self-contained reference sheet you can print and hang individually.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {charts.map((chart, i) => (
            <div
              key={chart.title}
              className="border border-wood/10 rounded-xl p-6 hover:border-forest/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-forest font-serif text-lg">{i + 1}</span>
                <h3 className="font-serif text-lg text-wood">
                  {chart.title}
                </h3>
              </div>
              <p className="text-wood-light/60 text-sm leading-relaxed">
                {chart.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Why this exists */}
      <div className="mt-20 max-w-2xl">
        <h2 className="font-serif text-2xl text-wood mb-4">
          Why I made this
        </h2>
        <div className="space-y-4 text-wood-light/70 leading-relaxed">
          <p>
            I got tired of Googling the same things over and over. &ldquo;What
            pilot hole for a #8 screw?&rdquo; &ldquo;What grit after
            120?&rdquo; &ldquo;Is Titebond III waterproof?&rdquo;
          </p>
          <p>
            So I made myself a set of wall charts with everything I actually
            need in the shop. Turns out, I use them every single day. Now
            you can have them too.
          </p>
          <p>
            Print all 8 pages. Pin them above your workbench. Done.
          </p>
        </div>
      </div>
    </div>
  );
}
