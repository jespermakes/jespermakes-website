import "server-only";
import { db } from "@/lib/db";
import { pageSections, blogPosts, images } from "@/lib/db/schema";
import { eq, and, asc, inArray, desc } from "drizzle-orm";
import type { PageSection, ModuleData, ModuleKind } from "./types";
import { isValidKind } from "./types";

export async function getHomepageSections(): Promise<PageSection[]> {
  const rows = await db
    .select()
    .from(pageSections)
    .where(and(eq(pageSections.pageSlug, "home"), eq(pageSections.hidden, false)))
    .orderBy(asc(pageSections.position));

  return rows
    .filter((r) => isValidKind(r.kind))
    .map((r) => ({
      id: r.id,
      pageSlug: r.pageSlug,
      position: r.position,
      kind: r.kind as ModuleKind,
      visible: r.visible,
      hidden: r.hidden,
      data: r.data as ModuleData,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
}

export async function getImageById(id?: string) {
  if (!id) return null;
  const row = await db
    .select()
    .from(images)
    .where(and(eq(images.id, id), eq(images.hidden, false)))
    .limit(1);
  return row[0] ?? null;
}

export async function getBlogPostsForFeed(mode: "auto" | "manual", count?: number, ids?: string[]) {
  if (mode === "manual" && ids?.length) {
    const rows = await db
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        description: blogPosts.description,
        publishedAt: blogPosts.publishedAt,
        heroImageId: blogPosts.heroImageId,
        image: images,
      })
      .from(blogPosts)
      .leftJoin(images, eq(images.id, blogPosts.heroImageId))
      .where(and(eq(blogPosts.hidden, false), inArray(blogPosts.id, ids)));
    const order = new Map(ids.map((id, i) => [id, i]));
    return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }
  return await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      description: blogPosts.description,
      publishedAt: blogPosts.publishedAt,
      heroImageId: blogPosts.heroImageId,
      image: images,
    })
    .from(blogPosts)
    .leftJoin(images, eq(images.id, blogPosts.heroImageId))
    .where(eq(blogPosts.hidden, false))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(count ?? 3);
}

export interface ShopProduct {
  slug: string;
  title: string;
  subtitle: string;
  price: string;
  image: string;
  comingSoon?: boolean;
}

const SHOP_PRODUCTS: ShopProduct[] = [
  {
    slug: "workshop-wall-charts",
    title: "Jesper\u2019s Cheat Sheets",
    subtitle: "8 printable reference sheets for your workshop wall",
    price: "\u20AC3",
    image: "/images/products/cheat-sheets-hero.jpg",
  },
  {
    slug: "cone-lamp-laser",
    title: "Cone Lamp Laser File",
    subtitle: "SVG laser cut file \u2014 all parts included",
    price: "\u20AC5",
    image: "/images/products/cone-lamp-laser-1.jpg",
  },
  {
    slug: "cone-lamp-3dprint",
    title: "Cone Lamp 3D Print Files",
    subtitle: "STL files + PDF instruction guide",
    price: "\u20AC5",
    image: "/images/cone-lamp-3dprint/hero-firewood.jpg",
  },
  {
    slug: "workshop-tee",
    title: "Jesper Makes Workshop Tee",
    subtitle: "Unisex black tee \u2014 printed & shipped worldwide",
    price: "\u20AC35",
    image: "/images/products/tshirt-mockup-front.jpg",
  },
  {
    slug: "pallet-starter-kit",
    title: "The Pallet Builder\u2019s Starter Kit",
    subtitle: "5 build guides + tool recommendations",
    price: "",
    image: "",
    comingSoon: true,
  },
];

export function getShopProductsForFeed(
  mode: "auto" | "manual",
  count?: number,
  ids?: string[]
): ShopProduct[] {
  const available = SHOP_PRODUCTS.filter((p) => !p.comingSoon);
  if (mode === "manual" && ids?.length) {
    const order = new Map(ids.map((id, i) => [id, i]));
    return available
      .filter((p) => ids.includes(p.slug))
      .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
  }
  return available.slice(0, count ?? 3);
}

export async function getYoutubeVideosForFeed(
  mode: "auto" | "manual",
  count?: number,
  ids?: string[]
): Promise<Array<{ id: string; title: string; thumbnail: string; duration?: string; publishedAt?: string; viewCount?: string }>> {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!key) return [];

  try {
    if (mode === "manual" && ids?.length) {
      const url =
        "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics" +
        `&id=${ids.join(",")}&key=${key}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const j = await res.json();
      return (j.items ?? []).map(mapYtItem);
    }
    if (!channelId) return [];
    const chUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${key}`;
    const chRes = await fetch(chUrl, { next: { revalidate: 3600 } });
    if (!chRes.ok) return [];
    const chJ = await chRes.json();
    const uploadsId = chJ.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) return [];
    const plUrl =
      "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails" +
      `&playlistId=${uploadsId}&maxResults=${count ?? 3}&key=${key}`;
    const plRes = await fetch(plUrl, { next: { revalidate: 3600 } });
    if (!plRes.ok) return [];
    const plJ = await plRes.json();
    const videoIds = (plJ.items ?? []).map((i: { contentDetails?: { videoId?: string } }) => i.contentDetails?.videoId).filter(Boolean);
    if (!videoIds.length) return [];
    const vUrl =
      "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics" +
      `&id=${videoIds.join(",")}&key=${key}`;
    const vRes = await fetch(vUrl, { next: { revalidate: 3600 } });
    if (!vRes.ok) return [];
    const vJ = await vRes.json();
    return (vJ.items ?? []).map(mapYtItem);
  } catch {
    return [];
  }
}

function mapYtItem(item: {
  id: string;
  snippet?: { title?: string; thumbnails?: { high?: { url?: string }; medium?: { url?: string } }; publishedAt?: string };
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string };
}) {
  const thumb =
    item.snippet?.thumbnails?.high?.url ||
    item.snippet?.thumbnails?.medium?.url ||
    `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
  return {
    id: item.id,
    title: item.snippet?.title ?? "",
    thumbnail: thumb,
    duration: formatIsoDuration(item.contentDetails?.duration),
    publishedAt: item.snippet?.publishedAt,
    viewCount: item.statistics?.viewCount,
  };
}

function formatIsoDuration(iso?: string): string | undefined {
  if (!iso) return undefined;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return undefined;
  const h = parseInt(m[1] ?? "0", 10);
  const mi = parseInt(m[2] ?? "0", 10);
  const s = parseInt(m[3] ?? "0", 10);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(mi)}:${pad(s)}` : `${mi}:${pad(s)}`;
}

export async function getSubscriberCount(): Promise<number> {
  try {
    const result = await db.execute(
      `SELECT COUNT(*)::int AS c FROM newsletter_subscribers WHERE subscribed = true` as never
    );
    const rows = (result as unknown as { rows?: Array<{ c: number }> }).rows;
    return rows?.[0]?.c ?? 0;
  } catch {
    return 0;
  }
}
