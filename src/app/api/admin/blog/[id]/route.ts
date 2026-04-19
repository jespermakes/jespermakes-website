import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { and, eq, ne } from "drizzle-orm";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    const id = params.id;

    const currentRows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (currentRows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const current = currentRows[0];

    if (body.slug && body.slug !== current.slug) {
      const clash = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, body.slug), ne(blogPosts.id, id)))
        .limit(1);
      if (clash.length > 0) {
        return NextResponse.json(
          { error: `Slug "${body.slug}" is already used by another post` },
          { status: 409 }
        );
      }
    }

    let publishedAt = current.publishedAt;
    if (body.status === "published" && current.status !== "published" && !publishedAt) {
      publishedAt = new Date();
    }

    const updates: Partial<typeof blogPosts.$inferInsert> = { updatedAt: new Date() };
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.content !== undefined) updates.content = body.content;
    if (body.author !== undefined) updates.author = body.author;
    if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.heroImage !== undefined) updates.heroImage = body.heroImage;
    if (body.heroImageId !== undefined) updates.heroImageId = body.heroImageId;
    if (body.heroImageAlt !== undefined) updates.heroImageAlt = body.heroImageAlt;
    if (body.featuredVideo !== undefined) updates.featuredVideo = body.featuredVideo;
    if (body.status !== undefined) updates.status = body.status;
    if (publishedAt !== current.publishedAt) updates.publishedAt = publishedAt;

    const [updated] = await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id)).returning();

    return NextResponse.json({ post: updated });
  } catch (e) {
    console.error("Update post error:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const [updated] = await db
      .update(blogPosts)
      .set({ hidden: true, updatedAt: new Date() })
      .where(eq(blogPosts.id, params.id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Hide post error:", e);
    return NextResponse.json({ error: "Hide failed" }, { status: 500 });
  }
}
