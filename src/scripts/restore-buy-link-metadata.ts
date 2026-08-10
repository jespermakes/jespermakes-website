/**
 * Repairs the damage from convert-buy-links-to-array.ts.
 *
 * That migration turned `{ "rubio-monocoat-eu": "https://..." }` into
 * `{ label: "rubio-monocoat-eu", url: "https://..." }`, which dropped `region`
 * and `badge` and left the object key standing in as the display label. The
 * tool page renders `link.label` verbatim, so 34 of 73 tools have been showing
 * slugs like "xtool-eu" with no country flag and no affiliate badge.
 *
 * The pre-migration shape survived in `extra.originalBuyLinks`, so the labels,
 * regions and badges are all recoverable by matching on url.
 *
 * Second pass: the Rubio USA links have never carried a tracking ref. The US
 * program moved from Impact.com to BixGrow, where the ref is a single static
 * query param (see DR-198), so every rubiomonocoatusa.com link gets
 * ?bg_ref=<code> and an "Affiliate" badge to match the EU links.
 *
 * Idempotent. Safe to re-run.
 */
import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import type { BuyLink } from "../lib/db/schema";

const RUBIO_US_HOST = "rubiomonocoatusa.com";
const RUBIO_US_REF_PARAM = "bg_ref";
const RUBIO_US_REF = process.env.RUBIO_US_AFFILIATE_REF ?? "IAoDdNh25F";

function withRubioRef(url: string): string {
  if (!url.includes(RUBIO_US_HOST)) return url;
  const parsed = new URL(url);
  if (parsed.searchParams.get(RUBIO_US_REF_PARAM) === RUBIO_US_REF) return url;
  parsed.searchParams.set(RUBIO_US_REF_PARAM, RUBIO_US_REF);
  return parsed.toString();
}

async function run() {
  const rows = await db.execute(sql`
    SELECT id, slug, buy_links, extra FROM tool_items ORDER BY slug
  `);

  let repaired = 0;
  let tracked = 0;

  for (const row of rows.rows as Array<{
    id: string;
    slug: string;
    buy_links: unknown;
    extra: { originalBuyLinks?: BuyLink[] } | null;
  }>) {
    const links = Array.isArray(row.buy_links) ? (row.buy_links as BuyLink[]) : [];
    if (links.length === 0) continue;

    const originals = row.extra?.originalBuyLinks ?? [];
    let changed = false;
    let addedRef = false;

    const next = links.map((link) => {
      // Restore first, while the url still matches the pre-migration record.
      const original = originals.find((o) => o.url === link.url);
      let out: BuyLink = { ...link };

      if (original) {
        if (original.label && original.label !== out.label) {
          out.label = original.label;
          changed = true;
        }
        if (original.region && original.region !== out.region) {
          out.region = original.region;
          changed = true;
        }
        if (original.badge && original.badge !== out.badge) {
          out.badge = original.badge;
          changed = true;
        }
      }

      // Then add tracking, which rewrites the url.
      const trackedUrl = withRubioRef(out.url);
      if (trackedUrl !== out.url) {
        out = { ...out, url: trackedUrl, badge: out.badge ?? "Affiliate" };
        changed = true;
        addedRef = true;
      }

      return out;
    });

    if (!changed) continue;

    await db.execute(sql`
      UPDATE tool_items
      SET buy_links = ${JSON.stringify(next)}::jsonb, updated_at = NOW()
      WHERE id = ${row.id}
    `);

    repaired++;
    if (addedRef) tracked++;
    console.log(`${row.slug}:`);
    for (const l of next) {
      console.log(`    ${l.label}  [${l.region ?? "no region"}${l.badge ? ", " + l.badge : ""}]  ${l.url}`);
    }
  }

  console.log(`\nDone. ${repaired} tools updated, ${tracked} of them gained a Rubio US tracking ref.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
