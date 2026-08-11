/**
 * Rubio shop: regions, affiliate refs, and link building.
 *
 * Two unrelated affiliate programs sit behind this shop (DR-199):
 *
 *   US  -> BixGrow,   param bg_ref,  store www.rubiomonocoatusa.com
 *   EU  -> UpPromote, param sca_ref, one Shopify store on per-country domains
 *
 * The European domains are the same store. Verified by fetching the same
 * product on five of them and getting identical product id 7692464914474 and
 * variant id 43512877350954 back every time, with local currency. So a single
 * EU handle plus a single sca_ref covers all of Europe, and the only thing that
 * changes per country is which domain we send them to.
 *
 * Both ref values are public by definition. They appear in every affiliate link
 * we publish, so they are constants here rather than secrets.
 */

export const US_REF_PARAM = "bg_ref";
export const US_REF = process.env.NEXT_PUBLIC_RUBIO_US_REF ?? "IAoDdNh25F";

export const EU_REF_PARAM = "sca_ref";
export const EU_REF = process.env.NEXT_PUBLIC_RUBIO_EU_REF ?? "10907821.Lg4k4U0lSMUKN";

export type RegionKey = "us" | "dk" | "uk" | "de" | "fr" | "nl" | "se";
export type Program = "us" | "eu";

export interface Region {
  key: RegionKey;
  label: string;
  flag: string;
  host: string;
  currency: string;
  program: Program;
}

export const REGIONS: Record<RegionKey, Region> = {
  us: { key: "us", label: "United States", flag: "🇺🇸", host: "www.rubiomonocoatusa.com", currency: "USD", program: "us" },
  dk: { key: "dk", label: "Danmark",       flag: "🇩🇰", host: "rubiomonocoat.dk",        currency: "DKK", program: "eu" },
  uk: { key: "uk", label: "United Kingdom",flag: "🇬🇧", host: "www.rubiomonocoat.co.uk", currency: "GBP", program: "eu" },
  de: { key: "de", label: "Europe (EUR)",  flag: "🇪🇺", host: "rubiomonocoat.de",        currency: "EUR", program: "eu" },
  fr: { key: "fr", label: "France",        flag: "🇫🇷", host: "rubiomonocoat.fr",        currency: "EUR", program: "eu" },
  nl: { key: "nl", label: "Nederland",     flag: "🇳🇱", host: "rubiomonocoat.nl",        currency: "EUR", program: "eu" },
  se: { key: "se", label: "Sverige",       flag: "🇸🇪", host: "rubiomonocoat.se",        currency: "SEK", program: "eu" },
};

/** Order shown in the region switcher. */
export const REGION_ORDER: RegionKey[] = ["dk", "de", "uk", "se", "fr", "nl", "us"];

export const DEFAULT_REGION: RegionKey = "de";

/**
 * ISO country -> region. Countries with their own Rubio domain map to it so the
 * visitor sees their own currency and shipping. Everything else in Europe falls
 * back to the EUR store; everything outside falls back to the US store, which
 * is the only other place that actually ships.
 */
const COUNTRY_TO_REGION: Record<string, RegionKey> = {
  DK: "dk",
  GB: "uk",
  SE: "se",
  FR: "fr",
  NL: "nl",
  DE: "de",
  US: "us", CA: "us", MX: "us",
  AT: "de", BE: "de", BG: "de", HR: "de", CY: "de", CZ: "de", EE: "de",
  FI: "de", GR: "de", HU: "de", IE: "de", IT: "de", LV: "de", LT: "de",
  LU: "de", MT: "de", PL: "de", PT: "de", RO: "de", SK: "de", SI: "de",
  ES: "de", NO: "de", CH: "de", IS: "de",
};

export function regionFromCountry(country: string | null | undefined): RegionKey {
  if (!country) return DEFAULT_REGION;
  const mapped = COUNTRY_TO_REGION[country.toUpperCase()];
  if (mapped) return mapped;
  // Unknown country: outside our shipping map, the US store is the better guess
  // than a European one, since it is the larger single audience.
  return "us";
}

export function isRegionKey(value: string | null | undefined): value is RegionKey {
  return !!value && Object.prototype.hasOwnProperty.call(REGIONS, value);
}

/**
 * Build a tracked product URL. Returns null when the product is not carried in
 * that region, so callers must handle the gap rather than link to a 404.
 */
export function productUrl(
  region: Region,
  handles: { usHandle?: string | null; euHandle?: string | null },
): string | null {
  const handle = region.program === "us" ? handles.usHandle : handles.euHandle;
  if (!handle) return null;
  const url = new URL(`https://${region.host}/products/${handle}`);
  if (region.program === "us") url.searchParams.set(US_REF_PARAM, US_REF);
  else url.searchParams.set(EU_REF_PARAM, EU_REF);
  return url.toString();
}

/** Tracked link to a store's front page, for "browse everything" style links. */
export function storeUrl(region: Region): string {
  const url = new URL(`https://${region.host}/`);
  if (region.program === "us") url.searchParams.set(US_REF_PARAM, US_REF);
  else url.searchParams.set(EU_REF_PARAM, EU_REF);
  return url.toString();
}

export function formatPrice(amount: string | number, currency: string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!Number.isFinite(value)) return "";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

/**
 * Turn a stored price into something safe to put next to a product photo.
 *
 * The trap this exists to close: Rubio Europe sells "Oil Plus 2C" as one
 * product whose variants are colour AND size, from a 6 mL sample at DKK 15.25
 * to a 3.5 L tin at DKK 4569.75. Rendering the cheapest as "from DKK 15.25"
 * under a photo of a 390 mL tin reads as the price of that tin. It is not.
 *
 * So: when the spread is small the product is effectively one price and we show
 * "from X". When it spans sizes we show the range, which cannot be misread.
 * Both are true statements about what Rubio charges.
 */
export function priceLabel(price: {
  min: string;
  max: string;
  currency: string;
}): { text: string; isRange: boolean } | null {
  const min = parseFloat(price.min);
  const max = parseFloat(price.max);
  if (!Number.isFinite(min) || min <= 0) return null;

  if (!Number.isFinite(max) || max <= min * 1.6) {
    return { text: formatPrice(min, price.currency), isRange: false };
  }
  // Currency once, not twice. "DKK 15.25 to 4,569.75" reads; repeating the
  // code on both ends does not.
  const decimals = max % 1 === 0 ? 0 : 2;
  const maxPlain = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(max);
  return {
    text: `${formatPrice(min, price.currency)} to ${maxPlain}`,
    isRange: true,
  };
}

export const REGION_COOKIE = "rubio_region";

/** Rubio's own brand palette, taken from their logo. Shared with /floor-rescue. */
export const RUBIO = {
  dark: "#183029",
  green: "#396948",
  gold: "#fcc52c",
} as const;
