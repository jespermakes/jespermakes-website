import type { Metadata } from "next";
import Link from "next/link";
import { stats as mk, exact, measuredOn } from "@/lib/mediakit-stats";

export const metadata: Metadata = {
  title: "Facebook stats | Jesper Makes media kit",
  description:
    "Facebook page stats for Jesper Makes. Follower count, video views and engagement over the last 28 days, refreshed daily from the Meta Graph API.",
  alternates: { canonical: "/mediakit/facebook" },
};

// GENERATED. Figures come from src/data/mediakit-stats.json, rewritten daily
// by the Brain job (brain-server scripts/mediakit_refresh.py) straight from the
// Meta Graph API. Do not edit the numbers here.
//
// Why it is generated: these moved 25x in TWO DAYS. On 10 Aug this page read
// 9.6K followers and 9,807 video views; one long-form post on 11 Aug did 88,838
// views on day one and 128,809 on day two, taking the page past 10,000
// followers. Hand-maintained figures were wrong within 48 hours, twice.
//
// Volume figures are 28-DAY WINDOWS because Facebook exposes no lifetime totals
// at all (period=lifetime returns nothing; the page_impressions family was
// removed in v25.0). The refresh job measures them with
// meta_api.facebook_page_window(), never a bare {"period": "days_28"}, which
// silently answers about a stale window.
const stats = [
  { label: "Followers", value: exact(mk.facebook.followers), note: "past 10K on 11 Aug" },
  { label: "Video views", value: exact(mk.facebook.views_28d), note: "last 28 days" },
  { label: "Engagements", value: exact(mk.facebook.engagements_28d), note: "last 28 days" },
  { label: "Profile views", value: exact(mk.facebook.profile_views_28d), note: "last 28 days" },
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
          Measured via the Meta Graph API on {measuredOn()}, refreshed daily.
          Facebook publishes no lifetime view totals, so volume figures are
          rolling 28-day windows.
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
          {/* The page moved to a daily publishing cadence in August 2026 under
              a distribution arrangement. Deliberately not named here: who
              operates the page is a commercial detail, not something a media
              kit reader needs.

              This matters for how the numbers are read. The figures above are a
              BASELINE measured before daily posting was fully underway, not a
              steady state, and they should rise sharply. Re-measure before
              quoting them to anyone; on this page they are floor, not ceiling. */}
          <p className="text-white/70 leading-relaxed mt-4">
            The page moved to daily publishing in August 2026 and the effect was
            immediate. One long-form video on 11 August did 88,838 views on its
            first day and 128,809 on its second, and the page passed 10,000
            followers on the back of it. Video views over the trailing 28 days
            went from under 10,000 to over 230,000 in the same week. Every post
            is video.
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
