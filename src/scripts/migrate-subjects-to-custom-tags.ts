import { db } from "../lib/db";
import { images } from "../lib/db/schema";
import { sql } from "drizzle-orm";

async function run() {
  const rows = await db.execute(sql`
    SELECT id, subjects, custom_tags FROM images WHERE array_length(subjects, 1) > 0
  `);

  console.log(`Found ${rows.rows.length} rows with subjects to migrate`);

  let updated = 0;
  for (const row of rows.rows as Array<{ id: string; subjects: string[]; custom_tags: string[] }>) {
    const merged = Array.from(new Set([...(row.custom_tags ?? []), ...(row.subjects ?? [])]));
    // Use Postgres array constructor to avoid malformed array literal
    const pgArray = `{${merged.map((s) => `"${s.replace(/"/g, '\\"')}"`).join(",")}}`;
    await db.execute(sql`
      UPDATE images
      SET custom_tags = ${pgArray}::text[], subjects = ARRAY[]::text[]
      WHERE id = ${row.id}
    `);
    updated++;
  }

  console.log(`Migrated ${updated} rows. Subjects column is now empty on all rows.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
