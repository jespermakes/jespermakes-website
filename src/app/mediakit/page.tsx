import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Kit — Jesper Makes",
  description:
    "Audience stats, demographics, and brand partnership info for Jesper Makes — 517.5K+ followers across YouTube, Instagram, and TikTok.",
};

/* ------------------------------------------------------------------ */
/*  Reusable tiny components                                           */
/* ------------------------------------------------------------------ */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5">
      <p className="text-[#E8604C] text-2xl md:text-3xl font-bold">{value}</p>
      <p className="text-white/50 text-sm mt-1">{label}</p>
    </div>
  );
}

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
  };
  return icons[platform] ?? null;
}

/* ------------------------------------------------------------------ */
/*  Section wrappers                                                   */
/* ------------------------------------------------------------------ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">
      {children}
    </h2>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MediaKit() {
  const brandPartners = [
    "Festool",
    "Carhartt",
    "Rubio Monocoat",
    "Bambu Lab",
    "BetterHelp",
    "xTool Official",
  ];

  return (
    <div className="bg-[#0f0f0f] text-white -mt-[1px]">
      {/* ---- Hero ---- */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-4">
          Media Kit
        </p>
        <p className="text-6xl md:text-8xl font-bold text-[#E8604C]">
          517.5k
        </p>
        <p className="text-white/50 text-lg mt-2">Total Followers</p>

        {/* Platform breakdown */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-10">
          {[
            { platform: "instagram", label: "Instagram", count: "115.1k" },
            { platform: "tiktok", label: "TikTok", count: "44.1k" },
            { platform: "youtube", label: "YouTube", count: "351.0k" },
            { platform: "youtube", label: "YouTube 2", count: "7.3k" },
          ].map((p) => (
            <div key={p.label} className="flex items-center gap-2 text-white/70">
              <PlatformIcon platform={p.platform} />
              <span className="font-semibold text-white">{p.count}</span>
              <span className="text-sm">{p.label}</span>
            </div>
          ))}
        </div>

        <p className="text-white/30 text-xs mt-6">Updated March 2026</p>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- YouTube @jespermakes ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <SectionTitle>YouTube @jespermakes</SectionTitle>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Subscribers" value="351k" />
          <StatCard label="Content Engagement" value="6.1%" />
          <StatCard label="Subscriber Engagement" value="1.60%" />
          <StatCard label="Total Videos" value="126" />
          <StatCard label="Avg Video Views" value="253.4k" />
          <StatCard label="Avg Comments" value="604" />
          <StatCard label="Avg Likes" value="4.9k" />
          <StatCard label="Avg Watch Time" value="12h 31min" />
        </div>

        <div className="bg-[#1a1a1a] rounded-xl p-5 mb-10 text-sm text-white/60">
          <span className="text-[#E8604C] font-semibold">Top 50% engagement</span>{" "}
          — 6.1% higher than 50% of creators with similar reach
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Gender */}
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Gender
            </p>
            <DonutChart male={90.1} female={9.9} />
          </div>

          {/* Age */}
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Age
            </p>
            <div className="space-y-3">
              <Bar label="18-24" pct={9.6} />
              <Bar label="25-34" pct={24.2} />
              <Bar label="35-44" pct={25.2} />
              <Bar label="45-54" pct={18.6} />
              <Bar label="55-64" pct={13.2} />
            </div>
          </div>

          {/* Countries */}
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Top Countries
            </p>
            <div className="space-y-3">
              <Bar label="US" pct={20.2} />
              <Bar label="DE" pct={10.5} />
              <Bar label="UK" pct={6.2} />
              <Bar label="FR" pct={5.5} />
              <Bar label="IT" pct={4.7} />
              <Bar label="PL" pct={3.7} />
            </div>
          </div>
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- Instagram ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <SectionTitle>Instagram @jespermakes</SectionTitle>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Followers" value="115.1k" />
          <StatCard label="Engagement" value="4.1%" />
          <StatCard label="30d Reach" value="118.4k" />
          <StatCard label="Total Posts" value="287" />
          <StatCard label="Avg Reels Views" value="16.3k" />
          <StatCard label="Avg Likes" value="554" />
          <StatCard label="Avg Comments" value="24" />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Gender
            </p>
            <DonutChart male={70.5} female={29.5} />
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Age
            </p>
            <div className="space-y-3">
              <Bar label="25-34" pct={14.3} />
              <Bar label="35-44" pct={31.7} />
              <Bar label="45-54" pct={31} />
              <Bar label="55-64" pct={16.4} />
            </div>
          </div>
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- TikTok ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <SectionTitle>TikTok @jespermakes</SectionTitle>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Followers" value="44.1k" />
          <StatCard label="Engagement" value="2.6%" />
          <StatCard label="Avg Views" value="16.6k" />
          <StatCard label="Total Videos" value="132" />
          <StatCard label="Avg Likes" value="346" />
          <StatCard label="Avg Comments" value="4" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Gender
            </p>
            <DonutChart male={71} female={29} />
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Age
            </p>
            <div className="space-y-3">
              <Bar label="18-24" pct={6.6} />
              <Bar label="25-34" pct={25.5} />
              <Bar label="35-44" pct={32.7} />
              <Bar label="45-54" pct={24.8} />
              <Bar label="55-64" pct={10.4} />
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Top Countries
            </p>
            <div className="space-y-3">
              <Bar label="US" pct={6.7} />
              <Bar label="FR" pct={6.1} />
              <Bar label="UK" pct={5.9} />
              <Bar label="DE" pct={3.6} />
            </div>
          </div>
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- YouTube 2 ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <SectionTitle>YouTube @jespermakes2 — In The Rough</SectionTitle>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Subscribers" value="7.3k" />
          <StatCard label="Content Engagement" value="8.0%" />
          <StatCard label="Total Videos" value="21" />
          <StatCard label="Avg Video Views" value="45.6k" />
          <StatCard label="Avg Watch Time" value="2h 5min" />
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-5 text-sm text-white/60">
          <span className="text-[#E8604C] font-semibold">Top 5% engagement</span>{" "}
          — 8.0% content engagement rate
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- Brand Partners ---- */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <SectionTitle>Brand Partners</SectionTitle>
        <div className="flex flex-wrap justify-center gap-4">
          {brandPartners.map((name) => (
            <div
              key={name}
              className="w-32 h-32 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-center text-sm text-white/70 font-medium px-3"
            >
              {name}
            </div>
          ))}
        </div>
      </section>

      <hr className="border-white/10 max-w-5xl mx-auto" />

      {/* ---- CTA ---- */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Want to work together?
        </h2>
        <a
          href="mailto:sponsors@jespermakes.com"
          className="inline-block bg-[#E8604C] hover:bg-[#d14e3b] text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors mt-4"
        >
          sponsors@jespermakes.com →
        </a>
      </section>
    </div>
  );
}
