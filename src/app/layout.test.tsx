import { describe, it, expect } from "vitest";

/**
 * Structural tests for the desktop nav Apps dropdown.
 * The nav lives in site-header.tsx (layout.tsx only renders <SiteHeader />),
 * so we inspect that source file.
 */

import { readFileSync } from "fs";
import { join } from "path";

const source = readFileSync(
  join(__dirname, "..", "components", "site-header.tsx"),
  "utf-8"
);

describe("Desktop nav Apps dropdown", () => {
  it("does not link to /lamp-designer while it is unfinished", () => {
    expect(source).not.toContain('href: "/lamp-designer"');
  });

  it("includes all Apps links", () => {
    const expectedLinks = [
      "/studio",
      "/marketplace",
      "/title-lab",
      "/storyteller",
      "/box-joint-jig",
      "/cone-lamp",
    ];
    for (const link of expectedLinks) {
      expect(source).toContain(`href: "${link}"`);
    }
  });
});
