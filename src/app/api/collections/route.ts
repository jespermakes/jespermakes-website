import { NextRequest, NextResponse } from "next/server";
import { count, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collectionItems, designCollections } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const collections = await db
    .select({
      id: designCollections.id,
      name: designCollections.name,
      description: designCollections.description,
      isPublic: designCollections.isPublic,
      updatedAt: designCollections.updatedAt,
    })
    .from(designCollections)
    .where(eq(designCollections.userId, session.user.id))
    .orderBy(desc(designCollections.updatedAt));
  // Count items per collection (small N — N+1 is fine).
  const counts = await Promise.all(
    collections.map(async (c) => {
      const [r] = await db
        .select({ count: count() })
        .from(collectionItems)
        .where(eq(collectionItems.collectionId, c.id));
      return Number(r?.count ?? 0);
    }),
  );
  return NextResponse.json({
    collections: collections.map((c, i) => ({
      ...c,
      itemCount: counts[i],
    })),
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
  const isPublic = obj.isPublic === true;
  const [row] = await db
    .insert(designCollections)
    .values({
      userId: session.user.id,
      name: name.slice(0, 100),
      description,
      isPublic,
    })
    .returning({
      id: designCollections.id,
      name: designCollections.name,
      isPublic: designCollections.isPublic,
    });
  return NextResponse.json({ collection: row }, { status: 201 });
}
