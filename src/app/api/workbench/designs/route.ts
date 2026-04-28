import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, workbenchDesigns } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const VALID_CATEGORIES = new Set([
  "general",
  "furniture",
  "joinery",
  "signs",
  "toys",
  "jigs",
  "decorative",
  "mechanical",
  "laser",
  "cnc",
]);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");
  const sort = url.searchParams.get("sort") ?? "recent";
  const tag = url.searchParams.get("tag");
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const filters = [eq(workbenchDesigns.status, "published")];
  if (category && VALID_CATEGORIES.has(category)) {
    filters.push(eq(workbenchDesigns.category, category));
  }
  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    filters.push(
      // ilike on name OR description
      or(
        ilike(workbenchDesigns.name, term),
        ilike(workbenchDesigns.description, term),
      )!,
    );
  }
  if (tag && tag.trim().length > 0) {
    // jsonb @> '[<tag>]' ⇒ tags array contains the tag.
    filters.push(
      sql`${workbenchDesigns.tags} @> ${JSON.stringify([tag])}::jsonb`,
    );
  }

  let orderBy;
  switch (sort) {
    case "popular":
      orderBy = desc(workbenchDesigns.downloadCount);
      break;
    case "most-liked":
      orderBy = desc(workbenchDesigns.likeCount);
      break;
    default:
      orderBy = desc(workbenchDesigns.publishedAt);
  }

  const where = filters.length === 1 ? filters[0] : and(...filters);

  const [rows, total] = await Promise.all([
    db
      .select({
        id: workbenchDesigns.id,
        name: workbenchDesigns.name,
        description: workbenchDesigns.description,
        authorName: workbenchDesigns.authorName,
        thumbnail: workbenchDesigns.thumbnail,
        tags: workbenchDesigns.tags,
        category: workbenchDesigns.category,
        downloadCount: workbenchDesigns.downloadCount,
        likeCount: workbenchDesigns.likeCount,
        remixCount: workbenchDesigns.remixCount,
        publishedAt: workbenchDesigns.publishedAt,
      })
      .from(workbenchDesigns)
      .where(where)
      .orderBy(orderBy)
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(workbenchDesigns)
      .where(where),
  ]);

  return NextResponse.json({
    designs: rows,
    totalCount: total[0]?.count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const obj = (body ?? {}) as Record<string, unknown>;
  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const description =
    typeof obj.description === "string" ? obj.description : "";
  const tags =
    Array.isArray(obj.tags)
      ? (obj.tags as unknown[])
          .filter((t): t is string => typeof t === "string")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
          .slice(0, 12)
      : [];
  const category =
    typeof obj.category === "string" && VALID_CATEGORIES.has(obj.category)
      ? obj.category
      : "general";
  const data = obj.data;
  if (!data || typeof data !== "object") {
    return NextResponse.json(
      { error: "Missing 'data' design payload." },
      { status: 400 },
    );
  }
  const thumbnail =
    typeof obj.thumbnail === "string" ? obj.thumbnail : null;
  const sourceDesignId =
    typeof obj.sourceDesignId === "string" ? obj.sourceDesignId : null;
  const remixOfId =
    typeof obj.remixOfId === "string" ? obj.remixOfId : null;

  // Resolve a display name for the author. Cache it on the row so the listing
  // doesn't have to join users on every request.
  const [authorRow] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const authorName =
    authorRow?.name?.trim() ||
    authorRow?.email?.split("@")[0] ||
    "Maker";

  const [row] = await db
    .insert(workbenchDesigns)
    .values({
      sourceDesignId,
      authorId: session.user.id,
      authorName,
      name,
      description,
      tags,
      data,
      thumbnail,
      category,
      remixOfId,
    })
    .returning({
      id: workbenchDesigns.id,
      name: workbenchDesigns.name,
      publishedAt: workbenchDesigns.publishedAt,
    });

  // Increment the parent's remix count if this is a remix.
  if (remixOfId) {
    await db
      .update(workbenchDesigns)
      .set({
        remixCount: sql`${workbenchDesigns.remixCount} + 1`,
      })
      .where(eq(workbenchDesigns.id, remixOfId));
  }

  return NextResponse.json({ design: row }, { status: 201 });
}
