import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function run() {
  const rows = await db.execute(sql`
    SELECT id, slug, buy_links FROM tool_items
    WHERE jsonb_typeof(buy_links) = 'object'
  `);

  console.log(`Found ${rows.rows.length} rows with object-shaped buy_links to convert`);

  let converted = 0;
  for (const row of rows.rows as Array<{ id: string; slug: string; buy_links: Record<string, string> | object }>) {
    const obj = row.buy_links as Record<string, string>;
    const asArray = Object.entries(obj)
      .filter(([k, v]) => typeof v === "string" && v.length > 0 && k.length > 0)
      .map(([label, url]) => ({ label, url }));

    await db.execute(sql`
      UPDATE tool_items SET buy_links = ${JSON.stringify(asArray)}::jsonb WHERE id = ${row.id}
    `);
    console.log(`  ${row.slug}: ${asArray.length} link(s) converted`);
    converted++;
  }

  console.log(`\nDone. Converted ${converted} rows.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
