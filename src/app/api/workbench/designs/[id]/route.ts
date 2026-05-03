import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workbenchDesigns, workbenchVersions } from "@/lib/db/schema";

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

/**
 * Author-only update: snapshots the existing data into workbench_versions
 * (next sequential version_number) before applying the change. Body fields
 * accepted: name, description, tags, category, data, thumbnail, changelog.
 */
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const obj = (body ?? {}) as Record<string, unknown>;
  const [existing] = await db
    .select()
    .from(workbenchDesigns)
    .where(
      and(
        eq(workbenchDesigns.id, id),
        eq(workbenchDesigns.authorId, session.user.id),
      ),
    )
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If the data is being replaced, snapshot the current data first.
  if (obj.data && typeof obj.data === "object") {
    const [latest] = await db
      .select({ versionNumber: workbenchVersions.versionNumber })
      .from(workbenchVersions)
      .where(eq(workbenchVersions.designId, id))
      .orderBy(desc(workbenchVersions.versionNumber))
      .limit(1);
    const nextVersion = (latest?.versionNumber ?? 0) + 1;
    await db
      .insert(workbenchVersions)
      .values({
        designId: id,
        versionNumber: nextVersion,
        data: existing.data,
        changelog:
          typeof obj.changelog === "string" ? obj.changelog : "",
      })
      .catch((err) => {
        console.error("workbench version snapshot failed:", err);
      });
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof obj.name === "string") update.name = obj.name.trim() || existing.name;
  if (typeof obj.description === "string") update.description = obj.description;
  if (Array.isArray(obj.tags)) {
    update.tags = (obj.tags as unknown[])
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 12);
  }
  if (typeof obj.category === "string") update.category = obj.category;
  if (obj.data && typeof obj.data === "object") update.data = obj.data;
  if (typeof obj.thumbnail === "string") update.thumbnail = obj.thumbnail;

  await db
    .update(workbenchDesigns)
    .set(update)
    .where(eq(workbenchDesigns.id, id));
  return NextResponse.json({ ok: true });
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
