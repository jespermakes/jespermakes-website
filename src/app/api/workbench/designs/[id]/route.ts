import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workbenchDesigns } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const [row] = await db
    .select()
    .from(workbenchDesigns)
    .where(
      and(
        eq(workbenchDesigns.id, id),
        eq(workbenchDesigns.status, "published"),
      ),
    )
    .limit(1);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Bump download count atomically. Best-effort: a failure here shouldn't
  // block the response.
  void db
    .update(workbenchDesigns)
    .set({ downloadCount: sql`${workbenchDesigns.downloadCount} + 1` })
    .where(eq(workbenchDesigns.id, id))
    .catch(() => {
      /* noop */
    });

  return NextResponse.json({
    design: {
      id: row.id,
      name: row.name,
      description: row.description,
      authorName: row.authorName,
      authorId: row.authorId,
      tags: row.tags,
      category: row.category,
      data: row.data,
      thumbnail: row.thumbnail,
      downloadCount: row.downloadCount + 1,
      likeCount: row.likeCount,
      remixCount: row.remixCount,
      remixOfId: row.remixOfId,
      publishedAt: row.publishedAt,
    },
  });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const result = await db
    .delete(workbenchDesigns)
    .where(
      and(
        eq(workbenchDesigns.id, id),
        eq(workbenchDesigns.authorId, session.user.id),
      ),
    )
    .returning({ id: workbenchDesigns.id });
  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
