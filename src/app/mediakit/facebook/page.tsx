import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Facebook stats | Jesper Makes media kit",
  description:
    "Facebook page stats for Jesper Makes. 9.6K followers, 9,807 video views and 354 engagements in the last 28 days. Verified via the Meta Graph API.",
  alternates: { canonical: "/mediakit/facebook" },
};

// Meta Graph API, measured 2026-08-10.
//
// Every volume figure here is a 28-DAY WINDOW and is labelled as such, because
// Facebook exposes no lifetime totals at all: the entire page_impressions and
// page_fans families were removed in v25.0 (the June 2026 reach migration), and
// period=lifetime returns nothing for any volume metric. days_28 is the ceiling.
//
// A rolling window on a static page rots, so each one carries the date it was
// measured. Do not restate these as "monthly" or drop the date; a stale window
// presented as current is the thing the verified badge exists to prevent.
const stats = [
  { label: "Followers", value: "9.6K", note: null },
  { label: "Video views", value: "9,807", note: "28 days to 10 Aug 2026" },
  { label: "Engagements", value: "354", note: "28 days to 10 Aug 2026" },
  { label: "Posts in 2026", value: "29", note: "vs 11 in all of 2024" },
];

export default function FacebookPage() {
  return (
    <div className="bg-[#0f0f0f] text-white -mt-[1px]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link href="/mediakit" className="text-[#E8604C] text-sm hover:underline mb-8 inline-block">
          &larr; Back to Media Kit
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#E8604C]">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <div>
            <h1 className="text-3xl font-bold">Facebook Page</h1>
            <p className="text-white/50 mt-1">Community hub and video distribution</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#1a1a1a] rounded-xl p-5">
              <p className="text-[#E8604C] text-2xl font-bold">{s.value}</p>
              <p className="text-white/50 text-sm mt-1">{s.label}</p>
              {s.note && (
                <p className="text-white/30 text-xs mt-1">{s.note}</p>
              )}
            </div>
          ))}
        </div>

        <p className="text-white/40 text-sm mb-12">
          Measured via the Meta Graph API on 10 August 2026. Facebook publishes
          no lifetime view totals, so volume figures are 28-day windows.
        </p>

        {/* About */}
        <div className="bg-[#1a1a1a] rounded-xl p-8 mb-12">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <p className="text-white/70 leading-relaxed">
            The Facebook page serves as a community gathering point and video distribution
            channel. YouTube videos are cross-posted here, reaching an older demographic
            that prefers the Facebook platform. The page also functions as a discussion
            hub where followers share their own projects and ask questions.
          </p>
          <p className="text-white/70 leading-relaxed mt-4">
            It is the fastest-growing channel by output: 29 posts so far in 2026,
            against 23 in all of 2025 and 11 in 2024, now running at close to
            daily. Every post is video. It is offered as an add-on to a YouTube
            sponsorship rather than a standalone buy, and the numbers above are
            what that add-on is worth.
          </p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-8 text-center">
          <p className="text-lg font-semibold mb-2">Interested in a partnership?</p>
          <p className="text-white/50 text-sm mb-4">
            Facebook posts work best bundled with YouTube sponsorships.
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
