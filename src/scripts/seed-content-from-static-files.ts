import { db } from "../lib/db";
import { blogPosts, toolItems, images } from "../lib/db/schema";
import { eq, sql } from "drizzle-orm";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseDate(s: string | undefined, label: string, slug: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date "${s}" in ${label} for slug "${slug}"`);
  }
  return d;
}

async function run() {
  console.log("=== Seeding content from static files ===\n");

  const { blogPosts: staticPosts } = await import("../data/blog-posts");
  const { tools: staticTools } = await import("../data/tools");

  const allImages = await db.select().from(images);
  const imagesByUrl = new Map(allImages.map((img) => [img.url, img.id]));

  console.log(`Static blog posts: ${staticPosts.length}`);
  console.log(`Static tools:      ${staticTools.length}`);
  console.log(`Image library:     ${allImages.length} entries\n`);

  const existingPosts = await db.select({ slug: blogPosts.slug, id: blogPosts.id, heroImageId: blogPosts.heroImageId }).from(blogPosts);
  const postBySlug = new Map(existingPosts.map((p) => [p.slug, p]));

  const existingTools = await db.select({ slug: toolItems.slug, id: toolItems.id, imageId: toolItems.imageId }).from(toolItems);
  const toolBySlug = new Map(existingTools.map((t) => [t.slug, t]));

  let postsInserted = 0, postsSkipped = 0, postsLinked = 0;
  const postDetails: string[] = [];

  for (const post of staticPosts) {
    const publishedAt = parseDate(post.publishedAt, "publishedAt", post.slug);
    const updatedAt = post.updatedAt ? parseDate(post.updatedAt, "updatedAt", post.slug) : publishedAt;
    const heroImageId = post.heroImage ? imagesByUrl.get(post.heroImage) ?? null : null;

    const existing = postBySlug.get(post.slug);
    if (existing) {
      if (post.heroImage && !existing.heroImageId && heroImageId) {
        await db
          .update(blogPosts)
          .set({ heroImageId, updatedAt: new Date() })
          .where(eq(blogPosts.id, existing.id));
        postsLinked++;
        postDetails.push(`~ Linked image for: ${post.slug}`);
      } else {
        postsSkipped++;
        postDetails.push(`= Skipped (exists): ${post.slug}`);
      }
      continue;
    }

    await db.insert(blogPosts).values({
      slug: post.slug,
      title: post.title,
      description: post.description ?? "",
      content: post.content ?? "",
      author: post.author ?? "Jesper",
      tags: Array.isArray(post.tags) ? post.tags : [],
      heroImage: post.heroImage ?? null,
      heroImageId,
      heroImageAlt: post.heroImageAlt ?? null,
      featuredVideo: post.featuredVideo ?? null,
      status: "published",
      hidden: false,
      publishedAt,
      createdAt: publishedAt ?? new Date(),
      updatedAt: updatedAt ?? publishedAt ?? new Date(),
    });

    postsInserted++;
    postDetails.push(`+ Inserted:         ${post.slug}`);
  }

  console.log("[Blog posts]");
  for (const line of postDetails) console.log("  " + line);
  console.log(`\nBlog: inserted=${postsInserted}, linked=${postsLinked}, skipped=${postsSkipped}\n`);

  let toolsInserted = 0, toolsSkipped = 0, toolsLinked = 0;
  const toolDetails: string[] = [];
  let order = 0;

  for (const tool of staticTools) {
    order++;
    const imageId = tool.image ? imagesByUrl.get(tool.image) ?? null : null;

    const existing = toolBySlug.get(tool.slug);
    if (existing) {
      if (tool.image && !existing.imageId && imageId) {
        await db
          .update(toolItems)
          .set({ imageId, updatedAt: new Date() })
          .where(eq(toolItems.id, existing.id));
        toolsLinked++;
        toolDetails.push(`~ Linked image for: ${tool.slug}`);
      } else {
        toolsSkipped++;
        toolDetails.push(`= Skipped (exists): ${tool.slug}`);
      }
      continue;
    }

    await db.insert(toolItems).values({
      slug: tool.slug,
      name: tool.name,
      description: tool.description ?? "",
      longDescription: tool.longDescription ?? null,
      category: tool.category,
      categorySlug: slugify(tool.category),
      categoryIcon: tool.categoryIcon ?? "",
      image: tool.image ?? null,
      imageId,
      buyLinks: Array.isArray(tool.buyLinks) ? tool.buyLinks : [],
      ambassadorBadge: tool.badge === "Ambassador",
      featured: false,
      hidden: false,
      sortOrder: order,
      youtubeVideos: Array.isArray(tool.youtubeVideos) ? tool.youtubeVideos : [],
      colorGrid: Array.isArray(tool.colorGrid) ? tool.colorGrid : [],
      productList: Array.isArray(tool.productList) ? tool.productList : [],
      gallery: Array.isArray(tool.gallery) ? tool.gallery : [],
      useCases: Array.isArray(tool.useCases) ? tool.useCases : [],
      specs: Array.isArray(tool.specs) ? tool.specs : [],
      jesperNote: tool.jesperNote ?? null,
      learnMoreUrl: tool.learnMoreUrl ?? null,
    });

    toolsInserted++;
    toolDetails.push(`+ Inserted:         ${tool.slug}`);
  }

  console.log("[Tools]");
  for (const line of toolDetails) console.log("  " + line);
  console.log(`\nTools: inserted=${toolsInserted}, linked=${toolsLinked}, skipped=${toolsSkipped}\n`);

  const [pCount] = await db.select({ c: sql<number>`count(*)::int` }).from(blogPosts);
  const [tCount] = await db.select({ c: sql<number>`count(*)::int` }).from(toolItems);

  console.log(`=== Final counts ===`);
  console.log(`Blog posts in DB: ${pCount.c}`);
  console.log(`Tools in DB:      ${tCount.c}`);

  if (pCount.c < staticPosts.length) {
    console.error(`\n!!! DB has fewer blog posts (${pCount.c}) than static file (${staticPosts.length}). Something went wrong.`);
    process.exit(1);
  }
  if (tCount.c < staticTools.length) {
    console.error(`\n!!! DB has fewer tools (${tCount.c}) than static file (${staticTools.length}). Something went wrong.`);
    process.exit(1);
  }

  console.log(`\nOK: DB has at least as many rows as static files for both.`);
  process.exit(0);
}

run().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
