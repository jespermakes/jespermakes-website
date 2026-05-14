/**
 * One-shot migration applier for drizzle/0013_ambitious_pixie.sql.
 *
 * Creates the lamp_designs table and its foreign key constraint.
 * Follows the same pattern as apply-migration-0012.ts — runs each
 * statement from the generated migration file individually.
 *
 * Safe to re-run: "already exists" / "duplicate" errors are treated
 * as skips rather than failures.
 *
 *   POSTGRES_URL=... npx tsx scripts/apply-migration-lamp-designs.ts
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sql } from "@vercel/postgres";

async function main() {
  const path = resolve(process.cwd(), "drizzle/0013_ambitious_pixie.sql");
  const raw = readFileSync(path, "utf8");
  const statements = raw
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(
    `Applying ${statements.length} statements from 0013_ambitious_pixie.sql`,
  );

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const oneLiner = stmt.replace(/\s+/g, " ").slice(0, 100);
    try {
      await sql.query(stmt);
      console.log(`  [${i + 1}/${statements.length}] OK  ${oneLiner}...`);
      ok += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        /already exists/i.test(msg) ||
        /duplicate column/i.test(msg) ||
        /duplicate object/i.test(msg)
      ) {
        console.log(
          `  [${i + 1}/${statements.length}] SKIP (already applied) ${oneLiner}...`,
        );
        skipped += 1;
      } else {
        console.error(
          `  [${i + 1}/${statements.length}] FAIL ${oneLiner}...\n      ${msg}`,
        );
        failed += 1;
      }
    }
  }

  console.log(`\nDone. ok=${ok} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Migration runner crashed:", err);
  process.exit(1);
});
