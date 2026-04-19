import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    if (!body.slug || typeof body.slug !== "string") {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }
    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, body.slug))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: `Slug "${body.slug}" already exists` }, { status: 409 });
    }

    const now = new Date();
    const status = body.status === "published" ? "published" : "draft";

    const [created] = await db
      .insert(blogPosts)
      .values({
        slug: body.slug,
        title: body.title,
        description: body.description ?? "",
        content: body.content ?? "",
        author: body.author ?? "Jesper",
        tags: Array.isArray(body.tags) ? body.tags : [],
        heroImage: body.heroImage ?? null,
        heroImageId: body.heroImageId ?? null,
        heroImageAlt: body.heroImageAlt ?? null,
        featuredVideo: body.featuredVideo ?? null,
        status,
        publishedAt: status === "published" ? now : null,
      })
      .returning();

    return NextResponse.json({ post: created });
  } catch (e) {
    console.error("Create post error:", e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
