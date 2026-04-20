import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { videos, videoTasks, videoTools, toolItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { VideoEditor } from "@/components/admin/video-editor";
import type { VideoKind } from "@/lib/video-stages";

export const dynamic = "force-dynamic";

export default async function VideoDetailPage({
  params,
}: {
  params: { kind: string; id: string };
}) {
  if (params.kind !== "longform" && params.kind !== "shorts") notFound();

  const [video] = await db.select().from(videos).where(eq(videos.id, params.id)).limit(1);
  if (!video || video.hidden || video.kind !== params.kind) notFound();

  const tasks = await db
    .select()
    .from(videoTasks)
    .where(eq(videoTasks.videoId, params.id))
    .orderBy(videoTasks.sortOrder, videoTasks.createdAt);

  const linkedTools = await db
    .select({
      id: toolItems.id,
      slug: toolItems.slug,
      name: toolItems.name,
      image: toolItems.image,
    })
    .from(videoTools)
    .innerJoin(toolItems, eq(videoTools.toolId, toolItems.id))
    .where(eq(videoTools.videoId, params.id))
    .orderBy(videoTools.sortOrder);

  return (
    <VideoEditor
      video={video}
      kind={params.kind as VideoKind}
      initialTasks={tasks}
      initialTools={linkedTools}
    />
  );
}
