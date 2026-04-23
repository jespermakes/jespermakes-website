import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAdminApi } from "@/lib/admin/auth";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (body.data !== undefined) update.data = body.data;
  if (body.visible !== undefined) update.visible = Boolean(body.visible);
  if (typeof body.position === "number") update.position = body.position;

  const [row] = await db
    .update(pageSections)
    .set(update)
    .where(eq(pageSections.id, params.id))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  revalidatePath("/");
  return NextResponse.json({ section: row });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const [row] = await db
    .update(pageSections)
    .set({ hidden: true, updatedAt: new Date() })
    .where(eq(pageSections.id, params.id))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
