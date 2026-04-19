import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsors — Jesper Makes",
  description:
    "Work with Jesper Makes — 351,000 woodworkers, makers and builders who trust real craft over influencer noise.",
};

export default function Sponsors() {
  return (
    <div>
      {/* ---- Hero ---- */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
        <h1 className="font-serif text-4xl md:text-6xl text-wood mb-6">
          Work with Jesper Makes
        </h1>
        <p className="text-wood-light/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          351,000 woodworkers, makers and builders who trust real craft over
          influencer noise.
        </p>
      </section>

      {/* ---- Why section ---- */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/60 rounded-xl p-8 shadow-sm">
            <h3 className="font-serif text-xl text-wood mb-3">
              Real audience
            </h3>
            <p className="text-wood-light/70 leading-relaxed">
              90% male, 25–54, hands-on makers who spend money on tools and
              materials. Not passive scrollers — buyers.
            </p>
          </div>
          <div className="bg-white/60 rounded-xl p-8 shadow-sm">
            <h3 className="font-serif text-xl text-wood mb-3">
              Deep engagement
            </h3>
            <p className="text-wood-light/70 leading-relaxed">
              6.1% engagement rate. Average video watched for over 12 hours
              total. People stay, watch, and come back.
            </p>
          </div>
          <div className="bg-white/60 rounded-xl p-8 shadow-sm">
            <h3 className="font-serif text-xl text-wood mb-3">
              Premium brand alignment
            </h3>
            <p className="text-wood-light/70 leading-relaxed">
              Current partners: Festool, Carhartt, Rubio Monocoat, Bambu Lab.
              Your brand in trusted company.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Honest paragraph ---- */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="border-l-4 border-forest pl-6">
          <p className="text-wood-light/80 text-lg leading-relaxed italic">
            &ldquo;I only collaborate with products I would actually use in my
            shop. No cheap gimmicks, no MDF furniture brands. If it fits a
            serious workshop, we can talk.&rdquo;
          </p>
        </div>
      </section>

      {/* ---- Formats available ---- */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-serif text-2xl md:text-3xl text-wood mb-8">
          Formats available
        </h2>
        <ul className="space-y-4 text-wood-light/80 text-lg">
          {[
            "YouTube dedicated video or integration",
            "Instagram Reels",
            "TikTok",
            "Product reviews and tutorials",
            "Long-term ambassador relationships",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1.5 w-2 h-2 rounded-full bg-forest shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ---- Media Kit link ---- */}
      <section className="max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="bg-wood/5 rounded-xl p-8">
          <p className="text-wood-light/60 mb-3">
            Want the full numbers?
          </p>
          <Link
            href="/mediakit"
            className="inline-block border border-wood/20 hover:border-forest text-wood px-6 py-3 rounded-lg font-medium transition-colors"
          >
            View Media Kit →
          </Link>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center">
        <a
          href="mailto:sponsors@jespermakes.com"
          className="inline-block bg-forest hover:bg-forest-dark text-cream px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
        >
          Get in touch → sponsors@jespermakes.com
        </a>
        <p className="text-wood-light/40 text-sm mt-4">
          Typical response within 2 business days
        </p>
      </section>
    </div>
  );
}
