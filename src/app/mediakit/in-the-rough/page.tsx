import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube In The Rough - Media Kit - Jesper Makes",
  description:
    "In The Rough channel stats. 8.3K subscribers, top 5% engagement rate. Raw, unfiltered maker content.",
};

const stats = [
  { label: "Subscribers", value: "8.3K" },
  { label: "Total Videos", value: "21" },
  { label: "Engagement Rate", value: "8.0%" },
  { label: "Growth (28d)", value: "+994 subs" },
];

export default function InTheRoughPage() {
  return (
    <div className="bg-[#0f0f0f] text-white -mt-[1px]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link href="/mediakit" className="text-[#E8604C] text-sm hover:underline mb-8 inline-block">
          &larr; Back to Media Kit
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#E8604C]">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <div>
            <h1 className="text-3xl font-bold">YouTube In The Rough</h1>
            <p className="text-white/50 mt-1">Second channel - Raw, unfiltered, behind-the-scenes</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#1a1a1a] rounded-xl p-5">
              <p className="text-[#E8604C] text-2xl font-bold">{s.value}</p>
              <p className="text-white/50 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="bg-[#1a1a1a] rounded-xl p-8 mb-12">
          <h2 className="text-xl font-bold mb-4">About this channel</h2>
          <p className="text-white/70 leading-relaxed">
            In The Rough is the unpolished companion to the main Jesper Makes channel.
            Longer formats, workshop vlogs, real-time problem solving, and honest conversations
            about the maker journey. The audience here is deeply engaged - top 5% engagement rate
            across YouTube - making it ideal for brands that want authentic, trusted integration
            with a dedicated community.
          </p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-8 text-center">
          <p className="text-lg font-semibold mb-2">Interested in sponsoring?</p>
          <p className="text-white/50 text-sm mb-4">
            In The Rough sponsorships pair well with the main channel for maximum reach.
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
