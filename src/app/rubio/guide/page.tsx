import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { rubioProducts } from "@/lib/db/schema";
import { resolveRegion } from "@/lib/rubio-region-server";
import { productUrl } from "@/lib/rubio-shop";
import { GUIDE_PRODUCT_TO_SLUG } from "@/data/rubio-shop-catalogue";
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
    // No price passed. The guide names a specific tin size, and the only
    // figure available is the cheapest variant, which is a 6 mL sample.
    buyTargets[guideKey] = {
      href,
      title: product.title,
      productPath: `/rubio/${product.slug}`,
      storeLabel: region.label,
    };
  }

  return <RubioGuideClient buyTargets={buyTargets} />;
}
