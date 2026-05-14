/**
 * One-shot migration applier for drizzle/0012_gifted_spyke.sql.
 *
 * The project manages its schema with `drizzle-kit push` (no migrations
 * table), and the kit's TTY prompt for new tables fights non-interactive
 * shells. This script just runs each statement in the generated 0012
 * migration file.
 *
 * Safe to re-run: each CREATE TABLE / ADD COLUMN / etc. is wrapped with
 * IF NOT EXISTS; failed statements log and continue rather than abort.
 *
 *   POSTGRES_URL=… npx tsx scripts/apply-migration-0012.ts
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sql } from "@vercel/postgres";

async function main() {
  const path = resolve(process.cwd(), "drizzle/0012_gifted_spyke.sql");
  const raw = readFileSync(path, "utf8");
  // The drizzle generator separates statements with `--> statement-breakpoint`.
  const statements = raw
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Applying ${statements.length} statements from 0012_gifted_spyke.sql`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const oneLiner = stmt.replace(/\s+/g, " ").slice(0, 100);
    try {
      // sql.query lets us pass a literal SQL string with no parameters.
      await sql.query(stmt);
      console.log(`  [${i + 1}/${statements.length}] OK  ${oneLiner}…`);
      ok += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Idempotent re-runs: ignore "already exists" / "duplicate" errors.
      if (
        /already exists/i.test(msg) ||
        /duplicate column/i.test(msg) ||
        /duplicate object/i.test(msg)
      ) {
        console.log(
          `  [${i + 1}/${statements.length}] SKIP (already applied) ${oneLiner}…`,
        );
        skipped += 1;
      } else {
        console.error(
          `  [${i + 1}/${statements.length}] FAIL ${oneLiner}…\n      ${msg}`,
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
