import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { competitionEntries } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Floor Rescue · Judging",
  robots: { index: false, follow: false },
};

// Read-only judging view for Rubio Monocoat. Gated by a shared key
// (FLOOR_RESCUE_JUDGING_KEY) passed as ?key=... so nobody at Rubio needs an
// account. Deliberately shows no emails and no newsletter opt-ins: entrants
// consented to sharing their entry (name, country, story, photo) with Rubio,
// and that is all judging needs.
export default async function FloorRescueJudgingPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const expected = process.env.FLOOR_RESCUE_JUDGING_KEY;
  if (!expected || key !== expected) notFound();

  const rows = await db
    .select({
      id: competitionEntries.id,
      name: competitionEntries.name,
      country: competitionEntries.country,
      floorStory: competitionEntries.floorStory,
      photoUrl: competitionEntries.photoUrl,
      createdAt: competitionEntries.createdAt,
    })
    .from(competitionEntries)
    .where(eq(competitionEntries.campaign, "rubio-floor-rescue-2026"))
    .orderBy(desc(competitionEntries.createdAt));

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl font-normal text-wood mb-2">The Floor Rescue</h1>
        <p className="text-sm text-wood-light/60 mb-10">
          {rows.length.toLocaleString()} entries so far. Worst floor wins: three winners, ideally
          three countries, picked on need and story. This page is live, refresh for new entries.
        </p>

        {rows.length === 0 && (
          <div className="bg-white/55 border border-wood/[0.07] rounded-2xl p-6 text-sm text-wood-light/50">
            No entries yet.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {rows.map((row) => (
            <div
              key={row.id}
              className="bg-white/55 border border-wood/[0.07] rounded-2xl p-6 flex gap-6 flex-wrap"
            >
              <a href={row.photoUrl} target="_blank" rel="noreferrer" className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.photoUrl}
                  alt={`Floor from ${row.name}`}
                  className="w-56 h-56 object-cover rounded-xl border border-wood/[0.08]"
                />
              </a>
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-baseline gap-3 flex-wrap mb-2">
                  <span className="text-wood font-semibold text-lg">{row.name}</span>
                  <span className="text-sm text-wood-light/50">{row.country}</span>
                  <span className="text-xs text-wood-light/40 tabular-nums">
                    {new Date(row.createdAt).toISOString().slice(0, 10)}
                  </span>
                </div>
                <p className="text-sm text-wood-light/80 whitespace-pre-wrap m-0">
                  {row.floorStory || "(no story submitted)"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
