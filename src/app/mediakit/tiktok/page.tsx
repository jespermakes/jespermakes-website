import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TikTok @jespermakes - Media Kit - Jesper Makes",
  description:
    "TikTok stats for Jesper Makes. 44K followers, 132 videos, 2.6% engagement rate.",
  alternates: { canonical: "/mediakit/tiktok" },
};

const stats = [
  { label: "Followers", value: "44K" },
  { label: "Videos", value: "132" },
  { label: "Engagement Rate", value: "2.6%" },
];

export default function TikTokPage() {
  return (
    <div className="bg-[#0f0f0f] text-white -mt-[1px]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link href="/mediakit" className="text-[#E8604C] text-sm hover:underline mb-8 inline-block">
          &larr; Back to Media Kit
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#E8604C]">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.15V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z" />
          </svg>
          <div>
            <h1 className="text-3xl font-bold">TikTok @jespermakes</h1>
            <p className="text-white/50 mt-1">Short-form maker content and viral clips</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#1a1a1a] rounded-xl p-5">
              <p className="text-[#E8604C] text-2xl font-bold">{s.value}</p>
              <p className="text-white/50 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="bg-[#1a1a1a] rounded-xl p-8 mb-12">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <p className="text-white/70 leading-relaxed">
            TikTok serves as the discovery engine - short, punchy clips from workshop builds
            that drive traffic to the full YouTube videos. Content ranges from satisfying
            woodworking process shots to quick tool reviews and workshop hacks.
            The audience here trends younger and is highly responsive to authentic,
            unpolished content.
          </p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-8 text-center">
          <p className="text-lg font-semibold mb-2">TikTok sponsorship?</p>
          <p className="text-white/50 text-sm mb-4">
            Best bundled with YouTube for cross-platform reach.
          </p>
          <a
            href="mailto:sponsors@jespermakes.com"
            className="inline-block bg-[#E8604C] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#d4513f] transition-colors"
          >
            sponsors@jespermakes.com
          </a>
        </div>
      </div>
    </div>
  );
}
