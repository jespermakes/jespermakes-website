import { db } from "../lib/db";
import { sql } from "drizzle-orm";

type Link = { label?: string; url?: string; region?: string; badge?: string };

async function run() {
  const rows = await db.execute(sql`
    SELECT slug, name, buy_links, extra FROM tool_items ORDER BY slug
  `);

  let degraded = 0;
  let recoverable = 0;
  let untrackedRubioUs = 0;

  for (const r of rows.rows as Array<{
    slug: string;
    name: string;
    buy_links: unknown;
    extra: { originalBuyLinks?: Link[] } | null;
  }>) {
    const links = Array.isArray(r.buy_links) ? (r.buy_links as Link[]) : [];
    if (links.length === 0) continue;

    const originals = r.extra?.originalBuyLinks ?? [];
    const lost = links.filter((l) => !l.region && !l.badge);
    const hasOriginals = originals.length > 0;

    if (lost.length > 0) {
      degraded++;
      if (hasOriginals) recoverable++;
      console.log(
        `${r.slug}: ${lost.length}/${links.length} link(s) missing region+badge` +
          (hasOriginals ? `  [recoverable from extra.originalBuyLinks]` : `  [NO originals]`),
      );
      for (const l of links) {
        const match = originals.find((o) => o.url === l.url);
        console.log(
          `    label=${JSON.stringify(l.label)}` +
            (match ? `  ->  ${JSON.stringify(match.label)} region=${match.region} badge=${match.badge}` : `  ->  (no match)`),
        );
      }
    }

    for (const l of links) {
      if (l.url?.includes("rubiomonocoatusa.com") && !l.url.includes("bg_ref=")) {
        untrackedRubioUs++;
        console.log(`  !! untracked Rubio US on ${r.slug}: ${l.url}`);
      }
    }
  }

  console.log(
    `\nTotals: ${rows.rows.length} tools, ${degraded} with degraded links, ${recoverable} recoverable from extra, ${untrackedRubioUs} untracked Rubio US links.`,
  );
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
