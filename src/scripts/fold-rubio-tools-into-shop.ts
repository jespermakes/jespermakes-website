/**
 * Folds the old /tools Rubio pages into the shop.
 *
 * Until now there were two pages per Rubio product: the /tools entry and the
 * newer /rubio shop page. Same products, split search authority, double
 * maintenance, and two Matcha Green pages. Worse than untidy, the /tools
 * versions carry hardcoded single-region links, so a German visitor landing on
 * /tools/rubio-monocoat-oil-plus-2c got sent to the UK store in pounds while
 * the shop would have sent them to .de in euros.
 *
 * Jesper's call (11 Aug 2026): redirect them into the shop.
 *
 * This script only moves the content that would otherwise be lost, then hides
 * the tool entries so they drop out of /tools listings and the sitemap. The
 * 301s themselves live in next.config.mjs, so the URLs keep their value.
 *
 * Idempotent.
 */
import { db } from "../lib/db";
import { toolItems, rubioProducts } from "../lib/db/schema";
import { eq } from "drizzle-orm";

/** old tool slug -> shop slug to inherit its colour grid, or null if nothing to carry. */
const PORT_COLOURS: Record<string, string | null> = {
  "rubio-monocoat-oil-plus-2c": "oil-plus-2c",
  "rubio-monocoat-durogrit": "durogrit",
  "rubio-monocoat-woodcream": "woodcream",
  "rubio-monocoat-matcha-green": "matcha-green",
  "rubio-monocoat-care-kit": null, // a kit, not a single product; redirects to the shop index
};

async function run() {
  for (const [toolSlug, shopSlug] of Object.entries(PORT_COLOURS)) {
    const toolRows = await db.select().from(toolItems).where(eq(toolItems.slug, toolSlug)).limit(1);
    const tool = toolRows[0];
    if (!tool) {
      console.log(`  ${toolSlug}: no such tool, skipped`);
      continue;
    }

    if (shopSlug) {
      const shopRows = await db.select().from(rubioProducts).where(eq(rubioProducts.slug, shopSlug)).limit(1);
      const shop = shopRows[0];
      if (!shop) {
        console.log(`  ${toolSlug}: no shop product "${shopSlug}", NOT hiding this one`);
        continue;
      }

      const colours = Array.isArray(tool.colorGrid) ? tool.colorGrid : [];
      const already = Array.isArray(shop.colorGrid) ? shop.colorGrid.length : 0;

      if (colours.length > 0 && already === 0) {
        await db
          .update(rubioProducts)
          .set({ colorGrid: colours, updatedAt: new Date() })
          .where(eq(rubioProducts.id, shop.id));
        console.log(`  ${toolSlug} -> ${shopSlug}: ported ${colours.length} swatches`);
      } else {
        console.log(`  ${toolSlug} -> ${shopSlug}: ${colours.length} swatches, ${already} already on shop, nothing to port`);
      }
    }

    if (!tool.hidden) {
      await db.update(toolItems).set({ hidden: true, updatedAt: new Date() }).where(eq(toolItems.id, tool.id));
      console.log(`     hid /tools/${toolSlug}`);
    }
  }

  const remaining = await db.select().from(toolItems).where(eq(toolItems.categorySlug, "finishing"));
  const visible = remaining.filter((t) => !t.hidden);
  console.log(`\nFinishing category now has ${visible.length} visible tool(s).`);
  if (visible.length > 0) {
    console.log("  Still visible:", visible.map((t) => t.slug).join(", "));
    console.log("  The category redirect would strand these. Check before shipping.");
  }
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
