import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { and, eq, ne } from "drizzle-orm";
import { adminVoiceGate } from "@/lib/voice/gate-log";
import { leafInputs, readOverride } from "@/lib/voice/gate";

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

    const currentRows = await db.select().from(toolItems).where(eq(toolItems.id, id)).limit(1);
    if (currentRows.length === 0) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    const current = currentRows[0];
    // judged on what this edit adds: a finding already on the same line of the stored text passes
    const voice = await adminVoiceGate(
      "admin.tools.update",
      (gate.session.user as { id?: string } | undefined)?.id ?? null,
      [
        { field: "name", text: body.name, before: current.name },
        { field: "category", text: body.category, before: current.category },
        { field: "description", text: body.description, before: current.description },
        { field: "longDescription", text: body.longDescription, before: current.longDescription },
        { field: "jesperNote", text: body.jesperNote, before: current.jesperNote },
        ...(["buyLinks", "colorGrid", "productList", "gallery", "useCases", "specs"] as const).flatMap((k) =>
          body[k] !== undefined ? leafInputs(body[k], current[k], k) : [],
        ),
      ],
      readOverride(body.voiceOverride),
    );
    if (voice.response) return voice.response;

    const updates: Partial<typeof toolItems.$inferInsert> = { updatedAt: new Date() };

    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.categorySlug !== undefined) updates.categorySlug = body.categorySlug;
    if (body.categoryIcon !== undefined) updates.categoryIcon = body.categoryIcon;
    if (body.description !== undefined) updates.description = body.description;
    if (body.longDescription !== undefined) updates.longDescription = body.longDescription;
    if (body.image !== undefined) updates.image = body.image;
    if (body.imageId !== undefined) updates.imageId = body.imageId;
    if (body.buyLinks !== undefined) {
      updates.buyLinks = Array.isArray(body.buyLinks) ? body.buyLinks : [];
    }
    if (body.youtubeVideos !== undefined) {
      updates.youtubeVideos = Array.isArray(body.youtubeVideos) ? body.youtubeVideos : [];
    }
    if (body.colorGrid !== undefined) {
      updates.colorGrid = Array.isArray(body.colorGrid) ? body.colorGrid : [];
    }
    if (body.productList !== undefined) {
      updates.productList = Array.isArray(body.productList) ? body.productList : [];
    }
    if (body.gallery !== undefined) {
      updates.gallery = Array.isArray(body.gallery) ? body.gallery : [];
    }
    if (body.useCases !== undefined) {
      updates.useCases = Array.isArray(body.useCases) ? body.useCases : [];
    }
    if (body.specs !== undefined) {
      updates.specs = Array.isArray(body.specs) ? body.specs : [];
    }
    if (body.jesperNote !== undefined) updates.jesperNote = body.jesperNote;
    if (body.learnMoreUrl !== undefined) updates.learnMoreUrl = body.learnMoreUrl;
    if (body.ambassadorBadge !== undefined) updates.ambassadorBadge = !!body.ambassadorBadge;
    if (body.featured !== undefined) updates.featured = !!body.featured;
    if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder) || 0;

    const [updated] = await db.update(toolItems).set(updates).where(eq(toolItems.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    return NextResponse.json({ tool: updated, voice: voice.voice });
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
