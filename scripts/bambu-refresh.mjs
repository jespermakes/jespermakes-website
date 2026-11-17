#!/usr/bin/env node
/**
 * Refresh the Bambu Lab section's prices and specs from Bambu's own store.
 *
 *   node scripts/bambu-refresh.mjs            # every handle, every region
 *   node scripts/bambu-refresh.mjs --region eu
 *   node scripts/bambu-refresh.mjs --only h2d,a1
 *   node scripts/bambu-refresh.mjs --missing   # only what has no value yet
 *
 * Reads the handle list from src/data/bambu/handles.json and writes
 * src/data/bambu/store-snapshot.json. Nothing on the site is typed by hand:
 * every price, variant and spec row on /bambulab comes out of that file, with
 * the date and region it was checked.
 *
 * What it reads from each product page: the <script id="product-jsonld">
 * ProductGroup, which gives variant names, price, the struck-through price,
 * availability and currency, and the hreflang en-US link, which is Bambu's own
 * statement of where the same product lives on the US store.
 *
 * Specs are NOT read here. The store pages carry a spec table that is mostly a
 * "what is in the box" list and a JSON copy of the H2D table on every page, so
 * the numbers in src/data/bambu/printers.ts come from bambulab.com's tech spec
 * pages instead, which block scripted fetches and were read in a browser.
 *
 * The geo trap: Bambu's store redirects by IP. From the Spark (Denmark) every
 * request to the US store lands on eu.store.bambulab.com. The script checks
 * the final URL and REFUSES to record a region it did not actually reach, so a
 * EUR price can never end up labelled as a USD price. Run it from a US
 * machine to fill the US side. Until then the site shows no US price and
 * links US visitors to the US store instead.
 *
 * Previous values are kept when a fetch fails, with the old checkedAt, so a
 * flaky night never blanks the page.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HANDLES = path.join(ROOT, "src/data/bambu/handles.json");
const OUT = path.join(ROOT, "src/data/bambu/store-snapshot.json");

export const STORES = {
  eu: { host: "eu.store.bambulab.com", currency: "EUR" },
  us: { host: "us.store.bambulab.com", currency: "USD" },
};

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : null;
}

/** Pull the ProductGroup JSON-LD out of a store page. */
export function parseJsonLd(html) {
  const m = html.match(/<script id="product-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function firstImage(ld) {
  const v = (ld?.hasVariant ?? []).find((x) => x.image);
  if (!v) return null;
  return Array.isArray(v.image) ? v.image[0] : v.image;
}

function variantsFrom(ld) {
  const list = ld?.hasVariant ?? (ld?.offers ? [ld] : []);
  return list.map((v) => {
    const o = Array.isArray(v.offers) ? v.offers[0] : v.offers;
    const strike = o?.priceSpecification?.price;
    const groupName = ld?.name ?? "";
    let name = v.name ?? "";
    if (groupName && name.startsWith(groupName + " - ")) name = name.slice(groupName.length + 3);
    return {
      sku: String(v.sku ?? ""),
      name,
      price: typeof o?.price === "number" ? o.price : parseFloat(o?.price),
      compareAt: strike != null && Number(strike) > Number(o?.price) ? Number(strike) : null,
      currency: o?.priceCurrency ?? null,
      inStock: /InStock|PreOrder/i.test(o?.availability ?? ""),
      availability: (o?.availability ?? "").replace("https://schema.org/", ""),
    };
  });
}

async function fetchOne(handle, regionKey) {
  const store = STORES[regionKey];
  const url = `https://${store.host}/products/${handle}`;
  let res = await fetch(url, { headers: { "user-agent": UA, "accept-language": "en" }, redirect: "follow" });
  if (res.status === 429) {
    // Rate limited. Back off once, properly, then give up on this one.
    await new Promise((r) => setTimeout(r, 45000));
    res = await fetch(url, { headers: { "user-agent": UA, "accept-language": "en" }, redirect: "follow" });
  }
  const finalHost = new URL(res.url).host;
  if (finalHost !== store.host) {
    return { ok: false, reason: `geo-redirected to ${finalHost}` };
  }
  if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
  const html = await res.text();
  const ld = parseJsonLd(html);
  if (!ld) return { ok: false, reason: "no product-jsonld on page" };
  // Bambu parks "contact sales" products (X1E) at 99999. That is not a price.
  const variants = variantsFrom(ld).filter((v) => Number.isFinite(v.price) && v.price < 99999);
  if (variants.length === 0) return { ok: false, reason: "no priced variants" };
  if (variants.some((v) => v.currency && v.currency !== store.currency)) {
    return { ok: false, reason: `currency ${variants[0].currency}, expected ${store.currency}` };
  }
  const prices = variants.map((v) => v.price);
  return {
    ok: true,
    data: {
      name: ld.name,
      url: `https://${store.host}/products/${handle}`,
      // Bambu put the picture on each variant, not on the ProductGroup. The
      // first variant is the plain printer or the first colour.
      image: (Array.isArray(ld.image) ? ld.image[0] : ld.image) ?? firstImage(ld),
      // No description: the pages never show Bambu's marketing copy, and it
      // carries long dashes the site voice gate refuses.
      currency: store.currency,
      from: Math.min(...prices),
      to: Math.max(...prices),
      variants,
      usUrl: (html.match(/<link rel="alternate" hrefLang="en-US" href="([^"]+)"/) ?? [])[1] ?? null,
      checkedAt: new Date().toISOString(),
      checkedFrom: "Spark, Denmark",
    },
  };
}

async function main() {
  const handles = JSON.parse(await fs.readFile(HANDLES, "utf8"));
  const only = arg("only")?.split(",");
  const missingOnly = process.argv.includes("--missing");
  const regions = arg("region") ? [arg("region")] : Object.keys(STORES);
  let snap = { generatedAt: null, products: {} };
  try {
    snap = JSON.parse(await fs.readFile(OUT, "utf8"));
  } catch {}

  const todo = [];
  for (const group of Object.values(handles)) for (const h of group) if (!only || only.includes(h)) todo.push(h);
  const pending = (h, regionKey) => !missingOnly || !snap.products[h]?.[regionKey];

  const failures = [];
  for (const regionKey of regions) {
    // One at a time with a pause. It is someone else's shop, not a load test,
    // and it answers 429 after about forty quick requests.
    const list = todo.filter((h) => pending(h, regionKey));
    for (let i = 0; i < list.length; i += 1) {
      await Promise.all(
        list.slice(i, i + 1).map(async (h) => {
          let r;
          try {
            r = await fetchOne(h, regionKey);
          } catch (e) {
            r = { ok: false, reason: String(e) };
          }
          snap.products[h] ??= {};
          if (r.ok) {
            snap.products[h][regionKey] = r.data;
            console.log(`ok   ${regionKey} ${h}  ${r.data.currency} ${r.data.from}${r.data.to > r.data.from ? `-${r.data.to}` : ""}`);
          } else {
            failures.push(`${regionKey} ${h}: ${r.reason}`);
            console.log(`skip ${regionKey} ${h}  ${r.reason}${snap.products[h][regionKey] ? " (kept old value)" : ""}`);
          }
        }),
      );
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  snap.generatedAt = new Date().toISOString();
  await fs.writeFile(OUT, JSON.stringify(snap, null, 1) + "\n");
  console.log(`\nwrote ${path.relative(ROOT, OUT)}; ${failures.length} skipped`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
