import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videoTasks } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { and, eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    const updates: Partial<typeof videoTasks.$inferInsert> = { updatedAt: new Date() };

    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.done !== undefined) {
      updates.done = !!body.done;
      updates.completedAt = body.done ? new Date() : null;
    }
    if (body.assignee !== undefined) {
      if (body.assignee !== null && body.assignee !== "jesper" && body.assignee !== "bearatski") {
        return NextResponse.json({ error: "assignee must be jesper, bearatski, or null" }, { status: 400 });
      }
      updates.assignee = body.assignee;
    }
    if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder) || 0;

    const [updated] = await db
      .update(videoTasks)
      .set(updates)
      .where(and(eq(videoTasks.id, params.taskId), eq(videoTasks.videoId, params.id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ task: updated });
  } catch (e) {
    console.error("Update task error:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    await db
      .delete(videoTasks)
      .where(and(eq(videoTasks.id, params.taskId), eq(videoTasks.videoId, params.id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Delete task error:", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
