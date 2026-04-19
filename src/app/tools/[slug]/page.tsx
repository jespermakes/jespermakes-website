import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tools, getToolBySlug, getToolsByCategory, getCategoryByTitle } from "@/data/tools";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};

  return {
    title: `${tool.name} — Tools — Jesper Makes`,
    description: tool.description,
    alternates: {
      canonical: `/tools/${tool.slug}`,
    },
  };
}

const regionFlag: Record<string, string> = {
  us: "\u{1F1FA}\u{1F1F8}",
  eu: "\u{1F1EA}\u{1F1FA}",
  global: "\u{1F30D}",
};

export default function ToolPage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const relatedTools = getToolsByCategory(tool.category).filter(
    (t) => t.slug !== tool.slug
  );
  const category = getCategoryByTitle(tool.category);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-wood-light/60 mb-10">
        <Link href="/tools" className="hover:text-amber transition-colors">
          Tools & Links
        </Link>
        <span>/</span>
        {category ? (
          <Link
            href={`/tools/category/${category.slug}`}
            className="hover:text-amber transition-colors"
          >
            {tool.category}
          </Link>
        ) : (
          <span className="text-wood-light/40">{tool.category}</span>
        )}
        <span>/</span>
        <span className="text-wood">{tool.name}</span>
      </nav>

      {/* Hero */}
      <div className="grid md:grid-cols-2 gap-10 md:gap-14 mb-16">
        {/* Image / Placeholder */}
        <div className="w-full aspect-[4/3] rounded-xl bg-wood/5 flex items-center justify-center">
          {tool.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tool.image}
              alt={tool.name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-5xl opacity-30">{tool.categoryIcon}</span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-wood-light/60 bg-wood/5 px-3 py-1 rounded-full">
              {tool.categoryIcon} {tool.category}
            </span>
            {tool.badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">
                {tool.badge}
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-wood mb-4">
            {tool.name}
          </h1>
          <p className="text-wood-light/80 text-lg leading-relaxed">
            {tool.longDescription ?? tool.description}
          </p>
        </div>
      </div>

      {/* Use Cases */}
      {tool.useCases && tool.useCases.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif text-2xl text-wood mb-6">What I use it for</h2>
          <ul className="space-y-2">
            {tool.useCases.map((useCase) => (
              <li
                key={useCase}
                className="flex items-center gap-3 bg-white/60 rounded-xl p-4 border border-wood/5"
              >
                <span className="text-amber">&#x2022;</span>
                <span className="text-wood">{useCase}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Specs */}
      {tool.specs && tool.specs.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif text-2xl text-wood mb-6">Specifications</h2>
          <div className="bg-white/60 rounded-xl border border-wood/5 divide-y divide-wood/5">
            {tool.specs.map((spec) => (
              <div key={spec.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-4">
                <span className="text-sm font-medium text-wood-light/60 sm:w-48 shrink-0">
                  {spec.label}
                </span>
                <span className="text-wood">{spec.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Jesper's Note */}
      {tool.jesperNote && (
        <section className="mb-16">
          <div className="bg-amber/10 border border-amber/20 rounded-2xl p-8">
            <p className="text-[10px] font-bold tracking-[0.15em] text-amber mb-3">
              JESPER&apos;S NOTE
            </p>
            <p className="text-wood text-lg leading-relaxed font-serif italic">
              {tool.jesperNote}
            </p>
          </div>
        </section>
      )}

      {/* Learn More */}
      {tool.learnMoreUrl && (
        <section className="mb-16">
          <Link
            href={tool.learnMoreUrl}
            className="inline-flex items-center gap-2 bg-wood text-cream px-6 py-3 rounded-full font-medium hover:bg-wood/90 transition-colors"
          >
            Learn more about this product &rarr;
          </Link>
        </section>
      )}

      {/* Photo Gallery */}
      {tool.gallery && tool.gallery.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif text-2xl text-wood mb-6">Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tool.gallery.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`${tool.name} photo ${i + 1}`}
                className="w-full aspect-[4/3] object-cover rounded-xl"
              />
            ))}
          </div>
        </section>
      )}

      {/* Color Grid */}
      {tool.colorGrid && tool.colorGrid.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif text-2xl text-wood mb-6">Color Range</h2>
          {(() => {
            const collections = new Set(tool.colorGrid.map((s) => s.collection).filter(Boolean));
            if (collections.size > 0) {
              return Array.from(collections).map((collection) => (
                <div key={collection} className="mb-8 last:mb-0">
                  <h3 className="text-sm font-medium text-wood-light/60 uppercase tracking-wide mb-4">
                    {collection}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {tool.colorGrid!
                      .filter((s) => s.collection === collection)
                      .map((swatch) => (
                        <div key={swatch.name} className="flex flex-col items-center gap-1.5">
                          <div
                            className="w-12 h-12 sm:w-12 sm:h-12 rounded-lg border border-wood/10"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <span className="text-xs text-wood-light/70 text-center leading-tight">
                            {swatch.name}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ));
            }
            return (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {tool.colorGrid.map((swatch) => (
                  <div key={swatch.name} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-12 h-12 sm:w-12 sm:h-12 rounded-lg border border-wood/10"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="text-xs text-wood-light/70 text-center leading-tight">
                      {swatch.name}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
          {tool.slug === "rubio-monocoat-oil-plus-2c" && (
            <p className="text-wood-light/50 text-xs mt-4">
              Colors shown are approximate. Results vary by wood species and preparation. Always test on a sample first.
            </p>
          )}
        </section>
      )}

      {/* Product List */}
      {tool.productList && tool.productList.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif text-2xl text-wood mb-6">Included Products</h2>
          <ul className="space-y-2">
            {tool.productList.map((product) => (
              <li
                key={product}
                className="flex items-center gap-3 bg-white/60 rounded-xl p-4 border border-wood/5"
              >
                <span className="text-amber">&#x2022;</span>
                <span className="text-wood">{product}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Buy Links */}
      <section className="mb-16">
        <h2 className="font-serif text-2xl text-wood mb-6">Where to buy</h2>
        {tool.buyLinks.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tool.buyLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between bg-white/60 rounded-xl p-5 border border-wood/5 hover:border-amber/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {link.region && (
                      <span className="text-xl">
                        {regionFlag[link.region] ?? ""}
                      </span>
                    )}
                    <span className="font-medium text-wood group-hover:text-amber transition-colors">
                      {link.label}
                    </span>
                  </div>
                  {link.badge && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
            <p className="text-wood-light/50 text-xs mt-4">
              Some links are affiliate links. They cost you nothing extra but
              help support the channel.
            </p>
          </>
        ) : (
          <p className="text-wood-light/50 text-sm bg-wood/5 rounded-xl p-5">
            Links coming soon — I&apos;m gathering the best places to buy this
            tool.
          </p>
        )}
      </section>

      {/* Related Videos */}
      {tool.youtubeVideos && tool.youtubeVideos.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif text-2xl text-wood mb-6">
            Videos featuring this tool
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tool.youtubeVideos.map((videoId) => (
              <div
                key={videoId}
                className="aspect-video rounded-xl overflow-hidden"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related tools in same category */}
      {relatedTools.length > 0 && (
        <section className="mb-16">
          <h2 className="font-serif text-2xl text-wood mb-6">
            More in {tool.category}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTools.map((related) => (
              <Link
                key={related.slug}
                href={`/tools/${related.slug}`}
                className="group bg-white/60 rounded-xl p-5 border border-wood/5 hover:border-amber/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-lg text-wood group-hover:text-amber transition-colors">
                    {related.name}
                  </h3>
                  {related.badge && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20">
                      {related.badge}
                    </span>
                  )}
                </div>
                <p className="text-wood-light/70 text-sm line-clamp-2">
                  {related.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <Link
        href="/tools"
        className="inline-flex items-center gap-2 text-sm font-medium text-amber hover:text-amber/80 transition-colors"
      >
        &larr; Back to all tools
      </Link>
    </div>
  );
}
