import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  categories,
  getCategoryBySlug,
  getToolsByCategory,
} from "@/data/tools";

type Props = {
  params: { categorySlug: string };
};

export function generateStaticParams() {
  return categories.map((c) => ({ categorySlug: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const category = getCategoryBySlug(params.categorySlug);
  if (!category) return {};

  return {
    title: `${category.title} — Tools — Jesper Makes`,
    description: category.description,
    alternates: {
      canonical: `/tools/category/${category.slug}`,
    },
  };
}

export default function CategoryPage({ params }: Props) {
  const category = getCategoryBySlug(params.categorySlug);
  if (!category) notFound();

  const categoryTools = getToolsByCategory(category.title);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-wood-light/60 mb-10">
        <Link href="/tools" className="hover:text-forest transition-colors">
          Tools & Links
        </Link>
        <span>/</span>
        <span className="text-wood">{category.title}</span>
      </nav>

      {/* Category header */}
      <div className="flex items-center gap-4 mb-10">
        <span className="text-4xl">{category.icon}</span>
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-wood">
            {category.title}
          </h1>
          <p className="text-wood-light/70 text-lg mt-1">
            {category.description}
          </p>
        </div>
      </div>

      {/* Tool grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group bg-white/60 rounded-xl p-5 border border-wood/5 hover:border-forest/20 transition-colors"
          >
            <div className="w-full aspect-[4/3] rounded-lg bg-wood/5 flex items-center justify-center mb-4 overflow-hidden relative">
              {tool.image ? (
                <Image
                  src={tool.image}
                  alt={tool.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <span className="text-3xl opacity-40">
                  {tool.categoryIcon}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-serif text-lg text-wood group-hover:text-forest transition-colors">
                {tool.name}
              </h3>
              {tool.badge && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20">
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="text-wood-light/70 text-sm line-clamp-2 mb-3">
              {tool.description}
            </p>
            <span className="text-sm font-medium text-forest group-hover:text-forest/80 transition-colors">
              View details &rarr;
            </span>
          </Link>
        ))}
      </div>

      {/* Back link */}
      <div className="mt-12">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm font-medium text-forest hover:text-forest/80 transition-colors"
        >
          &larr; All categories
        </Link>
      </div>
    </div>
  );
}
