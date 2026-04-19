import Link from "next/link";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const featuredSlugs = ["festool", "hand-tools", "finishing", "gardening-outdoors"];

export async function ToolsSection() {
  const rows = await db
    .select({
      category: toolItems.category,
      categorySlug: toolItems.categorySlug,
      categoryIcon: toolItems.categoryIcon,
      count: sql<number>`count(*)::int`,
    })
    .from(toolItems)
    .where(eq(toolItems.hidden, false))
    .groupBy(toolItems.category, toolItems.categorySlug, toolItems.categoryIcon);

  const featured = rows.filter((c) => featuredSlugs.includes(c.categorySlug));

  return (
    <section className="bg-wood text-cream">
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
        <h2 className="font-serif text-3xl md:text-4xl mb-4">
          Tools I Actually Use
        </h2>
        <p className="text-cream/60 leading-relaxed mb-10 max-w-2xl">
          Festool ambassador. Rubio Monocoat ambassador. Carhartt ambassador.
          Every tool on this list earned its place in my workshop.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((cat) => (
            <Link
              key={cat.categorySlug}
              href={`/tools/category/${cat.categorySlug}`}
              className="group block rounded-xl border border-cream/10 hover:border-forest/40 p-6 transition-colors"
            >
              <span className="text-3xl mb-3 block">{cat.categoryIcon}</span>
              <h3 className="font-serif text-lg group-hover:text-forest transition-colors mb-2">
                {cat.category}
              </h3>
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href="/tools"
            className="text-forest hover:text-forest-light font-medium transition-colors"
          >
            See the full tool list →
          </Link>
        </div>
      </div>
    </section>
  );
}
