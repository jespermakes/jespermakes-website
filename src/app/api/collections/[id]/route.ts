import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collectionItems, designCollections } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  const { id } = await ctx.params;
  const [collection] = await db
    .select()
    .from(designCollections)
    .where(eq(designCollections.id, id))
    .limit(1);
  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!collection.isPublic && collection.userId !== session?.user?.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const items = await db
    .select()
    .from(collectionItems)
    .where(eq(collectionItems.collectionId, id))
    .orderBy(collectionItems.sortOrder);
  return NextResponse.json({ collection, items });
}

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
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof obj.name === "string") update.name = obj.name.trim().slice(0, 100);
  if (typeof obj.description === "string") update.description = obj.description;
  if (typeof obj.isPublic === "boolean") update.isPublic = obj.isPublic;
  const [row] = await db
    .update(designCollections)
    .set(update)
    .where(
      and(
        eq(designCollections.id, id),
        eq(designCollections.userId, session.user.id),
      ),
    )
    .returning({ id: designCollections.id });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const result = await db
    .delete(designCollections)
    .where(
      and(
        eq(designCollections.id, id),
        eq(designCollections.userId, session.user.id),
      ),
    )
    .returning({ id: designCollections.id });
  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
