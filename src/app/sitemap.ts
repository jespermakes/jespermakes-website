import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { blogPosts, toolItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

  // DB-backed pages
  const posts = await db
    .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
    .from(blogPosts)
    .where(eq(blogPosts.hidden, false));

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

  return [
    ...staticPages,
    ...shopPages,
    ...blogListingPage,
    ...blogPostPages,
    ...categoryPages,
    ...toolPages,
  ];
}
