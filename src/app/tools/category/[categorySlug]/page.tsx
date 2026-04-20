import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toolItems, images } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { SmartImage } from "@/components/smart-image";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { categorySlug: string } }): Promise<Metadata> {
  const rows = await db
    .select({ category: toolItems.category })
    .from(toolItems)
    .where(and(eq(toolItems.categorySlug, params.categorySlug), eq(toolItems.hidden, false)))
    .limit(1);

  const categoryName = rows[0]?.category;
  if (!categoryName) return {};

  return {
    title: `${categoryName} — Tools — Jesper Makes`,
    alternates: {
      canonical: `/tools/category/${params.categorySlug}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const rows = await db
    .select({ tool: toolItems, image: images })
    .from(toolItems)
    .leftJoin(images, eq(toolItems.imageId, images.id))
    .where(and(eq(toolItems.categorySlug, params.categorySlug), eq(toolItems.hidden, false)))
    .orderBy(asc(toolItems.sortOrder), asc(toolItems.name));

  if (rows.length === 0) notFound();

  const { category, categoryIcon } = rows[0].tool;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-wood-light/60 mb-10">
        <Link href="/tools" className="hover:text-forest transition-colors">
          Tools & Links
        </Link>
        <span>/</span>
        <span className="text-wood">{category}</span>
      </nav>

      {/* Category header */}
      <div className="flex items-center gap-4 mb-10">
        <span className="text-4xl">{categoryIcon}</span>
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-wood">
            {category}
          </h1>
        </div>
      </div>

      {/* Tool grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map(({ tool, image }) => {
          const imgUrl = image?.url ?? tool.image ?? null;
          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="group bg-white/60 rounded-xl p-5 border border-wood/5 hover:border-forest/20 transition-colors"
            >
              <div className="w-full aspect-[4/3] rounded-lg bg-wood/5 flex items-center justify-center mb-4 overflow-hidden">
                {imgUrl ? (
                  image?.width && image?.height ? (
                    <SmartImage
                      src={imgUrl}
                      alt={tool.name}
                      width={image.width}
                      height={image.height}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <SmartImage
                      src={imgUrl}
                      alt={tool.name}
                      aspectRatio="4/3"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full h-full"
                    />
                  )
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
                {tool.ambassadorBadge && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20">
                    Ambassador
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
          );
        })}
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
