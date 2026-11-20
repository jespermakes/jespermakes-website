// Consent probe: load pages in a fresh headless browser (no cookies, no
// consent given) and list every request that leaves the site's own origin,
// plus every cookie set. With --click it then clicks the first video facade
// and lists what happens after the click separately.
//
// It needs playwright-core, which is not a site dependency on purpose:
//   PW=/path/to/node_modules/playwright-core node scripts/consent-probe.cjs \
//     https://jespermakes.com / /blog/some-post --click
// For a protected Vercel preview, set BYPASS to the protection bypass secret.
const { chromium } = require(process.env.PW || "playwright-core");

const args = process.argv.slice(2);
const click = args.includes("--click");
const json = args.includes("--json");
const [base, ...paths] = args.filter((a) => !a.startsWith("--"));
const baseHost = new URL(base).host;

const isFirstParty = (host) =>
  host === baseHost || host === "jespermakes.com" || host.endsWith(".jespermakes.com");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = [];
  for (const p of paths) {
    const context = await browser.newContext({
      extraHTTPHeaders: process.env.BYPASS
        ? { "x-vercel-protection-bypass": process.env.BYPASS, "x-vercel-set-bypass-cookie": "true" }
        : {},
    });
    const page = await context.newPage();
    const before = [];
    const after = [];
    let phase = before;
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (u.protocol === "data:" || u.protocol === "blob:") return;
      phase.push({ host: u.host, url: r.url().slice(0, 160), type: r.resourceType() });
    });
    const url = base.replace(/\/$/, "") + p;
    let status = null;
    try {
      const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      status = resp && resp.status();
    } catch (e) {
      status = "ERR " + e.message.split("\n")[0];
    }
    // Scroll to the bottom so lazy iframes and images get their chance to load.
    await page
      .evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
      })
      .catch(() => {});
    await page.waitForTimeout(2500);
    const cookiesBefore = (await context.cookies()).map((c) => `${c.domain} ${c.name}`);
    const iframes = await page.$$eval("iframe", (els) => els.map((e) => e.src));
    const facades = await page.$$eval("[data-video-facade]", (els) => els.length);
    let clicked = false;
    if (click && facades > 0) {
      phase = after;
      const btn = await page.$("[data-video-facade]");
      await btn.scrollIntoViewIfNeeded();
      await btn.click();
      clicked = true;
      await page.waitForTimeout(6000);
    }
    const cookiesAfter = (await context.cookies()).map((c) => `${c.domain} ${c.name}`);
    const third = (list) => list.filter((r) => !isFirstParty(r.host));
    out.push({
      path: p,
      status,
      finalUrl: page.url(),
      requests_before_click: before.length,
      third_party_before_click: third(before),
      cookies_before_click: cookiesBefore,
      iframes_before_click: iframes,
      facades,
      clicked,
      third_party_after_click_hosts: [...new Set(third(after).map((r) => r.host))],
      iframes_after_click: clicked ? await page.$$eval("iframe", (els) => els.map((e) => e.src)) : undefined,
      cookies_after_click: clicked ? cookiesAfter : undefined,
    });
    await context.close();
  }
  await browser.close();
  if (json) {
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  for (const r of out) {
    console.log(`\n## ${r.path}  (${r.status})  -> ${r.finalUrl}`);
    console.log(
      `requests before click: ${r.requests_before_click}, third-party: ${r.third_party_before_click.length}, facades: ${r.facades}, iframes: ${r.iframes_before_click.length}`,
    );
    const hosts = {};
    for (const t of r.third_party_before_click) hosts[t.host] = (hosts[t.host] || 0) + 1;
    for (const [h, n] of Object.entries(hosts)) console.log(`  3P ${n}x ${h}`);
    for (const i of r.iframes_before_click) console.log(`  iframe ${i}`);
    console.log(`  cookies before click: ${r.cookies_before_click.join(", ") || "none"}`);
    if (r.clicked) {
      console.log(`  after click hosts: ${r.third_party_after_click_hosts.join(", ") || "none"}`);
      for (const i of r.iframes_after_click) console.log(`  iframe after click ${i}`);
      console.log(`  cookies after click: ${r.cookies_after_click.join(", ") || "none"}`);
    }
  }
})();
