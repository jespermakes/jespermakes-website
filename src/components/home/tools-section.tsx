import Link from "next/link";
import { categories } from "@/data/tools";

const featuredSlugs = ["festool", "hand-tools", "finishing", "gardening-outdoors"];

export function ToolsSection() {
  const featured = categories.filter((c) => featuredSlugs.includes(c.slug));

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
              key={cat.slug}
              href={`/tools/category/${cat.slug}`}
              className="group block rounded-xl border border-cream/10 hover:border-amber/40 p-6 transition-colors"
            >
              <span className="text-3xl mb-3 block">{cat.icon}</span>
              <h3 className="font-serif text-lg group-hover:text-amber transition-colors mb-2">
                {cat.title}
              </h3>
              <p className="text-cream/50 text-sm leading-relaxed">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href="/tools"
            className="text-amber hover:text-amber-light font-medium transition-colors"
          >
            See the full tool list →
          </Link>
        </div>
      </div>
    </section>
  );
}
