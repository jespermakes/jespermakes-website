import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram stats | Jesper Makes media kit",
  description:
    "Instagram stats for Jesper Makes. 120K followers, 295 posts, 4.1% engagement rate.",
  alternates: { canonical: "/mediakit/instagram" },
};

const stats = [
  { label: "Followers", value: "120K" },
  { label: "Posts", value: "295" },
  { label: "Engagement Rate", value: "4.1%" },
];

const contentTypes = [
  { type: "Reels", description: "Workshop builds, tool demos, satisfying process shots. High reach and shareability." },
  { type: "Carousel posts", description: "Step-by-step breakdowns, before/after transformations, design details." },
  { type: "Stories", description: "Day-in-the-life, polls, Q&A, sponsor shoutouts with swipe-up links." },
];

export default function InstagramPage() {
  return (
    <div className="bg-[#0f0f0f] text-white -mt-[1px]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link href="/mediakit" className="text-[#E8604C] text-sm hover:underline mb-8 inline-block">
          &larr; Back to Media Kit
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#E8604C]">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          <div>
            <h1 className="text-3xl font-bold">Instagram @jespermakes</h1>
            <p className="text-white/50 mt-1">Visual portfolio and community engagement</p>
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

        {/* Content types */}
        <h2 className="text-xl font-bold mb-6">Content Formats</h2>
        <div className="space-y-4 mb-12">
          {contentTypes.map((c) => (
            <div key={c.type} className="bg-[#1a1a1a] rounded-xl p-6">
              <h3 className="font-semibold text-white mb-1">{c.type}</h3>
              <p className="text-white/60 text-sm">{c.description}</p>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="bg-[#1a1a1a] rounded-xl p-8 mb-12">
          <h2 className="text-xl font-bold mb-4">Audience</h2>
          <p className="text-white/70 leading-relaxed">
            The Instagram audience skews slightly younger than YouTube, with strong engagement
            on Reels and carousel posts. Followers are active DIY enthusiasts, woodworkers,
            and design-conscious homeowners. The 4.1% engagement rate is well above the
            platform average for accounts this size.
          </p>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-8 text-center">
          <p className="text-lg font-semibold mb-2">Interested in an Instagram integration?</p>
          <p className="text-white/50 text-sm mb-4">
            Reels, stories, and feed posts available as standalone or bundled with YouTube.
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
