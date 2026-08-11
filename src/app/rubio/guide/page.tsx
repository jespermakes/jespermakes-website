import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { rubioProducts } from "@/lib/db/schema";
import { resolveRegion } from "@/lib/rubio-region-server";
import { productUrl, formatPrice, type RegionKey } from "@/lib/rubio-shop";
import { GUIDE_PRODUCT_TO_SLUG } from "@/data/rubio-shop-catalogue";
import type { RubioPrice } from "@/lib/db/schema";
import RubioGuideClient, { type GuideBuyTarget } from "./guide-client";

export const revalidate = 300;

/**
 * Server shell for the guide.
 *
 * The wizard itself is client-side (it is four steps of local state), but the
 * thing it now ends on is a real tracked buy button, and that needs the
 * visitor's region resolved on the server from the Vercel geo header. So the
 * region and the three possible outcomes are resolved here and handed down,
 * rather than the client guessing.
 */
export default async function RubioGuidePage() {
  const { region } = resolveRegion();

  const slugs = Object.values(GUIDE_PRODUCT_TO_SLUG);
  const rows = await db.select().from(rubioProducts).where(inArray(rubioProducts.slug, slugs));

  const buyTargets: Record<string, GuideBuyTarget> = {};
  for (const [guideKey, slug] of Object.entries(GUIDE_PRODUCT_TO_SLUG)) {
    const product = rows.find((r) => r.slug === slug);
    if (!product) continue;
    const href = productUrl(region, { usHandle: product.usHandle, euHandle: product.euHandle });
    if (!href) continue;
    const prices = (product.prices ?? {}) as Record<string, RubioPrice>;
    const price = prices[region.key as RegionKey] ?? null;
    buyTargets[guideKey] = {
      href,
      title: product.title,
      productPath: `/rubio/${product.slug}`,
      priceLabel: price ? formatPrice(price.amount, price.currency) : null,
      storeLabel: region.label,
    };
  }

  return <RubioGuideClient buyTargets={buyTargets} />;
}
