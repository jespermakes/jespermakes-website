import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { blogPosts, toolItems, rubioProducts } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const BASE_URL = "https://jespermakes.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/rubio`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/support`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/work`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/barn`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/plywood`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sponsors`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/mediakit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    // Free interactive tools. These are the most linkable things on the site
    // and were missing from the sitemap entirely. /studio is deliberately left
    // out: its layout sets robots noindex, so submitting it would contradict
    // that. /studio/designs and /profile/* are login-gated or user-specific.
    {
      url: `${BASE_URL}/cone-lamp`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/box-joint-jig`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/lamp-designer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/title-lab`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/storyteller`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/marketplace`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/floor-rescue`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/press-kit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...["youtube", "instagram", "tiktok", "facebook", "in-the-rough"].map(
      (slug) => ({
        url: `${BASE_URL}/mediakit/${slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.3,
      }),
    ),
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/refund`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Shop product pages
  const shopPages: MetadataRoute.Sitemap = [
    "workshop-wall-charts",
    "cone-lamp-laser",
    "cone-lamp-3dprint",
    "workshop-tee",
    "pallet-starter-kit",
  ].map((slug) => ({
    url: `${BASE_URL}/shop/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Blog listing page
  const blogListingPage: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // DB-backed pages.
  // Must match what /blog/[slug] actually serves: that route 404s anything
  // whose status is not "published", so filtering on `hidden` alone put draft
  // posts in the sitemap and told Google to crawl a 404.
  const posts = await db
    .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
    .from(blogPosts)
    .where(and(eq(blogPosts.hidden, false), eq(blogPosts.status, "published")));

  const tools = await db
    .select({
      slug: toolItems.slug,
      updatedAt: toolItems.updatedAt,
      categorySlug: toolItems.categorySlug,
    })
    .from(toolItems)
    .where(eq(toolItems.hidden, false));

  const blogPostPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Tool category pages (deduplicate)
  const categorySlugs = Array.from(new Set(tools.map((t) => t.categorySlug)));
  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE_URL}/tools/category/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const toolPages: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${BASE_URL}/tools/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // The Rubio shop. Its product pages are the canonical home for the Rubio
  // range now that the /tools versions redirect here, so they need to be
  // discoverable or the redirects point at pages Google never crawls.
  let rubioRows: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    rubioRows = await db
      .select({ slug: rubioProducts.slug, updatedAt: rubioProducts.updatedAt })
      .from(rubioProducts)
      .where(eq(rubioProducts.hidden, false));
  } catch (err) {
    console.error("[sitemap] rubio products unavailable:", err);
  }

  const rubioPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/rubio/guide`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...rubioRows.map((r) => ({
      url: `${BASE_URL}/rubio/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  return [
    ...staticPages,
    ...shopPages,
    ...blogListingPage,
    ...blogPostPages,
    ...categoryPages,
    ...toolPages,
    ...rubioPages,
  ];
}
