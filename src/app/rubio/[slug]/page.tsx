import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { rubioProducts } from "@/lib/db/schema";
import { resolveRegion } from "@/lib/rubio-region-server";
import { REGIONS, REGION_ORDER, formatPrice, productUrl } from "@/lib/rubio-shop";
import RegionSwitcher from "@/components/rubio/region-switcher";
import ProductCard, { BuyButton, priceFor } from "@/components/rubio/product-card";
import ColourGrid, { type Swatch } from "@/components/rubio/colour-grid";

export const revalidate = 300;

async function getProduct(slug: string) {
  const rows = await db.select().from(rubioProducts).where(eq(rubioProducts.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Not found" };
  return {
    title: `${product.title} | Rubio Monocoat`,
    description: product.blurb,
    alternates: { canonical: `https://jespermakes.com/rubio/${product.slug}` },
    openGraph: {
      title: product.title,
      description: product.blurb,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function RubioProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product || product.hidden) notFound();

  const { region } = resolveRegion();
  const price = priceFor(product, region);
  const carried = region.program === "us" ? !!product.usHandle : !!product.euHandle;

  // Where else can they get it, if their own store does not carry it.
  const alternatives = REGION_ORDER.map((k) => REGIONS[k])
    .filter((r) => r.key !== region.key)
    .filter((r) => (r.program === "us" ? !!product.usHandle : !!product.euHandle));

  const related = (
    await db.select().from(rubioProducts).orderBy(asc(rubioProducts.sortOrder))
  )
    .filter((p) => !p.hidden && p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="bg-[#183029] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="text-sm text-white/50">
              <Link href="/rubio" className="hover:text-white">
                Rubio Monocoat
              </Link>
              <span className="mx-2 text-white/25">/</span>
              <span className="text-white/80">{product.title}</span>
            </nav>
            <RegionSwitcher current={region.key} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          {/* media */}
          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-white/12 bg-white">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt={product.title}
                  className="aspect-square w-full object-contain p-8"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-5xl text-black/10">🪵</div>
              )}
            </div>

            {product.videoEmbedUrl && (
              <div className="overflow-hidden rounded-3xl border border-white/12 bg-black/30">
                <iframe
                  src={product.videoEmbedUrl}
                  title={`${product.title} in use`}
                  loading="lazy"
                  scrolling="no"
                  allowFullScreen
                  className="aspect-[4/5] w-full"
                />
              </div>
            )}
          </div>

          {/* detail */}
          <div>
            {product.featured && (
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#fcc52c]">
                {product.slug === "matcha-green" ? "My own colour" : "One I keep on the shelf"}
              </p>
            )}
            <h1 className="font-serif text-3xl font-medium leading-tight md:text-4xl">{product.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-white/70">{product.blurb}</p>

            <div className="mt-8 rounded-2xl border border-white/12 bg-white/[0.04] p-6">
              {price ? (
                <div className="mb-4">
                  <span className="text-[11px] uppercase tracking-wide text-white/40">
                    From, at Rubio {region.label}
                  </span>
                  <div className="font-serif text-3xl font-medium">
                    {formatPrice(price.amount, price.currency)}
                  </div>
                  <p className="mt-1 text-xs text-white/40">
                    Price and stock live at Rubio. Sizes and colours change the total.
                  </p>
                </div>
              ) : (
                <p className="mb-4 text-sm text-white/50">
                  Rubio set the price for {region.label}. Check the live figure on their page.
                </p>
              )}

              {carried ? (
                <>
                  <BuyButton product={product} region={region} className="w-full" />
                  <p className="mt-3 text-center text-xs text-white/35">
                    Affiliate link. Costs you nothing extra, supports the channel.
                  </p>
                </>
              ) : (
                <div>
                  <p className="text-sm leading-relaxed text-white/70">
                    Rubio {region.label} does not carry this one.
                    {alternatives.length > 0 && " It is available here:"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {alternatives.slice(0, 3).map((alt) => {
                      const href = productUrl(alt, {
                        usHandle: product.usHandle,
                        euHandle: product.euHandle,
                      });
                      if (!href) return null;
                      return (
                        <a
                          key={alt.key}
                          href={href}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#fcc52c] px-4 py-2.5 text-sm font-bold text-[#183029] hover:bg-[#ffd457]"
                        >
                          <span aria-hidden>{alt.flag}</span> Rubio {alt.label}
                        </a>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-xs text-white/40">
                    Check their shipping to {region.label} before ordering.
                  </p>
                </div>
              )}
            </div>

            {product.longDescription && (
              <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-white/70">
                {product.longDescription.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            {product.jesperNote && (
              <blockquote className="mt-8 rounded-2xl border-l-4 border-[#fcc52c] bg-white/[0.04] px-6 py-5">
                <p className="font-serif text-lg italic leading-relaxed text-white/85">
                  {product.jesperNote}
                </p>
                <footer className="mt-2 text-sm text-white/45">Jesper</footer>
              </blockquote>
            )}

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/55">
              Not sure this is the right product for your project?{" "}
              <Link href="/rubio/guide" className="font-semibold text-[#fcc52c] underline decoration-[#fcc52c]/40 underline-offset-4">
                Run the guide
              </Link>{" "}
              and it will tell you what to buy and how much.
            </div>
          </div>
        </div>

        <ColourGrid
          swatches={(Array.isArray(product.colorGrid) ? product.colorGrid : []) as Swatch[]}
          productName={product.title}
        />

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-6 border-b border-white/10 pb-4 font-serif text-2xl font-medium">
              Goes with this
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} region={region} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
