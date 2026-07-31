import { getShopProductsForFeed } from "@/lib/homepage/fetch";
import type { ShopData } from "@/lib/homepage/types";
import { resolveTheme } from "@/lib/homepage/themes";
import { Kicker } from "./kicker";

// The plan shelf: dark chapter, products floating on night, prices in amber.
export default function ShopModule({ data }: { data: ShopData }) {
  const products = getShopProductsForFeed(data.mode, data.count, data.ids);
  const theme = resolveTheme("shop", data.theme);
  if (products.length === 0) return null;

  const dark = data.theme !== "cream" && data.theme !== "white" && data.theme !== "wood-soft";

  let before = data.title;
  let highlight = "";
  let after = "";
  if (data.titleHighlight && data.title.includes(data.titleHighlight)) {
    const idx = data.title.indexOf(data.titleHighlight);
    before = data.title.slice(0, idx);
    highlight = data.titleHighlight;
    after = data.title.slice(idx + data.titleHighlight.length);
  }

  return (
    <section className={theme.bg}>
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        {data.caps && <Kicker dark={dark}>{data.caps}</Kicker>}
        <h2 className={`mt-5 font-serif text-4xl md:text-5xl max-w-3xl leading-tight ${theme.heading}`}>
          {before}
          {highlight && <em className={`not-italic ${theme.highlight}`}>{highlight}</em>}
          {after}
        </h2>
        {data.subtitle && (
          <p className={`mt-5 max-w-xl leading-relaxed ${theme.text}`}>{data.subtitle}</p>
        )}

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p) => (
            <a key={p.slug} href={`/shop/${p.slug}`} className="group block">
              <div className="overflow-hidden rounded-2xl ring-1 ring-cream/10">
                {p.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full object-cover aspect-square group-hover:scale-[1.02] transition-transform duration-500"
                  />
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <h3 className={`font-serif text-lg group-hover:text-amber transition-colors ${theme.heading}`}>
                  {p.title}
                </h3>
                {p.price && (
                  <span className="font-serif text-xl text-amber shrink-0">{p.price}</span>
                )}
              </div>
              <p className={`mt-1 text-sm ${theme.muted}`}>{p.subtitle}</p>
            </a>
          ))}
        </div>

        {data.ctaLabel && data.ctaUrl && (
          <a
            href={data.ctaUrl}
            className={`mt-12 inline-block text-sm font-semibold ${theme.accent}`}
          >
            {data.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}
