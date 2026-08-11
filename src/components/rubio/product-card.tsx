import Link from "next/link";
import { formatPrice, productUrl, type Region } from "@/lib/rubio-shop";
import type { RubioProduct, RubioPrice } from "@/lib/db/schema";

export function priceFor(product: RubioProduct, region: Region): RubioPrice | null {
  const prices = (product.prices ?? {}) as Record<string, RubioPrice>;
  return prices[region.key] ?? null;
}

/**
 * A product tile. Links to our own product page rather than straight out to
 * Rubio, so there is somewhere to put the colour grid, the video and the
 * context before the buy decision.
 */
export default function ProductCard({
  product,
  region,
}: {
  product: RubioProduct;
  region: Region;
}) {
  const price = priceFor(product, region);
  const carried = region.program === "us" ? !!product.usHandle : !!product.euHandle;

  return (
    <Link
      href={`/rubio/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all hover:border-[#fcc52c]/50 hover:bg-white/[0.07]"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-black/15">🪵</div>
        )}
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-[#fcc52c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#183029]">
            {product.slug === "matcha-green" ? "My colour" : "Favourite"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-medium leading-snug text-white">{product.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">{product.blurb}</p>

        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
          {price ? (
            <span className="text-sm font-semibold text-white">
              <span className="text-[11px] font-normal uppercase tracking-wide text-white/40">from </span>
              {formatPrice(price.amount, price.currency)}
            </span>
          ) : (
            <span className="text-xs text-white/40">{carried ? "Price at Rubio" : "US store only"}</span>
          )}
          <span className="text-xs font-semibold text-[#fcc52c] opacity-0 transition-opacity group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Straight-to-Rubio button. Always rel="sponsored", these are affiliate links. */
export function BuyButton({
  product,
  region,
  className = "",
  label,
}: {
  product: RubioProduct;
  region: Region;
  className?: string;
  label?: string;
}) {
  const href = productUrl(region, { usHandle: product.usHandle, euHandle: product.euHandle });
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={
        "inline-flex items-center justify-center gap-2 rounded-xl bg-[#fcc52c] px-6 py-3.5 text-sm font-bold text-[#183029] transition-colors hover:bg-[#ffd457] " +
        className
      }
    >
      {label ?? `Buy at Rubio ${region.program === "us" ? "US" : "Europe"}`}
      <span aria-hidden>→</span>
    </a>
  );
}
