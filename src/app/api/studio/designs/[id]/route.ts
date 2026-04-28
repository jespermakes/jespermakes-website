import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { studioDesigns } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const [row] = await db
    .select()
    .from(studioDesigns)
    .where(
      and(eq(studioDesigns.id, id), eq(studioDesigns.userId, session.user.id)),
    )
    .limit(1);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    design: {
      id: row.id,
      name: row.name,
      data: row.data,
      thumbnail: row.thumbnail,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const obj = (body ?? {}) as Record<string, unknown>;
  const update: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (typeof obj.name === "string") update.name = obj.name;
  if (typeof obj.description === "string") update.description = obj.description;
  if (obj.data && typeof obj.data === "object") update.data = obj.data;
  if (typeof obj.thumbnail === "string") update.thumbnail = obj.thumbnail;

  const [row] = await db
    .update(studioDesigns)
    .set(update)
    .where(
      and(eq(studioDesigns.id, id), eq(studioDesigns.userId, session.user.id)),
    )
    .returning({
      id: studioDesigns.id,
      name: studioDesigns.name,
      updatedAt: studioDesigns.updatedAt,
    });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ design: row });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const result = await db
    .delete(studioDesigns)
    .where(
      and(eq(studioDesigns.id, id), eq(studioDesigns.userId, session.user.id)),
    )
    .returning({ id: studioDesigns.id });
  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
