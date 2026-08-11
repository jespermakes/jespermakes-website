/**
 * Adds the Rubio band to the homepage, right after the barn and before the
 * plan shelf, so the two commercial blocks sit together and the barn keeps its
 * place near the top.
 *
 * Idempotent: bails out if a rubio section already exists.
 */
import { db } from "../lib/db";
import { pageSections } from "../lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

const AFTER_KIND = "barn";

async function run() {
  const existing = await db
    .select()
    .from(pageSections)
    .where(and(eq(pageSections.pageSlug, "home"), eq(pageSections.kind, "rubio")));

  if (existing.length > 0) {
    console.log("Rubio section already on the homepage, nothing to do.");
    process.exit(0);
  }

  const all = await db.select().from(pageSections).where(eq(pageSections.pageSlug, "home"));
  const barn = all.find((s) => s.kind === AFTER_KIND);
  const position = barn ? barn.position + 1 : all.length;

  // Make room.
  await db
    .update(pageSections)
    .set({ position: sql`${pageSections.position} + 1` })
    .where(and(eq(pageSections.pageSlug, "home"), gte(pageSections.position, position)));

  await db.insert(pageSections).values({
    pageSlug: "home",
    position,
    kind: "rubio",
    visible: true,
    hidden: false,
    data: {
      caps: "Rubio Monocoat · Ambassador",
      title: "They let me make a colour.",
      body:
        "Matcha Green is a limited edition Oil Plus 2C that Rubio Monocoat and I made together. Green for growth, for nature, for the reason I started making things at all. There is not much of it, and when it is gone it is gone.",
      videoEmbedUrl: "https://www.instagram.com/p/DRFFW_iCNzz/embed",
      ctaLabel: "See the colour",
      ctaUrl: "/rubio/matcha-green",
      secondaryLabel: "Everything else I use from Rubio",
      secondaryUrl: "/rubio",
    },
  });

  const after = await db.select().from(pageSections).where(eq(pageSections.pageSlug, "home"));
  for (const s of after.sort((a, b) => a.position - b.position)) {
    console.log(`  ${String(s.position).padStart(2)}  ${s.kind}${s.visible ? "" : "  (hidden)"}`);
  }
  console.log(`\nInserted rubio section at position ${position}.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
