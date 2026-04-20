import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { and, eq, desc } from "drizzle-orm";
import { isValidStage, type VideoKind } from "@/lib/video-stages";

export async function GET(request: NextRequest) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");

  const conditions = [eq(videos.hidden, false)];
  if (kind === "longform" || kind === "shorts") {
    conditions.push(eq(videos.kind, kind));
  }

  const rows = await db
    .select()
    .from(videos)
    .where(and(...conditions))
    .orderBy(desc(videos.updatedAt));

  return NextResponse.json({ videos: rows });
}

export async function POST(request: NextRequest) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    const kind = body.kind as VideoKind;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const stage = typeof body.stage === "string" ? body.stage : "idea";

    if (kind !== "longform" && kind !== "shorts") {
      return NextResponse.json({ error: "kind must be longform or shorts" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }
    if (!isValidStage(kind, stage)) {
      return NextResponse.json({ error: `stage "${stage}" not valid for ${kind}` }, { status: 400 });
    }

    const [created] = await db.insert(videos).values({
      kind,
      title,
      stage,
      sponsor: body.sponsor ?? null,
      targetPublishDate: body.targetPublishDate ?? null,
      scriptNotes: body.scriptNotes ?? null,
      sponsorContact: body.sponsorContact ?? null,
      notes: body.notes ?? null,
    }).returning();

    return NextResponse.json({ video: created }, { status: 201 });
  } catch (e) {
    console.error("Create video error:", e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
