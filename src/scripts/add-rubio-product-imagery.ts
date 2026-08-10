/**
 * Puts real imagery on the Rubio tool cards.
 *
 * The Finishing category page renders an image per tool and every Rubio entry
 * had image = null, so the whole category was grey placeholder tiles. Jesper's
 * own library has no Rubio product photography in it (checked: 101 images, all
 * Festool / Latvia / own-product shots), so these come from Rubio's own store,
 * which is the brand's official product photography and the same imagery the
 * affiliate portal hands out on its product-link cards.
 *
 * Fetched from the public Shopify product JSON, downloaded once and re-hosted
 * locally rather than hotlinked, so the pages do not break if Rubio reorganises
 * their CDN and we are not spending their bandwidth.
 *
 * Swap any of these for Jesper's own shots later by replacing the file and
 * leaving the DB row alone.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { db } from "../lib/db";
import { images, toolItems } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const OUT_DIR = "/images/tools/rubio-monocoat";

/** tool slug -> Rubio store handle to take the lead product shot from */
const MAP: Array<{ slug: string; handle: string; description: string }> = [
  {
    slug: "rubio-monocoat-oil-plus-2c",
    handle: "oil-plus-2c-390ml",
    description: "Rubio Monocoat Oil Plus 2C, the 390 mL two-component set with Part A colour and Part B accelerator.",
  },
  {
    slug: "rubio-monocoat-durogrit",
    handle: "durogrit",
    description: "Rubio Monocoat DuroGrit, the single-component exterior hybrid oil for decks, siding and outdoor furniture.",
  },
  {
    slug: "rubio-monocoat-woodcream",
    handle: "woodcream",
    description: "Rubio Monocoat WoodCream, the water-based exterior cream for previously coated or weathered wood.",
  },
  {
    slug: "rubio-monocoat-care-kit",
    handle: "universal-maintenance-oil",
    description: "Rubio Monocoat Universal Maintenance Oil, used to refresh an existing Oil Plus 2C finish.",
  },
  {
    slug: "rubio-monocoat-matcha-green",
    handle: "oil-plus-2c-matcha-green-by-jesper-makes",
    description: "Oil Plus 2C in Matcha Green, the limited edition colour Rubio Monocoat developed with Jesper Makes.",
  },
];

/** Shopify serves a resized variant by injecting _<width>x before the extension. */
function atWidth(src: string, width: number): string {
  const [base, query] = src.split("?");
  const dot = base.lastIndexOf(".");
  return `${base.slice(0, dot)}_${width}x${base.slice(dot)}${query ? "?" + query : ""}`;
}

async function run() {
  await mkdir(join(process.cwd(), "public", OUT_DIR.replace(/^\//, "")), { recursive: true });

  for (const entry of MAP) {
    const tool = await db.select().from(toolItems).where(eq(toolItems.slug, entry.slug)).limit(1);
    if (tool.length === 0) {
      console.log(`${entry.slug}: no such tool, skipped`);
      continue;
    }
    if (tool[0].imageId) {
      console.log(`${entry.slug}: already has an image, skipped`);
      continue;
    }

    const res = await fetch(`https://www.rubiomonocoatusa.com/products/${entry.handle}.json`);
    if (!res.ok) {
      console.log(`${entry.slug}: product fetch failed (${res.status})`);
      continue;
    }
    const product = (await res.json()).product as {
      images: Array<{ src: string; width: number; height: number }>;
    };
    const lead = product.images?.[0];
    if (!lead) {
      console.log(`${entry.slug}: product has no images`);
      continue;
    }

    const url = atWidth(lead.src, 1200);
    const bin = await fetch(url);
    if (!bin.ok) {
      console.log(`${entry.slug}: image download failed (${bin.status})`);
      continue;
    }
    const buf = Buffer.from(await bin.arrayBuffer());
    const filename = `${entry.slug}.jpg`;
    const publicPath = `${OUT_DIR}/${filename}`;
    await writeFile(join(process.cwd(), "public", publicPath.replace(/^\//, "")), buf);

    const inserted = await db
      .insert(images)
      .values({
        source: "rubio-monocoat-usa-store",
        url: publicPath,
        pathname: publicPath,
        filename,
        width: Math.min(lead.width ?? 1200, 1200),
        height: lead.height ?? null,
        sizeBytes: buf.byteLength,
        mimeType: "image/jpeg",
        description: entry.description,
        sponsors: ["Rubio Monocoat"],
        toolCategories: ["finishing"],
        shotType: "product",
        customTags: ["rubio-monocoat", "brand-supplied"],
        reviewed: true,
      })
      .returning({ id: images.id });

    await db
      .update(toolItems)
      .set({ imageId: inserted[0].id, updatedAt: new Date() })
      .where(eq(toolItems.id, tool[0].id));

    console.log(`${entry.slug}: ${publicPath} (${Math.round(buf.byteLength / 1024)} KB)`);
  }

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
