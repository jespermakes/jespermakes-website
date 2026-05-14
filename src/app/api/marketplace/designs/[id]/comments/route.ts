import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  workbenchComments,
  workbenchDesigns,
} from "@/lib/db/schema";
import { createNotification } from "@/lib/notifications";
import { publicDisplayName } from "@/lib/profile";

export const dynamic = "force-dynamic";

const MAX_LEN = 2000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const recentByUser = new Map<string, number[]>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const list = (recentByUser.get(key) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (list.length >= RATE_MAX) {
    recentByUser.set(key, list);
    return false;
  }
  list.push(now);
  recentByUser.set(key, list);
  return true;
}

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const rows = await db
    .select({
      id: workbenchComments.id,
      authorId: workbenchComments.authorId,
      authorName: workbenchComments.authorName,
      content: workbenchComments.content,
      parentId: workbenchComments.parentId,
      createdAt: workbenchComments.createdAt,
      status: workbenchComments.status,
    })
    .from(workbenchComments)
    .where(
      and(
        eq(workbenchComments.designId, id),
        eq(workbenchComments.status, "published"),
      ),
    )
    .orderBy(asc(workbenchComments.createdAt));
  return NextResponse.json({ comments: rows });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRateLimit(session.user.id)) {
    return NextResponse.json(
      { error: "Slow down — wait a moment before commenting again." },
      { status: 429 },
    );
  }
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const obj = (body ?? {}) as Record<string, unknown>;
  const raw = typeof obj.content === "string" ? obj.content.trim() : "";
  if (!raw) {
    return NextResponse.json({ error: "Comment is empty." }, { status: 400 });
  }
  const content = raw.slice(0, MAX_LEN);
  let parentId: string | null = null;
  if (typeof obj.parentId === "string" && obj.parentId.length > 0) {
    // Confirm the parent exists AND that it's not itself a reply (one-deep).
    const [parent] = await db
      .select({
        id: workbenchComments.id,
        parentId: workbenchComments.parentId,
      })
      .from(workbenchComments)
      .where(eq(workbenchComments.id, obj.parentId))
      .limit(1);
    if (!parent) {
      return NextResponse.json(
        { error: "Reply target not found." },
        { status: 400 },
      );
    }
    parentId = parent.parentId ?? parent.id;
  }

  const [design] = await db
    .select({
      id: workbenchDesigns.id,
      authorId: workbenchDesigns.authorId,
      name: workbenchDesigns.name,
    })
    .from(workbenchDesigns)
    .where(eq(workbenchDesigns.id, id))
    .limit(1);
  if (!design) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Resolve the author display name (cached on the row so the listing
  // doesn't need to join users every request).
  const [actor] = await db
    .select({
      displayName: users.displayName,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const authorName = publicDisplayName(actor ?? null);

  const [row] = await db
    .insert(workbenchComments)
    .values({
      designId: id,
      authorId: session.user.id,
      authorName,
      content,
      parentId,
    })
    .returning({
      id: workbenchComments.id,
      designId: workbenchComments.designId,
      authorId: workbenchComments.authorId,
      authorName: workbenchComments.authorName,
      content: workbenchComments.content,
      parentId: workbenchComments.parentId,
      createdAt: workbenchComments.createdAt,
      status: workbenchComments.status,
    });

  // Notify the design's author (unless it's their own comment).
  await createNotification({
    userId: design.authorId,
    actorId: session.user.id,
    actorName: authorName,
    type: "comment",
    designId: id,
    commentId: row.id,
    message: `${authorName} commented on "${design.name}"`,
  });

  return NextResponse.json({ comment: row }, { status: 201 });
}
