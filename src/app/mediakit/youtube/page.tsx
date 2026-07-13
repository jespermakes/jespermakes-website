import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "YouTube @jespermakes - Media Kit - Jesper Makes",
  description:
    "YouTube channel stats for Jesper Makes. 359K subscribers, 43.6M views, 133 videos.",
};

const topVideos = [
  { id: "RNE8Kf8XLOU", title: "Before the Fancy Tools... There Were Pallet Blocks", views: "7.5M" },
  { id: "McK0kbPZNoU", title: "This Video Will Change How You See Wood. I Promise.", views: "6.6M" },
  { id: "1Vl7WQqodFc", title: "Beginner to full-time woodworker in 2 years", views: "4.3M" },
  { id: "SycRO164gt8", title: "I made a coffee table from this. Sold for $1599", views: "3.0M" },
  { id: "ANRu1HPTxno", title: "Idiot YouTubers Are Destroying Their Houses", views: "1.6M" },
  { id: "jOXvrHeSLzs", title: "How to take a pallet apart without breaking it", views: "1.5M" },
];

const stats = [
  { label: "Subscribers", value: "359K" },
  { label: "Total Views", value: "43.6M" },
  { label: "Total Videos", value: "133" },
  { label: "Engagement Rate", value: "6.1%" },
  { label: "Avg Watch Time", value: "8:54" },
  { label: "Male Audience", value: "88.6%" },
];

const ageData = [
  { label: "25-34", pct: 20.1 },
  { label: "35-44", pct: 25.6 },
  { label: "45-54", pct: 21.3 },
  { label: "55-64", pct: 16.2 },
];

const countryData = [
  { label: "US", pct: 21.4 },
  { label: "DE", pct: 11.1 },
  { label: "GB", pct: 9.7 },
  { label: "FR", pct: 4.7 },
  { label: "NL", pct: 4.1 },
  { label: "CA", pct: 4.0 },
  { label: "AU", pct: 3.6 },
  { label: "DK", pct: 2.7 },
];

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-14 text-white/60 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#E8604C] rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-right text-white/60">{pct}%</span>
    </div>
  );
}

export default function YouTubePage() {
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
            <h1 className="text-3xl font-bold">YouTube @jespermakes</h1>
            <p className="text-white/50 mt-1">Main channel - Woodworking, DIY, maker content</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#1a1a1a] rounded-xl p-5">
              <p className="text-[#E8604C] text-2xl font-bold">{s.value}</p>
              <p className="text-white/50 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Demographics */}
        <h2 className="text-xl font-bold mb-6">Audience Demographics</h2>
        <p className="text-white/60 text-sm mb-6">Core audience: male, 25 to 54, predominantly US and Europe.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Age Distribution</p>
            <div className="space-y-3">
              {ageData.map((a) => <Bar key={a.label} label={a.label} pct={a.pct} />)}
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Top Countries</p>
            <div className="space-y-3">
              {countryData.map((c) => <Bar key={c.label} label={c.label} pct={c.pct} />)}
            </div>
          </div>
        </div>

        {/* Top videos */}
        <h2 className="text-xl font-bold mb-6">Top Performing Videos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {topVideos.map((v) => (
            <a
              key={v.id}
              href={`https://youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                <Image
                  src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                  alt={v.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-sm text-white font-medium line-clamp-2">{v.title}</p>
              <p className="text-xs text-white/40 mt-0.5">{v.views} views</p>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-[#1a1a1a] rounded-xl p-8 text-center">
          <p className="text-lg font-semibold mb-2">Interested in sponsoring a video?</p>
          <p className="text-white/50 text-sm mb-4">
            Reach out for rates, availability, and integration options.
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
