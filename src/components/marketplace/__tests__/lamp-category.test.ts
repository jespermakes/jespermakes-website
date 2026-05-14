import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Ensures the "lamp" category is present in every place that defines
 * marketplace categories, so they stay in sync.
 */

function readSrc(relPath: string): string {
  return readFileSync(join(__dirname, "../../..", relPath), "utf-8");
}

describe("Lamp marketplace category", () => {
  it("is listed in filter-bar CATEGORIES", () => {
    const src = readSrc("components/marketplace/filter-bar.tsx");
    expect(src).toContain('"lamp"');
    expect(src).toContain('"Lamp"');
  });

  it("is listed in publish-modal CATEGORIES", () => {
    const src = readSrc("components/studio/publish-modal.tsx");
    expect(src).toContain('"lamp"');
  });

  it("is in marketplace page VALID_CATEGORIES", () => {
    const src = readSrc("app/marketplace/page.tsx");
    expect(src).toContain('"lamp"');
  });

  it("is in marketplace API VALID_CATEGORIES", () => {
    const src = readSrc("app/api/marketplace/designs/route.ts");
    expect(src).toContain('"lamp"');
  });

  it("has an icon in CATEGORY_ICONS", () => {
    const src = readSrc("components/marketplace/design-card.tsx");
    expect(src).toMatch(/lamp:\s*"/);
  });
});
