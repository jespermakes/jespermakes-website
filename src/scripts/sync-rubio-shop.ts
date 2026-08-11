/**
 * Seeds and refreshes the Rubio shop from the stores' own public product feeds.
 *
 * Runs against all seven storefronts (one US, six European country domains for
 * what is really one Shopify store). Everything is public JSON, no auth, no
 * affiliate API involved. Prices, availability and lead images come from here.
 *
 * Safety rules baked in:
 *  - A region that fails to fetch leaves the previously known price alone
 *    rather than blanking it. A stale price beats a disappeared one, and the
 *    UI always links out to the live page anyway.
 *  - Prices are the MINIMUM variant price, because these products have many
 *    size and colour variants. The UI must render them as "from".
 *  - A zero price means the feed is not exposing a real one, so it is dropped
 *    rather than shown as free.
 *
 * A HANDLE MISSING FROM A FEED DOES NOT MEAN THE PRODUCT IS UNBUYABLE THERE.
 * Checked directly: /products/colour-fan is absent from both the .de and .dk
 * feeds and still returns 200 on both domains. The country feeds are just
 * published inconsistently. So syncError below records "we have no price for
 * this region", nothing more, and the UI must still render the buy button off
 * the handle. Availability is decided ONLY by a null handle in the catalogue,
 * which today means Matcha Green outside the US.
 *
 * Idempotent. Safe to run on a schedule.
 */
import { db } from "../lib/db";
import { rubioProducts } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import { CATALOGUE } from "../data/rubio-shop-catalogue";
import { REGIONS, type RegionKey } from "../lib/rubio-shop";

type Feed = Map<string, { price: number; currency: string; available: boolean; image: string | null }>;

async function loadFeed(host: string): Promise<Feed | null> {
  const out: Feed = new Map();
  try {
    const res = await fetch(`https://${host}/products.json?limit=250`, {
      headers: { "user-agent": "jespermakes.com shop sync" },
    });
    if (!res.ok) {
      console.log(`  ! ${host} responded ${res.status}`);
      return null;
    }
    const json = (await res.json()) as {
      products: Array<{
        handle: string;
        images?: Array<{ src: string }>;
        variants: Array<{ price: string; available?: boolean }>;
      }>;
    };
    for (const p of json.products) {
      const prices = p.variants.map((v) => parseFloat(v.price)).filter((n) => Number.isFinite(n) && n > 0);
      if (prices.length === 0) continue;
      out.set(p.handle, {
        price: Math.min(...prices),
        currency: "",
        available: p.variants.some((v) => v.available !== false),
        image: p.images?.[0]?.src ?? null,
      });
    }
    return out;
  } catch (e) {
    console.log(`  ! ${host} threw ${String(e).slice(0, 80)}`);
    return null;
  }
}

async function run() {
  console.log("Loading feeds...");
  const feeds = new Map<RegionKey, Feed | null>();
  for (const key of Object.keys(REGIONS) as RegionKey[]) {
    const region = REGIONS[key];
    const feed = await loadFeed(region.host);
    feeds.set(key, feed);
    console.log(`  ${feed ? String(feed.size).padStart(3) : "  -"} products  ${region.host}`);
  }

  let created = 0;
  let updated = 0;

  for (const entry of CATALOGUE) {
    const existing = await db.select().from(rubioProducts).where(eq(rubioProducts.slug, entry.slug)).limit(1);
    const previous = existing[0];
    const prices: Record<string, { amount: string; currency: string; available: boolean }> =
      previous?.prices && typeof previous.prices === "object"
        ? { ...(previous.prices as Record<string, { amount: string; currency: string; available: boolean }>) }
        : {};

    let image: string | null = previous?.image ?? null;
    const missing: string[] = [];

    for (const key of Object.keys(REGIONS) as RegionKey[]) {
      const region = REGIONS[key];
      const handle = region.program === "us" ? entry.usHandle : entry.euHandle;
      if (!handle) continue;

      const feed = feeds.get(key);
      if (!feed) continue; // fetch failed, keep whatever we had

      const row = feed.get(handle);
      if (!row) {
        missing.push(`${key}:${handle}`);
        delete prices[key];
        continue;
      }

      prices[key] = {
        amount: row.price.toFixed(2),
        currency: region.currency,
        available: row.available,
      };
      // Prefer the US lead shot for imagery, it is the more consistent set.
      if (!image || key === "us") image = row.image ?? image;
    }

    const values = {
      slug: entry.slug,
      title: entry.title,
      blurb: entry.blurb,
      longDescription: entry.longDescription ?? null,
      jesperNote: entry.jesperNote ?? null,
      category: entry.category,
      sortOrder: entry.sortOrder,
      featured: entry.featured ?? false,
      hidden: false,
      usHandle: entry.usHandle,
      euHandle: entry.euHandle,
      image,
      videoEmbedUrl: entry.videoEmbedUrl ?? null,
      prices,
      lastSyncedAt: new Date(),
      syncError: missing.length > 0 ? `handle not found in feed: ${missing.join(", ")}` : null,
      updatedAt: new Date(),
    };

    if (previous) {
      await db.update(rubioProducts).set(values).where(eq(rubioProducts.id, previous.id));
      updated++;
    } else {
      await db.insert(rubioProducts).values(values);
      created++;
    }

    const priced = Object.keys(prices).length;
    const flag = missing.length > 0 ? `  !! ${missing.join(", ")}` : "";
    console.log(`  ${entry.slug.padEnd(28)} ${String(priced).padStart(2)} regions priced${flag}`);
  }

  console.log(`\nDone. ${created} created, ${updated} updated.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
