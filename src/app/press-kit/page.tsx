import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press Kit — Jesper Makes",
  description:
    "Download logos, photos, and assets for press and media use. Free to use with credit.",
};

const portraits = [
  {
    src: "/images/press/jesper-portrait-winter-1.jpg",
    alt: "Jesper — portrait, winter outdoor, beanie and leather apron",
    caption: "Portrait — outdoor winter",
  },
  {
    src: "/images/press/jesper-portrait-winter-2.jpg",
    alt: "Jesper — portrait, winter outdoor close-up",
    caption: "Portrait — outdoor close-up",
  },
  {
    src: "/images/press/jesper-outdoor-hat.jpg",
    alt: "Jesper — outdoor portrait with hat, winter landscape",
    caption: "Portrait — outdoor with hat",
  },
];

const workshop = [
  {
    src: "/images/press/jesper-workshop-carrying.jpg",
    alt: "Jesper carrying a board in the workshop, logo sign on wall",
    caption: "In the workshop — carrying lumber",
  },
  {
    src: "/images/press/jesper-workshop-measuring.jpg",
    alt: "Jesper measuring and marking wood at the workbench",
    caption: "In the workshop — measuring",
  },
  {
    src: "/images/press/jesper-festool-event.jpg",
    alt: "Jesper at a Festool event with Systainer boxes",
    caption: "At a Festool event",
  },
];

const logos = [
  {
    src: "/images/press/jesper-makes-logo.png",
    alt: "Jesper Makes Workshop — full logo (cream on transparent)",
    caption: "Full logo — PNG, transparent",
    filename: "jesper-makes-logo.png",
  },
  {
    src: "/images/press/jesper-makes-logo-round.png",
    alt: "Jesper Makes Workshop — round logo",
    caption: "Round logo — PNG",
    filename: "jesper-makes-logo-round.png",
  },
];

function DownloadCard({
  src,
  alt,
  caption,
  aspect = "aspect-[3/2]",
  logoBg = false,
}: {
  src: string;
  alt: string;
  caption: string;
  aspect?: string;
  logoBg?: boolean;
}) {
  return (
    <a
      href={src}
      download
      className="group block"
    >
      <div
        className={`relative ${aspect} rounded-xl overflow-hidden shadow-lg shadow-wood/5 group-hover:shadow-xl transition-shadow ${
          logoBg ? "bg-wood" : "bg-wood/5"
        }`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={`${logoBg ? "object-contain p-8" : "object-cover"} group-hover:scale-105 transition-transform duration-500`}
        />
        <div className="absolute inset-0 bg-wood/0 group-hover:bg-wood/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-wood/80 text-cream px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Download
          </div>
        </div>
      </div>
      <p className="text-wood-light/60 text-sm mt-2 group-hover:text-amber transition-colors">
        {caption}
      </p>
    </a>
  );
}

export default function PressKit() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <div className="max-w-2xl mb-16">
        <p className="text-amber text-sm font-medium tracking-widest uppercase mb-3">
          Press Kit
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-wood mb-4">
          Photos &amp; logos
        </h1>
        <p className="text-wood-light/80 text-lg leading-relaxed">
          Free to use for press, articles, and media coverage. Click any image
          to download the full-resolution version. Credit appreciated but not
          required.
        </p>
        <div className="flex flex-wrap gap-4 mt-6">
          <Link
            href="/contact"
            className="text-amber hover:text-amber-dark text-sm font-medium transition-colors"
          >
            ← Back to Contact
          </Link>
          <Link
            href="/mediakit"
            className="text-wood-light/60 hover:text-amber text-sm font-medium transition-colors"
          >
            Looking for audience stats? View Media Kit →
          </Link>
        </div>
      </div>

      {/* Portraits */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl text-wood mb-6">Portraits</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portraits.map((img) => (
            <DownloadCard key={img.src} {...img} />
          ))}
        </div>
      </section>

      {/* Workshop */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl text-wood mb-6">Workshop &amp; events</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshop.map((img) => (
            <DownloadCard key={img.src} {...img} />
          ))}
        </div>
      </section>

      {/* Logos */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl text-wood mb-6">Logos</h2>
        <p className="text-wood-light/60 text-sm mb-6">
          The full logo works best on dark backgrounds. Please don&apos;t
          modify, recolor, or distort the logo.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo) => (
            <DownloadCard
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              caption={logo.caption}
              aspect="aspect-square"
              logoBg
            />
          ))}
        </div>
      </section>

      {/* Usage guidelines */}
      <section className="bg-wood/5 rounded-xl p-8 md:p-10">
        <h2 className="font-serif text-xl text-wood mb-4">Usage guidelines</h2>
        <div className="grid sm:grid-cols-2 gap-6 text-sm text-wood-light/70">
          <div>
            <h3 className="font-medium text-wood mb-2">✅ Do</h3>
            <ul className="space-y-1.5">
              <li>Use images for press articles and features</li>
              <li>Crop to fit your layout</li>
              <li>Credit &ldquo;Jesper Makes&rdquo; or &ldquo;jespermakes.com&rdquo;</li>
              <li>Link back when possible</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-wood mb-2">❌ Don&apos;t</h3>
            <ul className="space-y-1.5">
              <li>Use images for commercial products or advertising</li>
              <li>Modify, recolor, or distort the logo</li>
              <li>Imply endorsement without permission</li>
              <li>Use for AI training datasets</li>
            </ul>
          </div>
        </div>
        <p className="text-wood-light/50 text-xs mt-6">
          Need something specific? Reach out at{" "}
          <a href="mailto:hello@jespermakes.com" className="text-amber hover:underline">
            hello@jespermakes.com
          </a>
        </p>
      </section>
    </div>
  );
}
