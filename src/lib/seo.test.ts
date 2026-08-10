import { describe, it, expect } from "vitest";
import { pageTitle, TITLE_LIMIT } from "./seo";
import { toolCategoryIntros } from "../data/tool-category-intros";

describe("pageTitle", () => {
  it("keeps the full suffix chain when it fits", () => {
    expect(pageTitle("Hand Tools", "Tools", "Jesper Makes")).toBe(
      "Hand Tools — Tools — Jesper Makes",
    );
  });

  it("drops suffixes from the right rather than truncating the subject", () => {
    // Real case: this ran to 74 characters with both suffixes attached.
    const t = pageTitle(
      "Festool KAPEX KS 120 REB Sliding Compound Miter Saw",
      "Tools",
      "Jesper Makes",
    );
    expect(t).toBe("Festool KAPEX KS 120 REB Sliding Compound Miter Saw — Tools");
    expect(t.length).toBeLessThanOrEqual(TITLE_LIMIT);
  });

  it("drops only as much as it has to", () => {
    // The brand goes, the useful context stays.
    const t = pageTitle(
      "Temple Tool Co Japanese Pull Saws (Set of 4)",
      "Tools",
      "Jesper Makes",
    );
    expect(t).toBe("Temple Tool Co Japanese Pull Saws (Set of 4) — Tools");
    expect(t.length).toBeLessThanOrEqual(TITLE_LIMIT);
  });

  it("returns an over-long subject intact rather than cutting mid-word", () => {
    // Google truncating a real sentence beats us mangling it; the fix for
    // these is a shorter post title, which is an editorial call.
    const long =
      "How I Use Music in My Videos (And Why It Matters More Than You Think)";
    expect(pageTitle(long, "Jesper Makes")).toBe(long);
  });

  it("brings previously over-long blog titles under the limit", () => {
    const wasTooLong = [
      "Best Wood for Beginners: What to Buy (and What to Avoid)",
      "Storm-Fallen Ash to Viking Table: A Full Build Guide",
      "My First Workbench Build (And Why I Still Use It)",
    ];
    for (const title of wasTooLong) {
      expect(pageTitle(title, "Jesper Makes").length).toBeLessThanOrEqual(
        TITLE_LIMIT,
      );
    }
  });
});

describe("tool category intros", () => {
  // Slugs come from tool_items.category_slug. A category with no intro renders
  // no copy and falls back to a generic description, so keep these in step.
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

  it("covers every category that has tools in it", () => {
    for (const slug of dbSlugs) {
      expect(toolCategoryIntros[slug], `no intro for "${slug}"`).toBeTruthy();
    }
  });

  it("discloses the ambassador relationship where the whole category is one", () => {
    // festool, finishing (Rubio) and plywood (WISA) are 100% ambassador
    // products. Saying so is both honest and the disclosure that belongs
    // alongside the sponsored buy links.
    for (const slug of ["festool", "finishing", "plywood"]) {
      expect(toolCategoryIntros[slug].toLowerCase()).toMatch(
        /ambassador|work with/,
      );
    }
  });

  it("gives each category enough copy to be worth indexing", () => {
    for (const [slug, intro] of Object.entries(toolCategoryIntros)) {
      expect(intro.split(/\s+/).length, `"${slug}" intro is too short`).toBeGreaterThan(30);
    }
  });
});
