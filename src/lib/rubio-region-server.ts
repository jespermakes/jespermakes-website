import { cookies, headers } from "next/headers";
import {
  DEFAULT_REGION,
  REGIONS,
  REGION_COOKIE,
  isRegionKey,
  regionFromCountry,
  type Region,
  type RegionKey,
} from "./rubio-shop";

/**
 * Which Rubio store this visitor should see.
 *
 * Order: an explicit choice they made (cookie) always wins, then the country
 * Vercel resolved from their IP, then the EUR store. The explicit choice has to
 * win, otherwise anyone who switches gets bounced back on the next page load.
 */
export async function resolveRegion(): Promise<{ region: Region; source: "cookie" | "geo" | "default" }> {
  const chosen = (await cookies()).get(REGION_COOKIE)?.value;
  if (isRegionKey(chosen)) {
    return { region: REGIONS[chosen], source: "cookie" };
  }

  const country = (await headers()).get("x-vercel-ip-country");
  if (country) {
    return { region: REGIONS[regionFromCountry(country)], source: "geo" };
  }

  return { region: REGIONS[DEFAULT_REGION as RegionKey], source: "default" };
}
