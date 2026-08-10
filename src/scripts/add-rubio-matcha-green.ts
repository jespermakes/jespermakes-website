/**
 * Adds the Matcha Green tool entry.
 *
 * Rubio Monocoat sell a limited edition Oil Plus 2C colour called "Matcha
 * Green" that they developed with Jesper. Their own product page calls it "a
 * limited edition creator color of Oil Plus 2C developed in tandem with Jesper
 * Makes". It is the single strongest thing in the whole Rubio relationship and
 * it was not on jespermakes.com at all.
 *
 * Copy here stays close to what is already published on Rubio's product page,
 * because that text was written with Jesper and the story in it is his. Nothing
 * is invented.
 */
import { db } from "../lib/db";
import { toolItems } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const SLUG = "rubio-monocoat-matcha-green";
const REF = "IAoDdNh25F";

async function run() {
  const existing = await db.select().from(toolItems).where(eq(toolItems.slug, SLUG)).limit(1);
  if (existing.length > 0) {
    console.log(`${SLUG} already exists, nothing to do.`);
    process.exit(0);
  }

  const [created] = await db
    .insert(toolItems)
    .values({
      slug: SLUG,
      name: 'Oil Plus 2C "Matcha Green"',
      category: "Finishing",
      categorySlug: "finishing",
      description:
        "My own colour. Rubio Monocoat and I made a limited edition Oil Plus 2C in Matcha Green, 390 mL only, and once it is gone it is gone.",
      longDescription: [
        "Rubio Monocoat asked me to make a colour. That is not a thing I expected to ever be asked.",
        "",
        "Matcha Green is Oil Plus 2C in a green that came out of the same place the rest of my work comes from. Green for growth, for nature, for the reason I started making things in the first place. Rubio's own green stands for more or less the same, which is probably why the whole thing felt easy.",
        "",
        "It behaves like any other Oil Plus 2C. One coat, bonded to the wood fibre, no film sitting on top, food safe once cured. The only difference is the colour and the fact that there is not much of it.",
        "",
        "390 mL only, limited run, final sale. If you want a can, do not wait around.",
      ].join("\n"),
      jesperNote:
        "Do, or do not. There is no try. That is what I was thinking about when we picked this green. Treat the wood with care and respect, and treat people the same way.",
      buyLinks: [
        {
          label: "Rubio Monocoat US",
          url: `https://www.rubiomonocoatusa.com/products/oil-plus-2c-matcha-green-by-jesper-makes?bg_ref=${REF}`,
          region: "us",
          badge: "Affiliate",
        },
      ],
      specs: [
        { label: "Size", value: "390 mL" },
        { label: "Type", value: "Oil Plus 2C, two component hardwax oil" },
        { label: "Coats", value: "One" },
        { label: "Availability", value: "Limited run, final sale" },
      ],
      ambassadorBadge: true,
      featured: true,
      hidden: false,
      sortOrder: 39,
    })
    .returning({ id: toolItems.id, slug: toolItems.slug });

  console.log(`Created ${created.slug} (${created.id})`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
