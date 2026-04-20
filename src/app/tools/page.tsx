import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { SmartImage } from "@/components/smart-image";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tools & Links — Jesper Makes",
  description:
    "The tools, materials and products I actually use in my workshop. Honest recommendations from years of building.",
};

type CategoryInfo = {
  category: string;
  categorySlug: string;
  categoryIcon: string;
  count: number;
};

export default async function ToolsPage() {
  const rows = await db
    .select({
      category: toolItems.category,
      categorySlug: toolItems.categorySlug,
      categoryIcon: toolItems.categoryIcon,
      count: sql<number>`count(*)::int`,
    })
    .from(toolItems)
    .where(eq(toolItems.hidden, false))
    .groupBy(toolItems.category, toolItems.categorySlug, toolItems.categoryIcon)
    .orderBy(asc(toolItems.category));

  const categories: CategoryInfo[] = rows;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-10 md:gap-14 mb-16 items-center">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl text-wood mb-4">
            Tools & Links
          </h1>
          <p className="text-wood-light/80 text-lg">
            People ask me all the time about the tools I use, so I decided to
            put them all on the website with my comments on each one.
          </p>
          <p className="text-wood-light/80 text-lg mt-3">
            I like to find places where to buy them all over the world. Some
            links are affiliate links, some are not. If you buy something
            using my links, thank you. It helps keeping the lights on in my
            shop.
          </p>
          <p className="text-wood-light/60 text-sm mt-3">
            Items marked{" "}
            <span className="text-forest font-medium">Ambassador</span> are
            from brands I officially work with.
          </p>
        </div>
        <SmartImage
          src="/images/jesper-workshop-tools.jpg"
          alt="Jesper in the workshop"
          aspectRatio="3/2"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className="w-full rounded-xl"
        />
      </div>

      <Link
        href="/plywood"
        className="block bg-forest/10 border border-forest/20 rounded-2xl p-6 mb-8 hover:border-forest/40 transition-colors"
      >
        <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-2">
          NEW — MATERIAL GUIDE
        </p>
        <h3 className="font-serif text-2xl text-wood mb-2">
          Plywood, explained properly
        </h3>
        <p className="text-wood-light/70">
          A beginner&apos;s guide to birch vs spruce, grade stamps, edge sealing,
          and the three WISA panels I use for every serious project.
        </p>
      </Link>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.categorySlug}
            href={`/tools/category/${cat.categorySlug}`}
            className="group bg-white/60 rounded-xl p-8 border border-wood/5 hover:border-forest/20 transition-colors flex flex-col"
          >
            <span className="text-4xl mb-4">{cat.categoryIcon}</span>
            <h2 className="font-serif text-xl text-wood group-hover:text-forest transition-colors mb-2">
              {cat.category}
            </h2>
            <span className="text-xs font-medium text-wood-light/50 mt-auto">
              {cat.count} {cat.count === 1 ? "item" : "items"}
            </span>
          </Link>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-20 bg-wood/5 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="font-serif text-2xl text-wood mb-3">
          Missing something?
        </h2>
        <p className="text-wood-light/70 max-w-lg mx-auto mb-6">
          If there&apos;s a tool you saw in one of my videos and want to know
          more about, just ask in the comments. I&apos;ll add it here.
        </p>
        <a
          href="https://youtube.com/@jespermakes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-wood text-cream px-6 py-3 rounded-full font-medium hover:bg-wood/90 transition-colors"
        >
          Visit the channel
        </a>
      </div>
    </div>
  );
}
