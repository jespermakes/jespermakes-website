/**
 * Store hosts and the Awin link builder, with no snapshot import, so client
 * components can use them without shipping the price file to the browser.
 * Explained in bambu-shop.ts.
 */
export const AWIN_MID = "46345";
export const AWIN_AFFID = "2412491";

export type BambuStoreKey = "eu" | "us";

export interface BambuStore {
  key: BambuStoreKey;
  label: string;
  /** Host the affiliate link sends people to. */
  linkHost: string;
  currency: string;
}

export const BAMBU_STORES: Record<BambuStoreKey, BambuStore> = {
  eu: { key: "eu", label: "Bambu Lab EU store", linkHost: "eu.store.bambulab.com", currency: "EUR" },
  // store.bambulab.com is the US store, and the host the existing /tools
  // links use. us.store.bambulab.com is the same shop.
  us: { key: "us", label: "Bambu Lab US store", linkHost: "store.bambulab.com", currency: "USD" },
};

export const BAMBU_STORE_COOKIE = "bambu_store";

export function isBambuStoreKey(v: string | null | undefined): v is BambuStoreKey {
  return v === "eu" || v === "us";
}

/** Wrap any Bambu store URL in our Awin click link. */
export function awinLink(storeUrl: string): string {
  return `https://www.awin1.com/cread.php?awinmid=${AWIN_MID}&awinaffid=${AWIN_AFFID}&ued=${encodeURIComponent(storeUrl)}`;
}

export function storePageUrl(store: BambuStoreKey, handle: string): string {
  return `https://${BAMBU_STORES[store].linkHost}/products/${handle}`;
}

/** Tracked link to a product in the visitor's store. */
export function productLink(store: BambuStoreKey, handle: string): string {
  return awinLink(storePageUrl(store, handle));
}

/** Tracked link to a store collection, for the "see all of it" links. */
export function collectionLink(store: BambuStoreKey, collection: string): string {
  return awinLink(`https://${BAMBU_STORES[store].linkHost}/collections/${collection}`);
}

