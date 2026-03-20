import type { Metadata } from "next";
import Link from "next/link";
import { categories, getToolsByCategory } from "@/data/tools";

export const metadata: Metadata = {
  title: "Tools & Links — Jesper Makes",
  description:
    "The tools, materials and products I actually use in my workshop. Honest recommendations from years of building.",
};

export default function ToolsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="max-w-2xl mb-16">
        <h1 className="font-serif text-4xl md:text-5xl text-wood mb-4">
          Tools & Links
        </h1>
        <p className="text-wood-light/80 text-lg">
          Everything I actually use in my workshop. No filler, no paid
          placements disguised as recommendations — just the tools I reach for
          every day.
        </p>
        <p className="text-wood-light/60 text-sm mt-3">
          Some links are affiliate links — they cost you nothing extra but help
          support the channel. Items marked{" "}
          <span className="text-amber font-medium">Ambassador</span> are from
          brands I officially work with.
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((category) => {
          const categoryTools = getToolsByCategory(category.title);
          return (
            <section key={category.title}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h2 className="font-serif text-2xl text-wood">
                    {category.title}
                  </h2>
                  <p className="text-wood-light/60 text-sm">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group bg-white/60 rounded-xl p-5 border border-wood/5 hover:border-amber/20 transition-colors"
                  >
                    <div className="w-full aspect-[4/3] rounded-lg bg-wood/5 flex items-center justify-center mb-4">
                      <span className="text-3xl opacity-40">
                        {tool.categoryIcon}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif text-lg text-wood group-hover:text-amber transition-colors">
                        {tool.name}
                      </h3>
                      {tool.badge && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-wood-light/70 text-sm line-clamp-2 mb-3">
                      {tool.description}
                    </p>
                    <span className="text-sm font-medium text-amber group-hover:text-amber/80 transition-colors">
                      View details &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
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
