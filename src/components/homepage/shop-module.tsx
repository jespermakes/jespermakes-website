import { getShopProductsForFeed } from "@/lib/homepage/fetch";
import type { ShopData } from "@/lib/homepage/types";

export default function ShopModule({ data }: { data: ShopData }) {
  const products = getShopProductsForFeed(data.mode, data.count, data.ids);
  if (products.length === 0) return null;

  return (
    <section>
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="flex items-baseline justify-between gap-6">
          <div>
            {data.caps && <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">{data.caps}</div>}
            <h2 className="mt-2 font-serif text-2xl md:text-3xl text-wood max-w-xl">{data.title}</h2>
          </div>
          {data.ctaLabel && data.ctaUrl && (
            <a href={data.ctaUrl} className="text-forest text-sm font-semibold hover:text-forest/80">
              {data.ctaLabel}
            </a>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <a
              key={p.slug}
              href={`/shop/${p.slug}`}
              className="group block overflow-hidden rounded-2xl bg-white/50 border border-wood/8 hover:border-wood/20 transition-colors"
            >
              {p.image && (
                <div className="aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-serif text-base text-wood">{p.title}</h3>
                {p.price && <div className="mt-1 font-serif text-forest">{p.price}</div>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
