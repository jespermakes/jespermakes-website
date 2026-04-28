import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { studioDesigns } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select({
      id: studioDesigns.id,
      name: studioDesigns.name,
      thumbnail: studioDesigns.thumbnail,
      updatedAt: studioDesigns.updatedAt,
      createdAt: studioDesigns.createdAt,
    })
    .from(studioDesigns)
    .where(eq(studioDesigns.userId, session.user.id))
    .orderBy(desc(studioDesigns.updatedAt));
  return NextResponse.json({ designs: rows });
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
  const name = typeof obj.name === "string" ? obj.name : "Untitled";
  const data = obj.data;
  if (!data || typeof data !== "object") {
    return NextResponse.json(
      { error: "Missing 'data' design payload." },
      { status: 400 },
    );
  }
  const thumbnail =
    typeof obj.thumbnail === "string" ? obj.thumbnail : null;

  const [row] = await db
    .insert(studioDesigns)
    .values({
      userId: session.user.id,
      name,
      data,
      thumbnail,
    })
    .returning({
      id: studioDesigns.id,
      name: studioDesigns.name,
      updatedAt: studioDesigns.updatedAt,
    });

  return NextResponse.json({ design: row }, { status: 201 });
}
