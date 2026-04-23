import { db } from "@/lib/db";
import { pageSections, images } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { ModuleData, ModuleKind } from "@/lib/homepage/types";

async function run() {
  const existing = await db
    .select()
    .from(pageSections)
    .where(and(eq(pageSections.pageSlug, "home"), eq(pageSections.hidden, false)));

  if (existing.length > 0) {
    console.log(`Found ${existing.length} existing home sections. Nothing to seed.`);
    return;
  }

  const heroCandidates = await db.select().from(images).limit(50);
  const pickId = (terms: string[]) =>
    heroCandidates.find((img) => terms.some((t) => (img.filename || "").toLowerCase().includes(t) || ((img.description || "") as string).toLowerCase().includes(t)))?.id;

  const heroImageId = pickId(["workshop", "jesper", "wood", "stack"]) ?? heroCandidates[0]?.id;
  const aboutImageId = pickId(["workshop", "bench", "tools"]) ?? heroCandidates[1]?.id ?? heroCandidates[0]?.id;

  const seeds: Array<{ kind: ModuleKind; data: ModuleData }> = [
    {
      kind: "hero",
      data: {
        title: "Build something real.",
        titleHighlight: "real.",
        subtitle: "I'm Jesper, a Danish woodworker on YouTube. 354k people watch me turn pallet wood into furniture that lasts.",
        primaryCta: { label: "Watch on YouTube", url: "https://youtube.com/@JesperMakes" },
        secondaryCta: { label: "Browse the shop", url: "/shop" },
        mediaImageId: heroImageId,
        mediaOverlayText: "my best projects",
      } satisfies ModuleData,
    },
    {
      kind: "about",
      data: {
        title: "Started with pallet wood. Still building.",
        body:
          "What started as breaking down pallets in a backyard turned into a workshop, a YouTube channel, and a community of people who want to make things with their hands.\nNo fancy CNC machines, just good joinery, honest materials, and the patience to do it right.",
        imageId: aboutImageId,
        ctaLabel: "Read more about Jesper \u2192",
        ctaUrl: "/about",
        direction: "image-left",
      } satisfies ModuleData,
    },
    {
      kind: "creator_tools",
      data: {
        caps: "Creator tools",
        title: "Free tools for makers",
        subtitle: "I build small tools when I need them. You can use them too.",
        toolSlugs: ["title-lab", "storyteller", "box-joint-jig"],
      } satisfies ModuleData,
    },
    {
      kind: "blog",
      data: {
        caps: "From the workshop",
        title: "Latest writing",
        mode: "auto",
        count: 3,
        ctaLabel: "All posts \u2192",
        ctaUrl: "/blog",
      } satisfies ModuleData,
    },
    {
      kind: "shop",
      data: {
        caps: "In the shop",
        title: "Plans, printables, and the occasional piece of merch",
        mode: "auto",
        count: 3,
        ctaLabel: "Full shop \u2192",
        ctaUrl: "/shop",
      } satisfies ModuleData,
    },
    {
      kind: "youtube",
      data: {
        caps: "On YouTube",
        title: "Latest videos",
        mode: "auto",
        count: 3,
        ctaLabel: "Subscribe \u2192",
        ctaUrl: "https://youtube.com/@JesperMakes",
      } satisfies ModuleData,
    },
    {
      kind: "newsletter",
      data: {
        caps: "The workshop letter",
        title: "A letter from the workshop",
        subtitle: "New videos, new tools, and the occasional long read. Once a week. Never boring.",
        buttonLabel: "Subscribe",
        placeholder: "your@email.com",
        showSubscriberCount: true,
      } satisfies ModuleData,
    },
  ];

  for (let i = 0; i < seeds.length; i++) {
    await db.insert(pageSections).values({
      pageSlug: "home",
      position: (i + 1) * 10,
      kind: seeds[i].kind,
      visible: true,
      hidden: false,
      data: seeds[i].data as object,
    });
    console.log(`Seeded ${seeds[i].kind} at position ${(i + 1) * 10}`);
  }

  console.log("Homepage seed complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
