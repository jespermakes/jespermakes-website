import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collectionItems, designCollections } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * Add an item to a collection. Body: { studioDesignId? | workbenchDesignId? }
 * Exactly one of the ID fields must be set.
 */
export async function POST(request: NextRequest, ctx: Ctx) {
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
  const studioDesignId =
    typeof obj.studioDesignId === "string" ? obj.studioDesignId : null;
  const workbenchDesignId =
    typeof obj.workbenchDesignId === "string" ? obj.workbenchDesignId : null;
  if (!studioDesignId && !workbenchDesignId) {
    return NextResponse.json(
      { error: "studioDesignId or workbenchDesignId required" },
      { status: 400 },
    );
  }
  const [collection] = await db
    .select()
    .from(designCollections)
    .where(
      and(
        eq(designCollections.id, id),
        eq(designCollections.userId, session.user.id),
      ),
    )
    .limit(1);
  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [row] = await db
    .insert(collectionItems)
    .values({
      collectionId: id,
      studioDesignId,
      workbenchDesignId,
    })
    .returning({ id: collectionItems.id });
  await db
    .update(designCollections)
    .set({ updatedAt: new Date() })
    .where(eq(designCollections.id, id));
  return NextResponse.json({ item: row }, { status: 201 });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const url = new URL(request.url);
  const itemId = url.searchParams.get("itemId");
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }
  const [collection] = await db
    .select({ id: designCollections.id })
    .from(designCollections)
    .where(
      and(
        eq(designCollections.id, id),
        eq(designCollections.userId, session.user.id),
      ),
    )
    .limit(1);
  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.delete(collectionItems).where(eq(collectionItems.id, itemId));
  return NextResponse.json({ ok: true });
}
