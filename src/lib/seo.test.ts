import { describe, it, expect } from "vitest";
import {
  pageTitle,
  TITLE_LIMIT,
  TITLE_SEPARATOR,
  BRAND,
  CATEGORY_TITLES,
} from "./seo";
import { toolCategoryIntros } from "../data/tool-category-intros";

describe("no em dashes", () => {
  // Jesper's standing rule. A separator inside a title template is worth
  // hundreds of pages: joining with " — " put an em dash on 116 of 137 titles,
  // two of them on every tool category page.
  it("the title separator is not an em dash", () => {
    expect(TITLE_SEPARATOR).not.toContain("—");
    expect(TITLE_SEPARATOR).toBe(" | ");
  });

  it("no category title contains one", () => {
    for (const [slug, title] of Object.entries(CATEGORY_TITLES)) {
      expect(title, `category title "${slug}"`).not.toContain("—");
    }
  });

  it("no category intro contains one", () => {
    for (const [slug, intro] of Object.entries(toolCategoryIntros)) {
      expect(intro, `category intro "${slug}"`).not.toContain("—");
    }
  });

  it("pageTitle cannot produce one", () => {
    expect(pageTitle("Anything", "Tools", BRAND)).not.toContain("—");
  });
});

describe("pageTitle", () => {
  it("joins with a pipe", () => {
    expect(pageTitle("Get in touch", BRAND)).toBe("Get in touch | Jesper Makes");
  });

  it("drops the brand rather than truncating a long subject", () => {
    const t = pageTitle("Festool KAPEX KS 120 REB Sliding Compound Miter Saw", BRAND);
    expect(t).toBe("Festool KAPEX KS 120 REB Sliding Compound Miter Saw");
    expect(t.length).toBeLessThanOrEqual(TITLE_LIMIT);
  });

  it("keeps the brand when it fits", () => {
    const t = pageTitle("Festool DOMINO DF 500", BRAND);
    expect(t).toBe("Festool DOMINO DF 500 | Jesper Makes");
    expect(t.length).toBeLessThanOrEqual(TITLE_LIMIT);
  });

  it("returns an over-long subject intact rather than cutting mid-word", () => {
    // Google truncating a real sentence beats us mangling it; the fix for
    // these is a shorter post title, which is an editorial call.
    const long =
      "How I Use Music in My Videos (And Why It Matters More Than You Think)";
    expect(pageTitle(long, BRAND)).toBe(long);
  });

  it("brings previously over-long titles under the limit", () => {
    for (const title of [
      "Best Wood for Beginners: What to Buy (and What to Avoid)",
      "Storm-Fallen Ash to Viking Table: A Full Build Guide",
      "Temple Tool Co Japanese Pull Saws (Set of 4)",
    ]) {
      expect(pageTitle(title, BRAND).length).toBeLessThanOrEqual(TITLE_LIMIT);
    }
  });
});

describe("tool category pages", () => {
  // Slugs come from tool_items.category_slug.
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

  it("every category has a written title and intro", () => {
    for (const slug of dbSlugs) {
      expect(CATEGORY_TITLES[slug], `no title for "${slug}"`).toBeTruthy();
      expect(toolCategoryIntros[slug], `no intro for "${slug}"`).toBeTruthy();
    }
  });

  it("category titles say something beyond the category name", () => {
    // "Festool | Tools | Jesper Makes" was three nouns and no information.
    for (const [slug, title] of Object.entries(CATEGORY_TITLES)) {
      expect(
        title.split(/\s+/).length,
        `category title "${slug}" is too terse`,
      ).toBeGreaterThan(3);
    }
  });

  it("titles still fit once the brand is appended", () => {
    for (const [slug, title] of Object.entries(CATEGORY_TITLES)) {
      expect(
        pageTitle(title, BRAND).length,
        `category title "${slug}" overflows`,
      ).toBeLessThanOrEqual(TITLE_LIMIT);
    }
  });

  it("discloses the ambassador relationship where the whole category is one", () => {
    for (const slug of ["festool", "finishing", "plywood"]) {
      expect(toolCategoryIntros[slug].toLowerCase()).toMatch(
        /ambassador|work with/,
      );
    }
  });

  it("gives each category enough copy to be worth indexing", () => {
    for (const [slug, intro] of Object.entries(toolCategoryIntros)) {
      expect(
        intro.split(/\s+/).length,
        `"${slug}" intro is too short`,
      ).toBeGreaterThan(30);
    }
  });
});
