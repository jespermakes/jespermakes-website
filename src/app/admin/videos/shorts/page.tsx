import Link from "next/link";
import { db } from "@/lib/db";
import { videos, videoTasks } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { STAGE_LABELS, SHORTS_STAGES } from "@/lib/video-stages";

export const dynamic = "force-dynamic";

export default async function ShortsPage() {
  const rows = await db
    .select({
      video: videos,
      openTaskCount: sql<number>`(SELECT COUNT(*)::int FROM ${videoTasks} WHERE ${videoTasks.videoId} = ${videos.id} AND ${videoTasks.done} = false)`,
    })
    .from(videos)
    .where(and(eq(videos.kind, "shorts"), eq(videos.hidden, false)))
    .orderBy(desc(videos.updatedAt));

  const byStage: Record<string, number> = {};
  for (const stage of SHORTS_STAGES) byStage[stage] = 0;
  for (const r of rows) byStage[r.video.stage] = (byStage[r.video.stage] ?? 0) + 1;

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Shorts</h1>
          <p className="text-sm text-wood-light/60 m-0">
            {SHORTS_STAGES.map((s) => `${byStage[s] ?? 0} ${STAGE_LABELS[s].toLowerCase()}`).join(" \u00b7 ")}
          </p>
        </div>
        <Link
          href="/admin/videos/shorts/new"
          className="bg-wood text-cream rounded-xl py-3 px-5 text-sm font-semibold no-underline"
        >
          + New short
        </Link>
      </div>

      <div className="bg-white/55 border border-wood/[0.07] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_120px_100px] gap-4 px-5 py-3 border-b border-wood/[0.06] text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
          <div>Title</div>
          <div>Status</div>
          <div>Open tasks</div>
          <div className="text-right">Updated</div>
        </div>
        {rows.length === 0 && (
          <div className="p-5 text-sm text-wood-light/50">No shorts yet. Drop your first idea.</div>
        )}
        {rows.map(({ video, openTaskCount }, i) => (
          <Link
            key={video.id}
            href={`/admin/videos/shorts/${video.id}`}
            className={
              "grid grid-cols-[1fr_120px_120px_100px] gap-4 px-5 py-3 text-sm no-underline hover:bg-white/40" +
              (i > 0 ? " border-t border-wood/[0.05]" : "")
            }
          >
            <div className="text-wood truncate">{video.title}</div>
            <div className="text-xs text-wood-light/70">{STAGE_LABELS[video.stage] ?? video.stage}</div>
            <div className="text-xs text-wood-light/70">{openTaskCount > 0 ? openTaskCount : "\u2014"}</div>
            <div className="text-right text-wood-light/50 text-xs tabular-nums">
              {new Date(video.updatedAt).toISOString().slice(0, 10)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
