import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videos, videoTasks } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { eq } from "drizzle-orm";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const tasks = await db
    .select()
    .from(videoTasks)
    .where(eq(videoTasks.videoId, params.id))
    .orderBy(videoTasks.sortOrder, videoTasks.createdAt);

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

    const assignee = body.assignee;
    if (assignee !== undefined && assignee !== null && assignee !== "jesper" && assignee !== "bearatski") {
      return NextResponse.json({ error: "assignee must be jesper, bearatski, or null" }, { status: 400 });
    }

    // Sanity check: video exists
    const [video] = await db.select({ id: videos.id }).from(videos).where(eq(videos.id, params.id)).limit(1);
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const [created] = await db.insert(videoTasks).values({
      videoId: params.id,
      title,
      assignee: assignee ?? null,
    }).returning();

    return NextResponse.json({ task: created }, { status: 201 });
  } catch (e) {
    console.error("Create task error:", e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
