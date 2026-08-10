/**
 * Moves authored tool content out of `extra` and into the real columns.
 *
 * The tool page renders tool.colorGrid, tool.gallery, tool.youtubeVideos,
 * tool.useCases, tool.specs, tool.productList and tool.longDescription. A
 * seed/migration left a chunk of that content parked in the `extra` jsonb blob
 * instead, where nothing reads it. Net effect: 12 tools render as a bare title
 * and one paragraph while the good material sits one column over, invisible.
 *
 * Worst case is Oil Plus 2C, which has a 40-swatch colour grid written out and
 * showing nowhere, and DuroGrit with 16.
 *
 * Gallery paths are checked against public/ before restoring, so a stale path
 * is skipped rather than shipped as a broken image.
 *
 * Idempotent: only fills a column that is currently empty.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { db } from "../lib/db";
import { toolItems } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const ARRAY_FIELDS = [
  "colorGrid",
  "gallery",
  "youtubeVideos",
  "useCases",
  "specs",
  "productList",
] as const;

const PUBLIC_DIR = join(process.cwd(), "public");

function galleryPathsThatExist(paths: unknown): string[] {
  if (!Array.isArray(paths)) return [];
  const kept: string[] = [];
  for (const p of paths) {
    if (typeof p !== "string") continue;
    if (p.startsWith("http")) {
      kept.push(p);
      continue;
    }
    if (existsSync(join(PUBLIC_DIR, p))) {
      kept.push(p);
    } else {
      console.log(`    skipped missing file: ${p}`);
    }
  }
  return kept;
}

async function run() {
  const rows = await db.select().from(toolItems);
  let touched = 0;

  for (const tool of rows) {
    const extra = (tool.extra ?? {}) as Record<string, unknown>;
    if (Object.keys(extra).length === 0) continue;

    const patch: Record<string, unknown> = {};
    const notes: string[] = [];

    for (const field of ARRAY_FIELDS) {
      const fromExtra = extra[field];
      const current = (tool as unknown as Record<string, unknown>)[field];
      const currentLen = Array.isArray(current) ? current.length : 0;
      if (currentLen > 0 || !Array.isArray(fromExtra) || fromExtra.length === 0) continue;

      const value = field === "gallery" ? galleryPathsThatExist(fromExtra) : fromExtra;
      if ((value as unknown[]).length === 0) continue;

      patch[field] = value;
      notes.push(`${field}(${(value as unknown[]).length})`);
    }

    if (typeof extra.longDescription === "string" && extra.longDescription.trim() && !tool.longDescription) {
      patch.longDescription = extra.longDescription;
      notes.push(`longDescription(${extra.longDescription.length} chars)`);
    }

    if (Object.keys(patch).length === 0) continue;

    patch.updatedAt = new Date();
    await db
      .update(toolItems)
      .set(patch as typeof toolItems.$inferInsert)
      .where(eq(toolItems.id, tool.id));

    touched++;
    console.log(`${tool.slug}: restored ${notes.join(", ")}`);
  }

  console.log(`\nDone. ${touched} tools had content restored from extra.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
