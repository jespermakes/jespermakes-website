import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Media Kit - Jesper Makes",
  description:
    "Audience stats, demographics, and brand partnership info for Jesper Makes. 538K+ followers across YouTube, Instagram, TikTok, and Facebook. Updated June 2026.",
  alternates: { canonical: "/mediakit" },
};

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const featuredVideos = [
  {
    id: "RNE8Kf8XLOU",
    title: "Before the Fancy Tools... There Were Pallet Blocks",
    views: "7.5M views",
  },
  {
    id: "McK0kbPZNoU",
    title: "This Video Will Change How You See Wood. I Promise.",
    views: "6.6M views",
  },
  {
    id: "1Vl7WQqodFc",
    title: "Beginner to full-time woodworker in 2 years",
    views: "4.3M views",
  },
  {
    id: "SycRO164gt8",
    title: "I made a coffee table from this. Sold for $1599",
    views: "3.0M views",
  },
  {
    id: "ANRu1HPTxno",
    title: "Idiot YouTubers Are Destroying Their Houses",
    views: "1.6M views",
  },
  {
    id: "jOXvrHeSLzs",
    title: "How to take a pallet apart without breaking it",
    views: "1.5M views",
  },
];

const testimonials = [
  {
    headline: "Came for drama, stayed for a genuine story",
    name: "@eslachance",
    likes: 3667,
    text: "I thought I was just going to watch my usual youtuber explaining how other youtubers and influencers were destroying houses pretending to be flipping... but I watched a youtuber destroy his house because it had to be fixed. Came for drama, stayed for a genuine story, and something of value was gained.",
  },
  {
    headline: "You made all that stress go away",
    name: "@armyninjaz8552",
    likes: 38,
    text: "Being a veteran going through a tornado of stress, depression and over worked/hardly paid the past couple of years, you made all that go away throughout this video. I have never heard of you before this video but you have now got a life long follower. Thank you for such inspiration, positivity and raw openness that you have shared with the world.",
  },
  {
    headline: "90 minutes flies by",
    name: "@michaelkraus5984",
    likes: 1807,
    text: "Sure. You see that hour and a half runtime and think, No Way! Spend the time! Spend the time!",
  },
  {
    headline: "Curiosity to subscriber in one video",
    name: "@cappellettof",
    likes: 147,
    text: "I came because of curiosity, stayed because of the soundtrack and ended subscribing because of the quality. Nice woodworking.",
  },
  {
    headline: "45 years in the trade, and this impressed me",
    name: "@jimswanny1193",
    likes: 160,
    text: "Dude I have been a cabinet maker for 45 years, this is one of the coolest table tops I have ever seen, from a fellow craftsman, well done.",
  },
  {
    headline: "Inspired me to start building",
    name: "@soothingsounds1784",
    likes: 11,
    text: "I just wanna say this build inspired me to start building my own furniture, and I'm currently in the process of making my first coffee table. Much love man",
  },
];

const platforms = [
  {
    name: "YouTube @jespermakes",
    platform: "youtube" as const,
    href: "/mediakit/youtube",
    stats: [
      { label: "Subscribers", value: "359K" },
      { label: "Total Videos", value: "133" },
      { label: "Total Views", value: "43.6M" },
      { label: "Engagement", value: "6.1%" },
      { label: "Avg Watch Time", value: "8:54" },
    ],
  },
  {
    name: "YouTube In The Rough",
    platform: "youtube" as const,
    href: "/mediakit/in-the-rough",
    stats: [
      { label: "Subscribers", value: "8.5K" },
      { label: "Total Videos", value: "23" },
      { label: "Engagement", value: "8.0%" },
    ],
    note: "Top 5% engagement rate",
  },
  {
    name: "Instagram @jespermakes",
    platform: "instagram" as const,
    href: "/mediakit/instagram",
    stats: [
      { label: "Followers", value: "120K" },
      { label: "Posts", value: "295" },
      { label: "Engagement", value: "4.1%" },
    ],
  },
  {
    name: "TikTok @jespermakes",
    platform: "tiktok" as const,
    href: "/mediakit/tiktok",
    stats: [
      { label: "Followers", value: "44K" },
      { label: "Videos", value: "132" },
      { label: "Engagement", value: "2.6%" },
    ],
  },
  {
    name: "Facebook Page",
    platform: "facebook" as const,
    href: "/mediakit/facebook",
    stats: [
      { label: "Followers", value: "9.6K" },
    ],
  },
];

const ambassadorships = [
  { name: "Festool", logo: "/brands/festool.svg" },
  { name: "Rubio Monocoat", logo: "/brands/rubio-monocoat.svg" },
];
const collaborators = [
  { name: "Bambu Lab", logo: "/brands/bambu-lab.svg" },
  { name: "xTool", logo: "/brands/xtool.svg" },
  { name: "Milanote", logo: "/brands/milanote.svg" },
  { name: "BetterHelp", logo: "/brands/betterhelp.png" },
  { name: "Navimow", logo: "/brands/navimow.svg" },
];

const ageData = [
  { label: "18-24", pct: 6.2 },
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

/* ------------------------------------------------------------------ */
/*  Reusable components                                                 */
/* ------------------------------------------------------------------ */

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-14 text-white/60 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#E8604C] rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 text-right text-white/60">{pct}%</span>
    </div>
  );
}

function DonutChart({
  male,
  female,
}: {
  male: number;
  female: number;
}) {
  const deg = (male / 100) * 360;
  return (
    <div className="flex items-center gap-6">
      <div
        className="w-24 h-24 rounded-full shrink-0"
        style={{
          background: `conic-gradient(#E8604C ${deg}deg, #555 ${deg}deg)`,
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#1a1a1a]" />
        </div>
      </div>
      <div className="text-sm space-y-1">
        <p>
          <span className="inline-block w-3 h-3 rounded-sm bg-[#E8604C] mr-2" />
          Male {male}%
        </p>
        <p>
          <span className="inline-block w-3 h-3 rounded-sm bg-[#555] mr-2" />
          Female {female}%
        </p>
      </div>
    </div>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const icons: Record<string, JSX.Element> = {
    instagram: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.15V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z" />
      </svg>
    ),
    youtube: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  };
  return icons[platform] ?? null;
}

function ThumbsUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <path d="M7 22V11l5-9 1.5 1.5L12 8h8a2 2 0 012 2v2a2 2 0 01-.06.5l-2.5 8.5A2 2 0 0117.5 22H7z" />
      <path d="M2 11h3v11H2z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function MediaKit() {
  return (
    <div className="bg-[#0f0f0f] text-white -mt-[1px]">
      {/* ---- Hero ---- */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-6">
          Media Kit
        </p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
          538K+ followers.{" "}
          <span className="text-[#E8604C]">42.8M+ views.</span>
          <br />
          Real builds, real audience.
        </h1>

        <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-10">
          {[
            { platform: "youtube", label: "YouTube", count: "359K" },
            { platform: "instagram", label: "Instagram", count: "120K" },
            { platform: "tiktok", label: "TikTok", count: "44K" },
            { platform: "youtube", label: "In The Rough", count: "8.5K" },
            { platform: "facebook", label: "Facebook", count: "9.6K" },
          ].map((p) => (
            <div
              key={p.label}
              className="flex items-center gap-2 text-white/70"
            >
              <div className="text-[#E8604C]">
                <PlatformIcon platform={p.platform} />
              </div>
              <span className="font-semibold text-white">{p.count}</span>
              <span className="text-sm">{p.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-white/30 text-xs">
          <span>Updated June 2026</span>
          <span className="inline-flex items-center gap-1.5 border border-white/10 rounded-full px-3 py-1 text-white/40">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            Verified via YouTube Analytics API
          </span>
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- About ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
          About Jesper
        </h2>
        <div className="max-w-3xl text-white/70 text-lg leading-relaxed space-y-4">
          <p>
            Jesper is a Danish woodworker and maker who went from hobbyist to
            full-time creator in under two years. His content is
            storytelling-driven, built around workshop builds, outdoor projects,
            and honest craft rather than trends. That approach has earned a
            loyal, highly engaged global community of makers, DIY enthusiasts,
            and craft lovers.
          </p>
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- Featured Videos ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
          Featured Videos
        </h2>
        <p className="text-white/50 mb-10">
          Proven performance. These videos show what resonates with the audience.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVideos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1a1a]">
                <Image
                  src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-[#E8604C]/90 flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      className="w-6 h-6 ml-1"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-white/90 leading-snug line-clamp-2">
                  {video.title}
                </p>
                <p className="text-[#E8604C] text-sm font-semibold mt-1">
                  {video.views}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- Audience Testimonials ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
          What the Audience Says
        </h2>
        <p className="text-white/50 mb-10">
          Real comments from real viewers. This is the kind of connection the content creates.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 hover:border-[#E8604C]/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(232,96,76,0.06)] transition-all duration-300"
            >
              <p className="text-[#E8604C] text-sm font-semibold mb-2">
                {t.headline}
              </p>
              <p className="text-white/70 text-sm leading-relaxed italic mb-4">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs font-medium">
                  {t.name}
                </span>
                <span className="flex items-center gap-1 text-white/40 text-xs">
                  <ThumbsUpIcon />
                  {t.likes.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- Audience Overview ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
          Core audience: male, 25 to 54, predominantly US and Europe.
        </h2>
        <p className="text-white/50 mb-10">
          Primary demographics across all platforms.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Gender */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(232,96,76,0.08)] transition-all duration-300">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Gender
            </p>
            <DonutChart male={88.6} female={11.1} />
          </div>

          {/* Age */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(232,96,76,0.08)] transition-all duration-300">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Age Distribution
            </p>
            <div className="space-y-3">
              {ageData.map((a) => (
                <Bar key={a.label} label={a.label} pct={a.pct} />
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(232,96,76,0.08)] transition-all duration-300">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Top Countries
            </p>
            <div className="space-y-3">
              {countryData.map((c) => (
                <Bar key={c.label} label={c.label} pct={c.pct} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- Platform Breakdown ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-white">
          Platform Breakdown
        </h2>

        <div className="grid sm:grid-cols-2 gap-6">
          {platforms.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              className="group bg-[#1a1a1a] rounded-xl p-6 border border-white/5 hover:border-[#E8604C]/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(232,96,76,0.1)] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="text-[#E8604C]">
                    <PlatformIcon platform={p.platform} />
                  </div>
                  <h3 className="font-semibold text-white">{p.name}</h3>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white/30 group-hover:text-[#E8604C] transition-colors">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {p.stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-[#E8604C] text-xl font-bold">
                      {s.value}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {p.note && (
                <p className="text-white/40 text-xs mt-4 pt-4 border-t border-white/10">
                  {p.note}
                </p>
              )}

              <p className="text-[#E8604C]/60 text-xs font-medium mt-4 group-hover:text-[#E8604C] transition-colors">
                View details
              </p>
            </Link>
          ))}
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- Brand Partners ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white text-center">
          Brand Partners
        </h2>
        <p className="text-white/50 mb-12 text-center">
          Trusted by leading brands in tools, craft, and technology.
        </p>

        {/* Ambassador for */}
        <div className="mb-10">
          <p className="text-[#E8604C] text-xs uppercase tracking-widest font-semibold mb-6 text-center">
            Ambassador for
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {ambassadorships.map((brand) => (
              <div
                key={brand.name}
                className="w-48 h-24 rounded-xl bg-[#1a1a1a] border border-[#E8604C]/20 flex items-center justify-center p-4 hover:border-[#E8604C]/50 hover:shadow-[0_0_20px_rgba(232,96,76,0.1)] hover:scale-105 transition-all duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-12 max-w-full brightness-0 invert opacity-90"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Repeated collaborations */}
        <div>
          <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-6 text-center">
            Repeated collaborations
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {collaborators.map((brand) => (
              <div
                key={brand.name}
                className="w-36 h-16 rounded-lg bg-[#1a1a1a] border border-white/5 flex items-center justify-center p-3 hover:border-white/20 hover:scale-105 transition-all duration-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-8 max-w-full brightness-0 invert opacity-70"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- CTA ---- */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Want to work together?
        </h2>
        <p className="text-white/50 mb-8 max-w-lg mx-auto">
          Reach out to discuss partnerships, sponsored content, or
          collaborations.
        </p>
        <a
          href="mailto:sponsors@jespermakes.com"
          className="inline-block bg-[#E8604C] hover:bg-[#d14e3b] text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
        >
          sponsors@jespermakes.com
        </a>
      </section>
    </div>
  );
}
