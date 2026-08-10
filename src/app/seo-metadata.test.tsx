import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Guards against SEO regressions that are invisible in the browser but drop
 * pages out of the index. Each case here was a live bug on 2026-08-10.
 *
 * These read source rather than rendering, because Next.js resolves metadata
 * at build time by merging layout -> page, and that merge is exactly what
 * broke: a canonical in the root layout silently became every page's canonical.
 */

const appDir = __dirname;
const read = (...p: string[]) => readFileSync(join(appDir, ...p), "utf-8");

describe("canonical URLs", () => {
  it("root layout does not set a canonical (it would be inherited by every page)", () => {
    const layout = read("layout.tsx");
    const metadataBlock = layout.slice(
      layout.indexOf("export const metadata"),
      layout.indexOf("async function Header"),
    );
    expect(metadataBlock).not.toMatch(/canonical:/);
  });

  it("the homepage sets its own canonical", () => {
    expect(read("page.tsx")).toMatch(/canonical:\s*"\/"/);
  });

  it("public pages that previously inherited the homepage canonical set their own", () => {
    const pages: [string, string][] = [
      [join("marketplace", "page.tsx"), "/marketplace"],
      [join("floor-rescue", "page.tsx"), "/floor-rescue"],
      [join("mediakit", "youtube", "page.tsx"), "/mediakit/youtube"],
      [join("mediakit", "instagram", "page.tsx"), "/mediakit/instagram"],
      [join("mediakit", "facebook", "page.tsx"), "/mediakit/facebook"],
      [join("mediakit", "tiktok", "page.tsx"), "/mediakit/tiktok"],
      [join("mediakit", "in-the-rough", "page.tsx"), "/mediakit/in-the-rough"],
    ];
    for (const [file, expected] of pages) {
      expect(read(file), file).toContain(`canonical: "${expected}"`);
    }
  });
});

describe("tool category slugs", () => {
  // The nav hardcodes category slugs; the pages resolve them against
  // tool_items.category_slug in the DB. "office-youtube" was linked site-wide
  // and 404d on all 123 pages because the DB slug is "office-youtube-gear".
  const dbSlugs = [
    "festool",
    "power-tools",
    "hand-tools",
    "finishing",
    "plywood",
    "3d-printing-laser",
    "workshop-essentials",
    "office-youtube-gear",
    "gardening-outdoors",
  ];

  for (const file of ["site-header.tsx", "mobile-nav.tsx"]) {
    it(`${file} only links category slugs that exist in the DB`, () => {
      const source = readFileSync(
        join(appDir, "..", "components", file),
        "utf-8",
      );
      const linked = [...source.matchAll(/slug: "([^"]+)", icon:/g)].map(
        (m) => m[1],
      );
      expect(linked.length).toBeGreaterThan(0);
      for (const slug of linked) {
        expect(dbSlugs, `${file} links unknown category "${slug}"`).toContain(
          slug,
        );
      }
    });
  }
});

describe("sitemap", () => {
  const sitemap = read("sitemap.ts");

  it("only lists blog posts the /blog/[slug] route will actually serve", () => {
    // /blog/[slug] calls notFound() unless status === "published", so filtering
    // on `hidden` alone advertised draft posts as crawlable 404s.
    expect(sitemap).toContain('eq(blogPosts.status, "published")');
  });

  it("includes the free interactive tools", () => {
    for (const path of [
      "/cone-lamp",
      "/box-joint-jig",
      "/lamp-designer",
      "/title-lab",
      "/storyteller",
      "/marketplace",
      "/newsletter",
    ]) {
      expect(sitemap, `sitemap missing ${path}`).toContain(`${path}\``);
    }
  });

  it("does not submit noindexed routes", () => {
    // /studio sets robots noindex in its layout; submitting it contradicts that.
    expect(sitemap).not.toMatch(/\/studio`/);
    expect(existsSync(join(appDir, "studio", "(canvas)", "layout.tsx"))).toBe(
      true,
    );
  });
});
