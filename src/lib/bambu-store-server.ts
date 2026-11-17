import { cookies, headers } from "next/headers";
import { BAMBU_STORE_COOKIE, isBambuStoreKey, type BambuStoreKey } from "./bambu-shop";
import { REGIONS, REGION_COOKIE, isRegionKey, regionFromCountry } from "./rubio-shop";

/**
 * Which Bambu store this visitor sees. Same order as the Rubio shop
 * (rubio-region-server.ts), and it reuses that country map so the two
 * sections never disagree about where someone is:
 *
 *   1. an explicit Bambu store choice (cookie)
 *   2. an explicit Rubio region choice, mapped to its programme
 *   3. the country Vercel resolved from their IP
 *   4. the EU store
 */
export async function resolveBambuStore(): Promise<{ store: BambuStoreKey; source: "cookie" | "geo" | "default" }> {
  const jar = await cookies();
  const own = jar.get(BAMBU_STORE_COOKIE)?.value;
  if (isBambuStoreKey(own)) return { store: own, source: "cookie" };

  const rubio = jar.get(REGION_COOKIE)?.value;
  if (isRegionKey(rubio)) return { store: REGIONS[rubio].program, source: "cookie" };

  const country = (await headers()).get("x-vercel-ip-country");
  if (country) return { store: REGIONS[regionFromCountry(country)].program, source: "geo" };

  return { store: "eu", source: "default" };
}
