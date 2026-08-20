import { db } from "@/lib/db";
import { competitionEntries } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Full entry list for The Floor Rescue (Rubio, Aug-Sep 2026), admin eyes only.
// Rubio gets the read-only judging view at /floor-rescue/judging instead,
// which hides emails and opt-ins.
export default async function AdminFloorRescuePage() {
  const rows = await db
    .select()
    .from(competitionEntries)
    .where(eq(competitionEntries.campaign, "rubio-floor-rescue-2026"))
    .orderBy(desc(competitionEntries.createdAt));

  const optIns = rows.filter((r) => r.newsletterOptIn).length;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-normal text-wood mb-1">The Floor Rescue</h1>
        <p className="text-sm text-wood-light/60 m-0">
          {rows.length.toLocaleString()} entries, {optIns.toLocaleString()} newsletter opt-ins.
          Rubio&apos;s read-only view: /floor-rescue/judging (needs the key).
        </p>
      </div>

      {rows.length === 0 && (
        <div className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 text-sm text-wood-light/50">
          No entries yet.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 flex gap-5 flex-wrap"
          >
            <a href={row.photoUrl} target="_blank" rel="noreferrer" className="shrink-0">
              {/* Vercel Blob URLs are not in next/image remotePatterns; plain img keeps this simple. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={row.photoUrl}
                alt={`Floor from ${row.name}`}
                className="w-40 h-40 object-cover rounded-xl border border-wood/[0.08]"
              />
            </a>
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-baseline gap-3 flex-wrap mb-1">
                <span className="text-wood font-semibold">{row.name}</span>
                <span className="text-xs text-wood-light/50">{row.country}</span>
                <span className="text-xs text-wood-light/50 tabular-nums">
                  {new Date(row.createdAt).toISOString().slice(0, 16).replace("T", " ")}
                </span>
                <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-wood-light/40">
                  {row.status}
                </span>
              </div>
              <div className="text-xs text-wood-light/60 mb-2">
                {row.email}
                {row.newsletterOptIn ? " · newsletter opt-in" : ""}
              </div>
              <p className="text-sm text-wood-light/80 whitespace-pre-wrap m-0">
                {row.floorStory || "(no story)"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
