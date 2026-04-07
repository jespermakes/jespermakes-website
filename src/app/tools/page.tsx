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
            <span className="text-amber font-medium">Ambassador</span> are
            from brands I officially work with.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/jesper-workshop-tools.jpg"
          alt="Jesper in the workshop"
          className="w-full rounded-xl"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const count = getToolsByCategory(category.title).length;
          return (
            <Link
              key={category.slug}
              href={`/tools/category/${category.slug}`}
              className="group bg-white/60 rounded-xl p-8 border border-wood/5 hover:border-amber/20 transition-colors flex flex-col"
            >
              <span className="text-4xl mb-4">{category.icon}</span>
              <h2 className="font-serif text-xl text-wood group-hover:text-amber transition-colors mb-2">
                {category.title}
              </h2>
              <p className="text-wood-light/70 text-sm mb-4 flex-1">
                {category.description}
              </p>
              <span className="text-xs font-medium text-wood-light/50">
                {count} {count === 1 ? "item" : "items"}
              </span>
            </Link>
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
