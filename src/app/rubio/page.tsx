import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { rubioProducts } from "@/lib/db/schema";
import { CATEGORIES } from "@/data/rubio-shop-catalogue";
import { resolveRegion } from "@/lib/rubio-region-server";
import { storeUrl, REGIONS } from "@/lib/rubio-shop";
import RegionSwitcher from "@/components/rubio/region-switcher";
import ProductCard, { BuyButton, priceFor } from "@/components/rubio/product-card";
import { formatPrice } from "@/lib/rubio-shop";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The Rubio Monocoat shop",
  description:
    "The Rubio Monocoat finishes I actually use, with the right product for your project and prices in your own currency. Ships from Rubio in Europe or the US.",
  alternates: { canonical: "https://jespermakes.com/rubio" },
};

export default async function RubioShopPage() {
  const { region } = resolveRegion();
  const products = await db
    .select()
    .from(rubioProducts)
    .orderBy(asc(rubioProducts.sortOrder));

  const visible = products.filter((p) => !p.hidden);
  const matcha = visible.find((p) => p.slug === "matcha-green");

  /* Matcha Green is a US creator colour with no EU listing, so for a European
   * visitor the buy button has to point at the US store rather than vanish.
   * productUrl() returns null when the region does not carry the handle, which
   * would silently drop the button on the one product this whole page is
   * about. Resolve the store it is actually sold in and say so. */
  const matchaRegion =
    matcha && region.program === "us" ? region : REGIONS.us;
  const matchaIsForeign = !!matcha && matchaRegion.key !== region.key;
  const matchaPrice = matcha ? priceFor(matcha, matchaRegion) : null;

  return (
    <div className="bg-[#183029] text-white">
      {/* ------------------------------------------------------------ hero */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav className="text-sm text-white/50">
              <Link href="/" className="hover:text-white">
                Jesper Makes
              </Link>
              <span className="mx-2 text-white/25">/</span>
              <span className="text-white/80">Rubio Monocoat</span>
            </nav>
            <RegionSwitcher current={region.key} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 md:pt-20">
        {/* No year here. Nothing on record establishes when the ambassadorship
          * actually started, and Rubio would be the first to notice a wrong
          * date on a page about them. */}
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#fcc52c]">
          Rubio Monocoat ambassador
        </p>
        <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.08] md:text-6xl">
          The finishes I actually put on my own work.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
          I have used Rubio Monocoat on nearly everything I have built since I started. One coat,
          bonded into the wood rather than sitting on top of it, and the wood still feels like wood
          afterwards. This is the part of their range I keep on the shelf.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/45">
          Everything here checks out on Rubio&apos;s own store, in your currency. I am an ambassador
          and these are affiliate links, so a purchase supports the channel at no extra cost to you.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/rubio/guide"
            className="inline-flex items-center gap-2 rounded-xl bg-[#fcc52c] px-6 py-3.5 text-sm font-bold text-[#183029] transition-colors hover:bg-[#ffd457]"
          >
            Not sure what you need? Start the guide <span aria-hidden>→</span>
          </Link>
          <a
            href="#shop"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Browse everything
          </a>
        </div>
      </section>

      {/* -------------------------------------------------- matcha feature */}
      {matcha && (
        <section className="border-y border-white/10 bg-[#396948]/25">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:items-center md:py-20">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#fcc52c]">
                Limited edition
              </p>
              <h2 className="font-serif text-3xl font-medium leading-tight md:text-4xl">
                They let me make a colour.
              </h2>
              <p className="mt-5 text-white/75 leading-relaxed">
                Matcha Green is Oil Plus 2C in a green I picked with Rubio. Green for growth, for
                nature, for the reason I started making things at all. It behaves like any other Oil
                Plus 2C. One coat, food safe once cured. There is just not much of it.
              </p>
              <p className="mt-3 text-sm text-white/50">
                390 mL only. Limited run, final sale. Sold through Rubio USA.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <BuyButton product={matcha} region={matchaRegion} label="Get a can" />
                <Link
                  href="/rubio/matcha-green"
                  className="text-sm font-semibold text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white"
                >
                  The story behind it
                </Link>
                {matchaPrice && (
                  <span className="text-sm text-white/50">
                    {formatPrice(matchaPrice.amount, matchaPrice.currency)}
                  </span>
                )}
              </div>

              {matchaIsForeign && (
                <p className="mt-5 rounded-xl border border-[#fcc52c]/30 bg-[#fcc52c]/10 px-4 py-3 text-sm text-white/75">
                  Matcha Green is only carried by Rubio USA. That button goes to the US store, so
                  check their shipping to {region.label} before you order.
                </p>
              )}
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/15 bg-black/25">
              {matcha.videoEmbedUrl ? (
                <iframe
                  src={matcha.videoEmbedUrl}
                  title="Making the Matcha Green colour"
                  loading="lazy"
                  scrolling="no"
                  allowFullScreen
                  className="aspect-[4/5] w-full"
                />
              ) : matcha.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={matcha.image} alt={matcha.title} className="w-full object-cover" />
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------- the shop */}
      <section id="shop" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        {CATEGORIES.map((cat) => {
          const items = visible.filter((p) => p.category === cat.key);
          if (items.length === 0) return null;
          return (
            <div key={cat.key} className="mb-16 last:mb-0">
              <div className="mb-6 border-b border-white/10 pb-4">
                <h2 className="font-serif text-2xl font-medium md:text-3xl">{cat.label}</h2>
                <p className="mt-1.5 text-sm text-white/50">{cat.blurb}</p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} region={region} />
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-sm text-white/55">
          This is the part of the range I use. Rubio make a lot more than this, and you can{" "}
          <a
            href={storeUrl(region)}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="font-semibold text-[#fcc52c] underline decoration-[#fcc52c]/40 underline-offset-4"
          >
            browse their full catalogue
          </a>
          .
        </div>
      </section>

      {/* ------------------------------------------ guide + floor rescue */}
      <section className="border-t border-white/10 bg-black/15">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-16 md:grid-cols-2">
          <Link
            href="/rubio/guide"
            className="group rounded-3xl border border-white/12 bg-white/[0.04] p-8 transition-colors hover:border-[#fcc52c]/50 hover:bg-white/[0.07]"
          >
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#fcc52c]">
              Free guide
            </p>
            <h3 className="font-serif text-2xl font-medium">Which Rubio do I actually need?</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Four questions and you get the right product, how much of it to buy for your actual
              square metres and wood species, real colour swatches on that species, and the
              application steps with the usual mistakes flagged.
            </p>
            <span className="mt-5 inline-block text-sm font-semibold text-[#fcc52c]">
              Start the guide <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>

          <Link
            href="/floor-rescue"
            className="group rounded-3xl border border-[#fcc52c]/30 bg-[#fcc52c]/[0.07] p-8 transition-colors hover:border-[#fcc52c]/60 hover:bg-[#fcc52c]/[0.12]"
          >
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#fcc52c]">
              Competition, entries close 31 August
            </p>
            <h3 className="font-serif text-2xl font-medium">The Floor Rescue</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Worst floor wins. Three worn wooden floors around Europe get rescued, and each winner
              gets 1.3 L of Oil Plus 2C in the colour they choose. Real wood only. Show me the worst
              one you have.
            </p>
            <span className="mt-5 inline-block text-sm font-semibold text-[#fcc52c]">
              Enter your floor <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
