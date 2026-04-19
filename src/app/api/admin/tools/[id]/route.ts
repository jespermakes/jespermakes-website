import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { and, eq, ne } from "drizzle-orm";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    const id = params.id;

    if (body.slug) {
      const clash = await db
        .select({ id: toolItems.id })
        .from(toolItems)
        .where(and(eq(toolItems.slug, body.slug), ne(toolItems.id, id)))
        .limit(1);
      if (clash.length > 0) {
        return NextResponse.json(
          { error: `Slug "${body.slug}" is already used by another tool` },
          { status: 409 }
        );
      }
    }

    const updates: Partial<typeof toolItems.$inferInsert> = { updatedAt: new Date() };
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.categorySlug !== undefined) updates.categorySlug = body.categorySlug;
    if (body.description !== undefined) updates.description = body.description;
    if (body.image !== undefined) updates.image = body.image;
    if (body.imageId !== undefined) updates.imageId = body.imageId;
    if (body.buyLinks !== undefined) {
      updates.buyLinks = typeof body.buyLinks === "object" && body.buyLinks !== null ? body.buyLinks : {};
    }
    if (body.ambassadorBadge !== undefined) updates.ambassadorBadge = !!body.ambassadorBadge;
    if (body.featured !== undefined) updates.featured = !!body.featured;
    if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder) || 0;

    const [updated] = await db.update(toolItems).set(updates).where(eq(toolItems.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    return NextResponse.json({ tool: updated });
  } catch (e) {
    console.error("Update tool error:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const [updated] = await db
      .update(toolItems)
      .set({ hidden: true, updatedAt: new Date() })
      .where(eq(toolItems.id, params.id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Hide tool error:", e);
    return NextResponse.json({ error: "Hide failed" }, { status: 500 });
  }
}
