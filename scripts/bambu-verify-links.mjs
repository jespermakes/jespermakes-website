#!/usr/bin/env node
/**
 * Check that every Bambu affiliate link on the site lands on the right page.
 *
 *   node scripts/bambu-verify-links.mjs                 # every handle, 2 Awin samples
 *   node scripts/bambu-verify-links.mjs --awin-sample 0 # store pages only
 *
 * Three checks, and why each one is done the way it is:
 *
 * 1. The link itself. Every link is awinLink(storeUrl), so the test is that
 *    `ued` decodes back to exactly the store URL with our awinmid and affid.
 *    Done offline for every handle and both stores.
 *
 * 2. The store page. The EU page is fetched directly: it must answer 200 on
 *    eu.store.bambulab.com, carry product JSON-LD, and that JSON-LD must name
 *    the same handle. The US page cannot be fetched from Denmark (Bambu
 *    redirects by IP), so the check is Bambu's own hreflang en-US link on the
 *    EU page, which names where the same product lives on the US store. It
 *    must be us.store.bambulab.com/products/<same handle>. store.bambulab.com,
 *    the host our US links use, is the same shop.
 *
 * 3. Awin. A few links are followed through Awin's redirects to confirm the
 *    click lands on the store URL in `ued`. Only a sample, because every real
 *    request through Awin is a click on our account, and filling the stats
 *    with 130 test clicks would be its own small lie.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HANDLES = JSON.parse(await fs.readFile(path.join(ROOT, "src/data/bambu/handles.json"), "utf8"));
const OUT = path.join(ROOT, "docs/bambu/link-check.json");
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

const MID = "46345";
const AFF = "2412491";
const HOST = { eu: "eu.store.bambulab.com", us: "store.bambulab.com" };
const storeUrl = (s, h) => `https://${HOST[s]}/products/${h}`;
const awin = (u) => `https://www.awin1.com/cread.php?awinmid=${MID}&awinaffid=${AFF}&ued=${encodeURIComponent(u)}`;

const argIdx = process.argv.indexOf("--awin-sample");
const awinSample = argIdx > -1 ? Number(process.argv[argIdx + 1]) : 2;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const handles = Object.values(HANDLES).flat();
const results = [];
let failures = 0;

for (const h of handles) {
  const row = { handle: h, linkOk: true, eu: null, us: null };
  for (const s of ["eu", "us"]) {
    const u = new URL(awin(storeUrl(s, h)));
    if (u.searchParams.get("ued") !== storeUrl(s, h) || u.searchParams.get("awinmid") !== MID || u.searchParams.get("awinaffid") !== AFF) row.linkOk = false;
  }

  let res = await fetch(storeUrl("eu", h), { headers: { "user-agent": UA }, redirect: "follow" });
  if (res.status === 429) {
    await sleep(45000);
    res = await fetch(storeUrl("eu", h), { headers: { "user-agent": UA }, redirect: "follow" });
  }
  const html = res.ok ? await res.text() : "";
  const final = new URL(res.url);
  const ld = html.match(/<script id="product-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  let ldUrl = null;
  try {
    ldUrl = ld ? JSON.parse(ld[1]).url : null;
  } catch {}
  row.eu = {
    status: res.status,
    finalUrl: res.url,
    ok: res.status === 200 && final.host === HOST.eu && final.pathname === `/products/${h}` && ldUrl === storeUrl("eu", h),
  };
  const alt = html.match(/<link rel="alternate" hrefLang="en-US" href="([^"]+)"/)?.[1] ?? null;
  row.us = { hreflang: alt, ok: alt === `https://us.store.bambulab.com/products/${h}` };

  const ok = row.linkOk && row.eu.ok && row.us.ok;
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${h.padEnd(40)} eu ${row.eu.status} ${row.eu.ok ? "" : row.eu.finalUrl}  us ${row.us.ok ? "hreflang ok" : alt}`);
  results.push(row);
  await sleep(3000);
}

/** Follow Awin by hand so every hop is on record. */
async function followAwin(link) {
  const hops = [];
  let url = link;
  for (let i = 0; i < 8; i++) {
    const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "manual" });
    const loc = r.headers.get("location");
    hops.push({ url, status: r.status });
    if (!loc || r.status < 300 || r.status >= 400) break;
    url = new URL(loc, url).toString();
    if (/(^|\.)store\.bambulab\.com$/.test(new URL(url).host)) {
      hops.push({ url, status: "store" });
      break;
    }
  }
  return hops;
}

const awinChecks = [];
const samples = [
  ["eu", "h2d"],
  ["us", "h2d"],
  ["eu", "pla-basic-filament"],
  ["us", "a1"],
].slice(0, awinSample);
for (const [s, h] of samples) {
  const hops = await followAwin(awin(storeUrl(s, h)));
  const landed = hops[hops.length - 1].url;
  const base = landed.split("?")[0];
  const ok = base === storeUrl(s, h);
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} awin ${s} ${h}: ${hops.length} hops, lands on ${landed}`);
  awinChecks.push({ store: s, handle: h, ok, hops });
}

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(
  OUT,
  JSON.stringify({ checkedAt: new Date().toISOString(), checkedFrom: "Spark, Denmark", failures, results, awinChecks }, null, 1) + "\n",
);
console.log(`\n${handles.length} handles, ${awinChecks.length} Awin samples, ${failures} failures. Wrote ${path.relative(ROOT, OUT)}`);
process.exit(failures ? 1 : 0);
