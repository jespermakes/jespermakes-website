import Link from "next/link";
import { BAMBU_STORES, checkedDate, priceFor, productLink, type BambuStoreKey } from "@/lib/bambu-shop";
import StoreSwitcher from "./store-switcher";

/** Bambu's own green, from their logo. */
export const BAMBU_GREEN = "#00AE42";

/**
 * Every link out to Bambu goes through this. rel="sponsored" on all of them,
 * the same as the Rubio shop and the /tools pages, because each one is an
 * Awin affiliate link.
 */
export function BuyLink({
  store,
  handle,
  children,
  className = "",
}: {
  store: BambuStoreKey;
  handle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={productLink(store, handle)} target="_blank" rel="sponsored noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export function BuyButton({ store, handle, label = "See it at Bambu Lab" }: { store: BambuStoreKey; handle: string; label?: string }) {
  return (
    <BuyLink
      store={store}
      handle={handle}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00AE42] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#00c94c]"
    >
      {label} <span aria-hidden>↗</span>
    </BuyLink>
  );
}

/**
 * A price in the visitor's store, or an honest blank. For a store we have not
 * checked (the US one, from a Danish IP) it says so instead of showing a number.
 */
export function Price({
  store,
  handle,
  variant,
  size = "md",
}: {
  store: BambuStoreKey;
  handle: string;
  variant?: string;
  size?: "sm" | "md" | "lg";
}) {
  const p = priceFor(handle, store, variant);
  const cls = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  if (!p) {
    return (
      <span className="text-sm text-white/50">
        Today&apos;s {BAMBU_STORES[store].currency} price at Bambu
      </span>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={`${cls} font-semibold text-white`}>{p.text}</span>
      {p.was && <span className="text-xs text-white/40 line-through">{p.was}</span>}
    </span>
  );
}

export function SectionHeader({ store, here }: { store: BambuStoreKey; here?: { label: string } }) {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-5">
        <nav className="text-sm text-white/50">
          <Link href="/" className="hover:text-white">
            Jesper Makes
          </Link>
          <span className="mx-2 text-white/25">/</span>
          {here ? (
            <>
              <Link href="/bambulab" className="hover:text-white">
                Bambu Lab
              </Link>
              <span className="mx-2 text-white/25">/</span>
              <span className="text-white/80">{here.label}</span>
            </>
          ) : (
            <span className="text-white/80">Bambu Lab</span>
          )}
        </nav>
        <StoreSwitcher current={store} />
      </div>
    </header>
  );
}

/** The affiliate line. Same wording pattern as the Rubio shop. */
export function Disclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm leading-relaxed text-white/45 ${className}`}>
      Bambu Lab is a partner of the channel and every buy link here is an affiliate link, so if you buy through one the
      channel gets a small cut and you pay the same price.
    </p>
  );
}

export function CheckedNote({ store, iso }: { store: BambuStoreKey; iso: string | null }) {
  return (
    <p className="text-xs leading-relaxed text-white/40">
      {iso ? (
        <>
          Prices as the {BAMBU_STORES[store].label} showed them on {checkedDate(iso)}.
          Bambu change prices and run sales often, so the store page always has the final word.
        </>
      ) : (
        <>
          I&apos;ve not checked the prices on the {BAMBU_STORES[store].label} yet, so the buttons take you to today&apos;s price
          there. Bambu change prices and run sales often.
        </>
      )}
    </p>
  );
}
