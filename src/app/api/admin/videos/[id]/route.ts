import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videos, videoTasks, videoTools, toolItems } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { eq } from "drizzle-orm";
import { isValidStage, type VideoKind } from "@/lib/video-stages";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const [video] = await db.select().from(videos).where(eq(videos.id, params.id)).limit(1);
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  return NextResponse.json({ video, tasks, tools: linkedTools });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    const [existing] = await db.select().from(videos).where(eq(videos.id, params.id)).limit(1);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updates: Partial<typeof videos.$inferInsert> = { updatedAt: new Date() };

    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.sponsor !== undefined) updates.sponsor = body.sponsor || null;
    if (body.targetPublishDate !== undefined) updates.targetPublishDate = body.targetPublishDate || null;
    if (body.youtubeId !== undefined) updates.youtubeId = body.youtubeId || null;
    if (body.scriptNotes !== undefined) updates.scriptNotes = body.scriptNotes || null;
    if (body.sponsorContact !== undefined) updates.sponsorContact = body.sponsorContact || null;
    if (body.notes !== undefined) updates.notes = body.notes || null;

    if (body.stage !== undefined) {
      if (!isValidStage(existing.kind as VideoKind, body.stage)) {
        return NextResponse.json({ error: `stage "${body.stage}" not valid for ${existing.kind}` }, { status: 400 });
      }
      updates.stage = body.stage;
      // Auto-set publishedAt when stage transitions to 'published'
      if (body.stage === "published" && existing.stage !== "published") {
        updates.publishedAt = new Date();
      }
    }

    // Replace linked tools if provided (body.toolIds is an array of UUIDs)
    if (Array.isArray(body.toolIds)) {
      await db.delete(videoTools).where(eq(videoTools.videoId, params.id));
      if (body.toolIds.length > 0) {
        await db.insert(videoTools).values(
          body.toolIds.map((toolId: string, idx: number) => ({
            videoId: params.id,
            toolId,
            sortOrder: idx,
          }))
        );
      }
    }

    const [updated] = await db.update(videos).set(updates).where(eq(videos.id, params.id)).returning();
    return NextResponse.json({ video: updated });
  } catch (e) {
    console.error("Update video error:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const [updated] = await db
      .update(videos)
      .set({ hidden: true, updatedAt: new Date() })
      .where(eq(videos.id, params.id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Hide video error:", e);
    return NextResponse.json({ error: "Hide failed" }, { status: 500 });
  }
}
