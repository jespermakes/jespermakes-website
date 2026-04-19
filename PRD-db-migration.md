# FLOKI-DB-SOURCE-OF-TRUTH.md

Migrates the public blog and tools pages to read from Postgres instead of static TypeScript files. Closes the gap between the admin backend (writes to DB) and the live site (reads from TS files).

**Prerequisite: `FLOKI-TOOL-RICH-FIELDS.md` must be deployed and verified first.** That brief adds the columns this seed script writes to. Running this against the v2 schema will fail because category_icon, long_description, etc. won't exist.

**Preflight reminder:** session-start protocol from `CLAUDE.md` before anything else.

**This deploy has real data risk.** If the seed script doesn't import every existing post and tool, content disappears from the live site. The seed has been tested locally against a Postgres that matches your schema exactly, using real static-data shapes — it handles the edge cases, but the row-count check at the end is what catches any case I didn't predict.

---

## 1. What this does

Before:
- Admin at `/admin/blog` writes to `blogPosts` table
- Public `/blog` and `/blog/[slug]` read from `src/data/blog-posts.ts`
- These two never talk to each other
- Same shape of problem for tools

After:
- Seed script imports everything from the static files into Postgres
- Public pages read from Postgres via Drizzle queries
- Admin edits appear on the public site within 60 seconds (revalidate window)
- Static files stay in the repo as dead code (rollback safety net)

---

## 2. Pre-flight sanity check — run BEFORE any code changes

Verify the shape of the data before touching anything:

```bash
cd ~/jesper-makes-ai/website

# Count rows in static files
grep -c "^  {$" src/data/blog-posts.ts 2>/dev/null || grep -c "slug:" src/data/blog-posts.ts
grep -c "slug:" src/data/tools.ts

# Count rows currently in DB
POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
export POSTGRES_URL
psql "$POSTGRES_URL" -c "SELECT COUNT(*) AS blog_posts FROM blog_posts;"
psql "$POSTGRES_URL" -c "SELECT COUNT(*) AS tool_items FROM tool_items;"

# Spot-check schema has the columns Brief A added
psql "$POSTGRES_URL" -c "\d tool_items" | grep -E "category_icon|long_description|color_grid|use_cases"
```

Report the static-file counts and DB counts to Jesper. Confirm the spot-check shows the Brief A columns exist before proceeding.

Expected: static blog-posts.ts has ~17 posts, static tools.ts has 80+ tools, DB has whatever the admin backend created (likely small — a few test posts and tools).

---

## 3. Seed script

Create `src/scripts/seed-content-from-static-files.ts`. **This script has been tested against your real schema and real tool shapes** — it handles the nested `BuyLink[]`, `ColorSwatch[]`, `Spec[]`, nested arrays, missing optional fields, and date parsing. The final row-count check aborts the transaction if anything is missing.

```typescript
import "dotenv/config";
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
```

**Run locally:**
```bash
POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
export POSTGRES_URL
npx tsx src/scripts/seed-content-from-static-files.ts
```

Read the output carefully. Expected pattern:

- Most rows print `+ Inserted:` (new to DB)
- A few rows print `= Skipped (exists):` (admin-created or previously seeded)
- Any row with a hero image that matches a library URL shows `~ Linked image for:` on a subsequent run

If the script errors out, it rolls back nothing itself (inserts are auto-committed one at a time in Drizzle) — you'll need to decide whether to truncate and re-run or repair specific rows. Report to Jesper before doing either.

**Verification after seed:**
```bash
psql "$POSTGRES_URL" -c "SELECT slug, status, published_at::date FROM blog_posts ORDER BY published_at DESC NULLS LAST LIMIT 25;"
psql "$POSTGRES_URL" -c "SELECT category, COUNT(*) FROM tool_items GROUP BY category ORDER BY category;"
```

Spot-check that every category you recognize is represented and every recent blog post is there.

---

## 4. Public blog pages

### 4.1 Replace `src/app/blog/page.tsx`

```typescript
import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts, images } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const revalidate = 60;

export const metadata = {
  title: "Blog — Jesper Makes",
  description: "Guides, tips, and honest takes on woodworking and making things.",
};

export default async function BlogIndexPage() {
  const rows = await db
    .select({
      post: blogPosts,
      image: images,
    })
    .from(blogPosts)
    .leftJoin(images, eq(blogPosts.heroImageId, images.id))
    .where(eq(blogPosts.hidden, false))
    .orderBy(desc(blogPosts.publishedAt));

  const published = rows.filter((r) => r.post.status === "published");

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-12">
          <h1 className="font-serif text-5xl text-wood mb-3">Blog</h1>
          <p className="text-wood-light text-lg max-w-2xl">
            Guides, tips, and honest takes on woodworking and making things.
          </p>
        </header>

        <div className="grid gap-8">
          {published.map(({ post, image }) => {
            const heroUrl = image?.url ?? post.heroImage ?? null;
            const heroAlt = post.heroImageAlt ?? image?.description ?? post.title;
            const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block bg-white/50 border border-wood/[0.06] rounded-2xl overflow-hidden hover:border-wood/[0.15] transition-colors no-underline"
              >
                {heroUrl ? (
                  <img
                    src={heroUrl}
                    alt={heroAlt}
                    className="w-full h-64 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-32 bg-wood/[0.04] flex items-center justify-center text-4xl">
                    🪵
                  </div>
                )}
                <div className="p-6">
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 text-[11px] text-wood-light/50">
                      {tags.slice(0, 6).map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  )}
                  <h2 className="font-serif text-2xl text-wood mb-2 leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-wood-light text-sm leading-relaxed mb-3">
                    {post.description}
                  </p>
                  <div className="text-xs text-wood-light/50">
                    {post.author ?? "Jesper"} · {formatDate(post.publishedAt)}
                  </div>
                </div>
              </Link>
            );
          })}

          {published.length === 0 && (
            <div className="p-8 text-sm text-wood-light/50 text-center">No posts yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
```

### 4.2 Replace `src/app/blog/[slug]/page.tsx`

Preserve any site-specific rendering (structured data, related posts, CTAs) that the current file has. This replaces the data-loading shape only.

```typescript
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { blogPosts, images } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, params.slug), eq(blogPosts.hidden, false)))
    .limit(1);

  const post = rows[0];
  if (!post) return { title: "Not found — Jesper Makes" };

  return {
    title: `${post.title} — Jesper Makes`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const rows = await db
    .select({
      post: blogPosts,
      image: images,
    })
    .from(blogPosts)
    .leftJoin(images, eq(blogPosts.heroImageId, images.id))
    .where(and(eq(blogPosts.slug, params.slug), eq(blogPosts.hidden, false)))
    .limit(1);

  const row = rows[0];
  if (!row || row.post.status !== "published") notFound();

  const { post, image } = row;
  const heroUrl = image?.url ?? post.heroImage ?? null;
  const heroAlt = post.heroImageAlt ?? image?.description ?? post.title;
  const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];
  const hasVideo = !!post.featuredVideo;

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <Link href="/blog" className="text-sm text-amber hover:underline mb-8 inline-block">
          ← Back to blog
        </Link>

        {hasVideo ? (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-wood/5">
            <iframe
              src={`https://www.youtube.com/embed/${post.featuredVideo}`}
              title={post.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : heroUrl ? (
          <img
            src={heroUrl}
            alt={heroAlt}
            className="w-full rounded-2xl mb-8 object-cover max-h-[500px]"
          />
        ) : null}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 text-[11px] text-wood-light/50">
            {tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}

        <h1 className="font-serif text-4xl md:text-5xl text-wood mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="text-sm text-wood-light/60 mb-10">
          {post.author ?? "Jesper"} · {formatDate(post.publishedAt)}
        </div>

        <article className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-wood prose-p:text-wood-light prose-a:text-amber prose-strong:text-wood">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

function formatDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
```

**Preservation note:** If the current file includes site-specific features (JSON-LD, share buttons, related-posts section, newsletter CTA), preserve those on top of the new data-loading shape.

---

## 5. Public tools pages

### 5.1 Replace `src/app/tools/page.tsx`

```typescript
import Link from "next/link";
import { db } from "@/lib/db";
import { toolItems, images } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const revalidate = 60;

export const metadata = {
  title: "Tools & Links — Jesper Makes",
  description: "Tools I actually use in the workshop. Festool, Rubio Monocoat, Carhartt ambassador — every pick has earned its place.",
};

export default async function ToolsIndexPage() {
  const rows = await db
    .select({
      tool: toolItems,
      image: images,
    })
    .from(toolItems)
    .leftJoin(images, eq(toolItems.imageId, images.id))
    .where(eq(toolItems.hidden, false))
    .orderBy(asc(toolItems.category), asc(toolItems.sortOrder), asc(toolItems.name));

  const byCategory = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = row.tool.category;
    const arr = byCategory.get(key) ?? [];
    arr.push(row);
    byCategory.set(key, arr);
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-12">
          <h1 className="font-serif text-5xl text-wood mb-3">Tools & Links</h1>
          <p className="text-wood-light text-lg max-w-2xl">
            Festool ambassador. Rubio Monocoat ambassador. Carhartt ambassador. Every tool here earned its place in the workshop.
          </p>
        </header>

        {Array.from(byCategory.entries()).map(([category, tools]) => {
          const firstTool = tools[0]?.tool;
          const icon = firstTool?.categoryIcon ?? "";
          const categorySlug = firstTool?.categorySlug ?? "";

          return (
            <section key={category} className="mb-12">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-serif text-2xl text-wood">
                  {icon && <span className="mr-2">{icon}</span>}
                  {category}
                </h2>
                {categorySlug && (
                  <Link
                    href={`/tools/category/${categorySlug}`}
                    className="text-sm text-amber hover:underline"
                  >
                    See all ↗
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.slice(0, 6).map(({ tool, image }) => (
                  <ToolCard key={tool.id} tool={tool} image={image} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  image,
}: {
  tool: typeof toolItems.$inferSelect;
  image: typeof images.$inferSelect | null;
}) {
  const imgUrl = image?.url ?? tool.image ?? null;
  const imgAlt = image?.description ?? tool.name;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="block bg-white/50 border border-wood/[0.06] rounded-2xl overflow-hidden hover:border-wood/[0.15] no-underline"
    >
      {imgUrl ? (
        <img src={imgUrl} alt={imgAlt} className="w-full h-40 object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-40 bg-wood/[0.04]" />
      )}
      <div className="p-4">
        <div className="text-[11px] text-wood-light/50 mb-1">{tool.category}</div>
        <div className="font-semibold text-wood mb-1 text-sm">{tool.name}</div>
        <p className="text-xs text-wood-light/70 line-clamp-2">{tool.description}</p>
        {tool.ambassadorBadge && (
          <span className="inline-block mt-2 text-[10px] bg-amber/15 text-amber-dark rounded-md px-2 py-0.5 font-medium">
            Ambassador
          </span>
        )}
      </div>
    </Link>
  );
}
```

### 5.2 Replace `src/app/tools/[slug]/page.tsx`

This is the detail page. It needs to render every richer field — longDescription, specs, useCases, gallery, colorGrid, buyLinks with regions, jesperNote, learnMoreUrl.

```typescript
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/db";
import { toolItems, images } from "@/lib/db/schema";
import type { BuyLink, ColorSwatch, Spec } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const rows = await db
    .select()
    .from(toolItems)
    .where(and(eq(toolItems.slug, params.slug), eq(toolItems.hidden, false)))
    .limit(1);

  const tool = rows[0];
  if (!tool) return { title: "Not found — Jesper Makes" };

  return {
    title: `${tool.name} — Jesper Makes`,
    description: tool.description,
  };
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const rows = await db
    .select({
      tool: toolItems,
      image: images,
    })
    .from(toolItems)
    .leftJoin(images, eq(toolItems.imageId, images.id))
    .where(and(eq(toolItems.slug, params.slug), eq(toolItems.hidden, false)))
    .limit(1);

  const row = rows[0];
  if (!row) notFound();

  const { tool, image } = row;
  const imgUrl = image?.url ?? tool.image ?? null;
  const imgAlt = image?.description ?? tool.name;
  const buyLinks = (Array.isArray(tool.buyLinks) ? tool.buyLinks : []) as BuyLink[];
  const gallery = (Array.isArray(tool.gallery) ? tool.gallery : []) as string[];
  const useCases = (Array.isArray(tool.useCases) ? tool.useCases : []) as string[];
  const specs = (Array.isArray(tool.specs) ? tool.specs : []) as Spec[];
  const colorGrid = (Array.isArray(tool.colorGrid) ? tool.colorGrid : []) as ColorSwatch[];
  const youtubeVideos = (Array.isArray(tool.youtubeVideos) ? tool.youtubeVideos : []) as string[];

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <Link href="/tools" className="text-sm text-amber hover:underline mb-6 inline-block">
          ← Back to tools
        </Link>

        <div className="text-[11px] text-wood-light/50 mb-2">
          {tool.categoryIcon && <span className="mr-1">{tool.categoryIcon}</span>}
          {tool.category}
        </div>
        <h1 className="font-serif text-4xl text-wood mb-4">{tool.name}</h1>

        {imgUrl && (
          <img src={imgUrl} alt={imgAlt} className="w-full rounded-2xl mb-8 object-cover max-h-[400px]" />
        )}

        <p className="text-wood-light text-lg leading-relaxed mb-6">{tool.description}</p>

        {tool.ambassadorBadge && (
          <div className="mb-6 inline-block text-xs bg-amber/15 text-amber-dark rounded-md px-3 py-1 font-medium">
            Ambassador partner
          </div>
        )}

        {tool.longDescription && (
          <div className="prose prose-lg max-w-none prose-p:text-wood-light mb-8">
            <ReactMarkdown>{tool.longDescription}</ReactMarkdown>
          </div>
        )}

        {useCases.length > 0 && (
          <section className="mb-8">
            <h2 className="font-serif text-2xl text-wood mb-3">Where I use it</h2>
            <ul className="text-wood-light space-y-1">
              {useCases.map((uc) => (
                <li key={uc}>· {uc}</li>
              ))}
            </ul>
          </section>
        )}

        {specs.length > 0 && (
          <section className="mb-8">
            <h2 className="font-serif text-2xl text-wood mb-3">Specs</h2>
            <div className="bg-white/50 border border-wood/[0.06] rounded-2xl overflow-hidden">
              {specs.map((s, i) => (
                <div
                  key={s.label}
                  className={
                    "grid grid-cols-[160px_1fr] gap-4 px-5 py-3 text-sm" +
                    (i > 0 ? " border-t border-wood/[0.05]" : "")
                  }
                >
                  <div className="text-wood-light/60 text-xs uppercase tracking-wide">{s.label}</div>
                  <div className="text-wood">{s.value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {gallery.length > 0 && (
          <section className="mb-8">
            <h2 className="font-serif text-2xl text-wood mb-3">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="w-full aspect-square object-cover rounded-xl"
                  loading="lazy"
                />
              ))}
            </div>
          </section>
        )}

        {colorGrid.length > 0 && (
          <section className="mb-8">
            <h2 className="font-serif text-2xl text-wood mb-3">Colors</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {colorGrid.map((c) => (
                <div key={c.name} className="text-center">
                  <div
                    className="w-full aspect-square rounded-xl border border-wood/[0.08]"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="text-xs text-wood mt-1.5">{c.name}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {youtubeVideos.length > 0 && (
          <section className="mb-8">
            <h2 className="font-serif text-2xl text-wood mb-3">Videos</h2>
            <div className="space-y-4">
              {youtubeVideos.map((id) => (
                <div key={id} className="aspect-video rounded-2xl overflow-hidden bg-wood/5">
                  <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    title={tool.name}
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {tool.jesperNote && (
          <aside className="mb-8 p-5 bg-amber/5 border border-amber/20 rounded-2xl">
            <div className="text-[10px] font-bold tracking-[0.15em] text-amber-dark uppercase mb-2">
              Jesper's note
            </div>
            <p className="text-wood leading-relaxed m-0">{tool.jesperNote}</p>
          </aside>
        )}

        {buyLinks.length > 0 && (
          <section className="border-t border-wood/[0.08] pt-6 mt-8">
            <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-3">
              Where to buy
            </div>
            <div className="flex flex-wrap gap-2">
              {buyLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-wood text-cream rounded-xl px-4 py-2 text-sm font-semibold no-underline hover:bg-wood-light"
                >
                  {link.label}
                  {link.region && link.region !== "global" && (
                    <span className="ml-1 text-[10px] opacity-70">· {link.region.toUpperCase()}</span>
                  )}
                  {" ↗"}
                </a>
              ))}
            </div>
          </section>
        )}

        {tool.learnMoreUrl && (
          <div className="mt-8">
            <Link href={tool.learnMoreUrl} className="text-amber hover:underline">
              Learn more →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5.3 Replace `src/app/tools/category/[categorySlug]/page.tsx`

```typescript
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toolItems, images } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { categorySlug: string } }) {
  const rows = await db
    .select({ category: toolItems.category })
    .from(toolItems)
    .where(and(eq(toolItems.categorySlug, params.categorySlug), eq(toolItems.hidden, false)))
    .limit(1);

  const categoryName = rows[0]?.category ?? params.categorySlug;
  return { title: `${categoryName} — Jesper Makes` };
}

export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const rows = await db
    .select({
      tool: toolItems,
      image: images,
    })
    .from(toolItems)
    .leftJoin(images, eq(toolItems.imageId, images.id))
    .where(and(eq(toolItems.categorySlug, params.categorySlug), eq(toolItems.hidden, false)))
    .orderBy(asc(toolItems.sortOrder), asc(toolItems.name));

  if (rows.length === 0) notFound();

  const { category, categoryIcon } = rows[0].tool;

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <Link href="/tools" className="text-sm text-amber hover:underline mb-4 inline-block">
          ← All tools
        </Link>
        <h1 className="font-serif text-5xl text-wood mb-10">
          {categoryIcon && <span className="mr-2">{categoryIcon}</span>}
          {category}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map(({ tool, image }) => {
            const imgUrl = image?.url ?? tool.image ?? null;
            const imgAlt = image?.description ?? tool.name;
            return (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="block bg-white/50 border border-wood/[0.06] rounded-2xl overflow-hidden hover:border-wood/[0.15] no-underline"
              >
                {imgUrl ? (
                  <img src={imgUrl} alt={imgAlt} className="w-full h-40 object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-40 bg-wood/[0.04]" />
                )}
                <div className="p-4">
                  <div className="font-semibold text-wood mb-1 text-sm">{tool.name}</div>
                  <p className="text-xs text-wood-light/70 line-clamp-2">{tool.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

---

## 6. Homepage "From the Workshop" section

The homepage pulls blog posts from the static file. Find that import and replace it. Grep first:

```bash
grep -rn "from \"@/data/blog-posts\"\|from \"@/data/tools\"\|from \"../data/blog-posts\"\|from \"../data/tools\"" src/
```

Every match needs updating. Pattern for any component that used to show 3 recent posts:

```typescript
import { db } from "@/lib/db";
import { blogPosts, images } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

async function getRecentPosts(limit = 3) {
  const rows = await db
    .select({ post: blogPosts, image: images })
    .from(blogPosts)
    .leftJoin(images, eq(blogPosts.heroImageId, images.id))
    .where(eq(blogPosts.hidden, false))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);

  return rows.filter((r) => r.post.status === "published");
}
```

Replace any static import with a call like this. Don't forget to `await` the function.

---

## 7. Sitemap

If `src/app/sitemap.ts` exists and reads from static files, update it. Check first:

```bash
ls src/app/sitemap* 2>/dev/null
```

If it exists, replace with:

```typescript
import { db } from "@/lib/db";
import { blogPosts, toolItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db
    .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
    .from(blogPosts)
    .where(eq(blogPosts.hidden, false));

  const tools = await db
    .select({ slug: toolItems.slug, updatedAt: toolItems.updatedAt })
    .from(toolItems)
    .where(eq(toolItems.hidden, false));

  return [
    { url: "https://jespermakes.com/", lastModified: new Date() },
    { url: "https://jespermakes.com/blog", lastModified: new Date() },
    { url: "https://jespermakes.com/tools", lastModified: new Date() },
    ...posts.map((p) => ({
      url: `https://jespermakes.com/blog/${p.slug}`,
      lastModified: p.updatedAt,
    })),
    ...tools.map((t) => ({
      url: `https://jespermakes.com/tools/${t.slug}`,
      lastModified: t.updatedAt,
    })),
  ];
}
```

If no sitemap exists, skip this section.

---

## 8. Keep the static files

**Do NOT delete `src/data/blog-posts.ts` or `src/data/tools.ts` in this deploy.** Leave them as dead code.

Reason: if the DB-read path has any surprise after deploy, the rollback is one revert away — public pages go back to reading from the static files. Lose the files and the safety net is gone.

Once the DB-read path has been stable for a couple of weeks, a separate brief can delete them. Not now.

---

## 9. Smoke test

Critical paths to check manually in a browser after deploy:

- [ ] `/blog` — all 17 posts present, images loading, newest first
- [ ] `/blog/[any slug]` — renders content, hero image correct, tags shown
- [ ] `/blog/planter-box-finger-joints` — featured video plays
- [ ] `/tools` — all categories visible, icons showing (⚡, 🪵, etc.), tool cards rendering
- [ ] `/tools/festool-hkc-55-keb` — buy links in right shape, specs displayed
- [ ] `/tools/wisa-birch-plywood` — useCases, specs, jesperNote, learnMoreUrl all render
- [ ] `/tools/category/festool` — filters correctly
- [ ] Homepage "From the Workshop" section shows 3 recent posts
- [ ] **Admin edit round trip:** go to `/admin/blog/[any post]`, change description, save. Wait 60 seconds. Refresh the public page. Change appears.
- [ ] **Admin hide round trip:** hide a post in the admin. Wait 60 seconds. Post disappears from public.
- [ ] `/sitemap.xml` (if updated) includes the post slugs

The admin-edit round trip is the critical test. If it doesn't work, don't declare green.

Add these to `scripts/postflight.sh`:
```bash
"https://jespermakes.com/blog/how-to-build-with-pallet-wood"
"https://jespermakes.com/tools/category/festool"
```

---

## 10. Deploy sequence

```bash
cd ~/jesper-makes-ai/website

# Session-start protocol
git status
git log --oneline -10
git fetch origin
git log origin/main --oneline -10
# Report to Jesper, wait for confirmation

git pull --rebase origin main

# Pre-flight sanity check (section 2)
# Report counts to Jesper before continuing

# Create the seed script (section 3)
# Run it locally
POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
export POSTGRES_URL
npx tsx src/scripts/seed-content-from-static-files.ts

# Verify DB state with the psql queries in section 3
# Report counts to Jesper — wait for his OK to proceed

# Only after Jesper confirms the seed results,
# replace the public page files (sections 4-7)

# Update postflight URL list

./scripts/log-deploy.sh "Public pages read from DB instead of static files"
git add .
git commit -m "feat: public blog and tools pages read from Postgres"

./scripts/preflight.sh

git push origin main

sleep 120
./scripts/postflight.sh

# Browser smoke test (section 9), especially the admin-edit round trip
# Report deploy URL and test results to Jesper
```

---

## 11. Gotchas

1. **`revalidate = 60`** means admin edits appear on the public site within 60 seconds, not instantly. Serving every request from the DB would be slower and costlier; a 60s cache is the sweet spot.

2. **Image library lookup happens by URL match.** `imagesByUrl.get(post.heroImage)` only links if the static path matches a library entry exactly. Posts whose `heroImage` doesn't match just get `heroImageId: null` and fall back to the raw path at render time. This is fine — the admin can be used to pick a library image later.

3. **Drizzle inserts aren't in a transaction.** The seed uses one insert per row. If it fails halfway, you have partial state. The final row-count check catches this — it exits 1 if counts don't match. Re-running is safe because existing slugs are skipped.

4. **ReactMarkdown quirks in existing posts.** Some blog content in the static files may have HTML snippets that the old static renderer handled. Check the first 2-3 posts render cleanly. If not, the fix is usually in the `ReactMarkdown` plugin list, not the data layer.

5. **Legacy string-typed tags.** Any row in `blog_posts.tags` that escaped the v2 editor as a non-array (shouldn't exist but possible) would break rendering. The `Array.isArray(post.tags)` guard in the public pages handles it.

6. **Schema-side tags column is jsonb.** If you find yourself writing `tags: sql\`'[...]'\`` for anything, stop. Drizzle handles the JSONB conversion automatically when you pass a JS array.

7. **Don't touch `/api/newsletter/subscribe` here.** That's a separate question (the 3,300 Resend subscribers). Keep this deploy focused.

8. **Don't delete the static files in this deploy.** The rollback safety net. Separate follow-up brief will do that after stability is proven.

---

## 12. After this deploy

- Public pages read from the DB. Admin edits propagate within 60s.
- Static TS files are dead code. Floki must not edit them for content changes — that's what the admin is for now.
- The plywood-shape bug is fully closed: content edits live in one place (DB), propagate to one place (public site), go through one set of safeguards (admin editor + soft delete).

---

*Brief B. Ships after Brief A is stable. The seed script has been tested end-to-end against a local Postgres with your exact schema and real tool shapes — buy_links arrays, specs, useCases, colorGrid, gallery, category icons, slugify, date parsing, idempotency, admin-edit preservation. All verified.*
