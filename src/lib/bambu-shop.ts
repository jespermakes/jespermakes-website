/**
 * Bambu Lab section: stores, affiliate links, and the store snapshot.
 *
 * One affiliate programme (Awin, advertiser 46345, our publisher id 2412491)
 * covers both stores. The link is an Awin click URL with the real store page
 * url-encoded in `ued`, the same pattern the /tools Bambu entries already use.
 *
 * Two stores, picked per visitor:
 *   eu -> eu.store.bambulab.com (EUR)  everyone the Rubio region code calls "eu"
 *   us -> store.bambulab.com    (USD)  everyone it calls "us"
 *
 * Bambu also redirects by IP on their side, so a visitor who lands on the
 * "wrong" store still ends up in their own one. The link still has to point at
 * a real product page, which is why every handle here comes from Bambu's own
 * sitemap and is checked by scripts/bambu-verify-links.mjs.
 *
 * Prices are never typed here. They come from src/data/bambu/store-snapshot.json,
 * written by scripts/bambu-refresh.mjs, with the date and region of the check.
 */
import snapshot from "@/data/bambu/store-snapshot.json";

export {
  AWIN_MID,
  AWIN_AFFID,
  BAMBU_STORES,
  BAMBU_STORE_COOKIE,
  isBambuStoreKey,
  awinLink,
  storePageUrl,
  productLink,
  collectionLink,
} from "./bambu-links";
export type { BambuStoreKey, BambuStore } from "./bambu-links";
import { BAMBU_STORES, type BambuStoreKey } from "./bambu-links";

// ---------------------------------------------------------------- snapshot

export interface SnapshotVariant {
  sku: string;
  name: string;
  price: number;
  compareAt: number | null;
  currency: string | null;
  inStock: boolean;
  availability: string;
}

export interface SnapshotEntry {
  name: string;
  url: string;
  image: string | null;
  currency: string;
  from: number;
  to: number;
  variants: SnapshotVariant[];
  checkedAt: string;
  checkedFrom: string;
}

type Snapshot = {
  generatedAt: string | null;
  products: Record<string, Partial<Record<BambuStoreKey, SnapshotEntry>>>;
};

const SNAP = snapshot as unknown as Snapshot;

export function snapshotFor(handle: string, store: BambuStoreKey): SnapshotEntry | null {
  return SNAP.products[handle]?.[store] ?? null;
}

/** The EU entry, used for names, images and descriptions, which do not change by region. */
export function snapshotAny(handle: string): SnapshotEntry | null {
  const p = SNAP.products[handle];
  return p?.eu ?? p?.us ?? null;
}

export interface PriceView {
  /** "€179" or "€179 to €279". */
  text: string;
  from: number;
  currency: string;
  /** Bambu's own struck-through price on the cheapest variant, when it has one. */
  was: string | null;
  checkedAt: string;
  storeLabel: string;
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/**
 * The price of a product in one store, or null when we have not checked that
 * store. Null is a real answer: the page then says "see today's price" rather
 * than showing a number from the other store or from memory.
 */
export function priceFor(handle: string, store: BambuStoreKey, variantName?: string): PriceView | null {
  const e = snapshotFor(handle, store);
  if (!e) return null;
  const variants = variantName ? e.variants.filter((v) => v.name === variantName) : e.variants;
  if (variants.length === 0) return null;
  const sorted = [...variants].sort((a, b) => a.price - b.price);
  const lo = sorted[0];
  const hi = sorted[sorted.length - 1];
  const text =
    hi.price > lo.price
      ? `${formatMoney(lo.price, e.currency)} to ${formatMoney(hi.price, e.currency)}`
      : formatMoney(lo.price, e.currency);
  return {
    text,
    from: lo.price,
    currency: e.currency,
    was: lo.compareAt ? formatMoney(lo.compareAt, e.currency) : null,
    checkedAt: e.checkedAt,
    storeLabel: BAMBU_STORES[store].label,
  };
}

/** "17 November 2026", for the "checked on" line. */
export function checkedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Copenhagen" });
}

export function snapshotGeneratedAt(): string | null {
  return SNAP.generatedAt;
}
