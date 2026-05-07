import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const onlyUnread = url.searchParams.get("unread") === "1";
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "20", 10)),
  );
  const filters = [eq(notifications.userId, session.user.id)];
  if (onlyUnread) filters.push(eq(notifications.read, false));
  const where = filters.length === 1 ? filters[0] : and(...filters);
  const rows = await db
    .select()
    .from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
  return NextResponse.json({
    notifications: rows.map((r) => ({
      id: r.id,
      type: r.type,
      message: r.message,
      actorId: r.actorId,
      actorName: r.actorName,
      designId: r.designId,
      commentId: r.commentId,
      read: r.read,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
