import { db } from "../lib/db";
import { images } from "../lib/db/schema";
import { eq, isNull, or, and } from "drizzle-orm";
import imageSize from "image-size";
import fs from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

async function getImageBytes(url: string): Promise<Buffer> {
  if (url.startsWith("/images/")) {
    const filePath = path.join(PUBLIC_DIR, url.slice(1));
    if (!fs.existsSync(filePath)) {
      throw new Error(`Local file not found: ${filePath}`);
    }
    return fs.readFileSync(filePath);
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
  }

  throw new Error(`Unknown URL shape: ${url}`);
}

async function run() {
  console.log("=== Backfilling image dimensions ===\n");

  const rows = await db
    .select({ id: images.id, url: images.url, filename: images.filename })
    .from(images)
    .where(and(eq(images.hidden, false), or(isNull(images.width), isNull(images.height))));

  console.log(`Found ${rows.length} images needing backfill\n`);

  if (rows.length === 0) {
    console.log("Nothing to do.");
    process.exit(0);
  }

  let ok = 0, errors = 0, noDims = 0;
  const errorList: { url: string; error: string }[] = [];

  for (const image of rows) {
    try {
      const bytes = await getImageBytes(image.url);
      const size = imageSize(bytes);

      if (!size?.width || !size?.height) {
        console.log(`  ? ${image.url.padEnd(60)} no dims`);
        noDims++;
        continue;
      }

      await db
        .update(images)
        .set({ width: size.width, height: size.height })
        .where(eq(images.id, image.id));

      console.log(`  ✓ ${image.url.padEnd(60)} ${size.width}×${size.height}`);
      ok++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`  ✗ ${image.url.padEnd(60)} ${msg}`);
      errorList.push({ url: image.url, error: msg });
      errors++;
    }
  }

  console.log(`\nResult: ${ok} ok, ${errors} errors, ${noDims} no dims`);

  if (errorList.length > 0) {
    console.log("\nErrors:");
    for (const e of errorList) console.log(`  ${e.url}\n    → ${e.error}`);
  }

  const allActive = await db.select({ id: images.id, width: images.width, height: images.height }).from(images).where(eq(images.hidden, false));
  const withDims = allActive.filter((r) => r.width !== null && r.height !== null).length;
  console.log(`\nFinal: ${withDims} / ${allActive.length} active images have dimensions`);

  process.exit(errors > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error("Backfill failed:", e);
  process.exit(1);
});
