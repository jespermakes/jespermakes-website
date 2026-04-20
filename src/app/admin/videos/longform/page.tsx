import Link from "next/link";
import { db } from "@/lib/db";
import { videos, videoTasks } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  LONGFORM_STAGES,
  STAGE_LABELS,
  type LongformStage,
} from "@/lib/video-stages";

export const dynamic = "force-dynamic";

export default async function LongformPage() {
  const rows = await db
    .select({
      video: videos,
      openTaskCount: sql<number>`(SELECT COUNT(*)::int FROM ${videoTasks} WHERE ${videoTasks.videoId} = ${videos.id} AND ${videoTasks.done} = false)`,
    })
    .from(videos)
    .where(and(eq(videos.kind, "longform"), eq(videos.hidden, false)));

  // Group by stage
  const grouped = new Map<LongformStage, typeof rows>();
  for (const stage of LONGFORM_STAGES) grouped.set(stage, []);
  for (const row of rows) {
    const stage = row.video.stage as LongformStage;
    if (grouped.has(stage)) grouped.get(stage)!.push(row);
  }

  const totalActive = rows.filter(
    (r) => r.video.stage !== "idea" && r.video.stage !== "published"
  ).length;

  return (
    <div className="max-w-6xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Long-form videos</h1>
          <p className="text-sm text-wood-light/60 m-0">
            {totalActive} in production
          </p>
        </div>
        <Link
          href="/admin/videos/longform/new"
          className="bg-wood text-cream rounded-xl py-3 px-5 text-sm font-semibold no-underline"
        >
          + New video
        </Link>
      </div>

      <div className="space-y-8">
        {LONGFORM_STAGES.map((stage) => {
          const stageRows = grouped.get(stage) ?? [];
          return (
            <section key={stage}>
              <div className="flex items-baseline gap-3 mb-3 border-b border-wood/[0.06] pb-2">
                <h2 className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
                  {STAGE_LABELS[stage]}
                </h2>
                <span className="text-xs text-wood-light/40">{stageRows.length}</span>
              </div>

              {stageRows.length === 0 && (
                <div className="text-sm text-wood-light/40 italic">Nothing here yet.</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stageRows.map(({ video, openTaskCount }) => (
                  <Link
                    key={video.id}
                    href={`/admin/videos/longform/${video.id}`}
                    className="block bg-white/50 border border-wood/[0.06] rounded-2xl p-4 hover:border-wood/[0.15] no-underline"
                  >
                    <div className="font-semibold text-wood mb-1 text-sm">{video.title}</div>
                    {video.sponsor && (
                      <div className="text-xs text-forest mb-2">{video.sponsor}</div>
                    )}
                    <div className="flex gap-3 flex-wrap text-[11px] text-wood-light/50">
                      {video.targetPublishDate && (
                        <span>{new Date(video.targetPublishDate).toISOString().slice(0, 10)}</span>
                      )}
                      {openTaskCount > 0 && (
                        <span>{openTaskCount} open</span>
                      )}
                      {video.stage === "published" && !video.youtubeId && (
                        <span className="text-red-700/80">Missing YouTube ID</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
