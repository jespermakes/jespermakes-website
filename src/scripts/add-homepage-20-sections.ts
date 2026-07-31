// One-shot: insert the two homepage 2.0 section rows (work, barn) per
// DR-156. Idempotent: skips a kind that already exists on the home page.
// Run: set -a; source .env.local; set +a; npx tsx src/scripts/add-homepage-20-sections.ts

import { db } from "@/lib/db";
import { pageSections } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

async function run() {
  const existing = await db
    .select({ kind: pageSections.kind })
    .from(pageSections)
    .where(eq(pageSections.pageSlug, "home"));
  const kinds = new Set(existing.map((r) => r.kind));

  if (!kinds.has("work")) {
    await db.insert(pageSections).values({
      pageSlug: "home",
      kind: "work",
      position: 15,
      visible: true,
      hidden: false,
      data: {
        caps: "Selected work",
        title: "Furniture with a story in it",
        subtitle: "Every piece starts with material that had a life before.",
        items: [
          {
            title: "The Cone Lamp",
            blurb:
              "159 pieces of plywood and one warm glow. The flagship piece, laser cut or 3D printed.",
            image: "/images/products/cone-lamp-laser-1.jpg",
            href: "/cone-lamp",
          },
          {
            title: "Live-Edge Planter Shelf",
            blurb: "No screws, no metal. Glue, joinery, and wood holding wood.",
            image: "/images/blog/planter-shelf-finished.jpg",
            href: "/blog/live-edge-planter-shelf-zero-screws",
          },
          {
            title: "Garden Planter Boxes",
            blurb:
              "Fir boards, finger joints, and a routing template worth falling for.",
            image: "/images/blog/planter-box-finger-joints-template.jpg",
            href: "/blog/planter-box-finger-joints",
          },
        ],
        ctaLabel: "See the work →",
        ctaUrl: "/work",
      },
    });
    console.log("Inserted work section");
  } else {
    console.log("work section already exists, skipped");
  }

  if (!kinds.has("barn")) {
    await db.insert(pageSections).values({
      pageSlug: "home",
      kind: "barn",
      position: 18,
      visible: true,
      hidden: false,
      data: {
        caps: "The barn / Øhavsladen",
        title: "Raising a barn the old way",
        body: "On South Fyn we are rebuilding an 1850s barn as a hand-cut timber frame workshop. Axes, chisels, oak pegs, and friends from The Northmen. When it stands, it becomes a place to teach the craft.",
        image: "/images/press/latvia/barn-evening-wide.jpg",
        imageAlt: "The barn at dusk on South Fyn",
        ctaLabel: "Follow the build",
        ctaUrl: "/barn",
        secondaryLabel: "ohavsladen.dk",
        secondaryUrl: "https://ohavsladen.dk",
      },
    });
    console.log("Inserted barn section");
  } else {
    console.log("barn section already exists, skipped");
  }

  const after = await db
    .select({ kind: pageSections.kind, position: pageSections.position, visible: pageSections.visible })
    .from(pageSections)
    .where(and(eq(pageSections.pageSlug, "home"), eq(pageSections.hidden, false)));
  console.log("home sections now:", after.sort((a, b) => a.position - b.position));
}

run().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
