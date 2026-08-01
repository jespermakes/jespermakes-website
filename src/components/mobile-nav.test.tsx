import { describe, it, expect } from "vitest";

/**
 * Structural tests for the MobileNav link list.
 * We verify the expected Creator Tools links are present by
 * inspecting the source as a lightweight alternative to full
 * render tests (which would need next/link mocking).
 */

import { readFileSync } from "fs";
import { join } from "path";

const source = readFileSync(
  join(__dirname, "mobile-nav.tsx"),
  "utf-8"
);

describe("MobileNav links", () => {
  it("does not link to /lamp-designer while it is unfinished", () => {
    expect(source).not.toContain('href="/lamp-designer"');
  });

  it("includes all Creator Tools links", () => {
    const expectedLinks = [
      "/studio",
      "/marketplace",
      "/title-lab",
      "/storyteller",
      "/box-joint-jig",
      "/cone-lamp",
    ];
    for (const link of expectedLinks) {
      expect(source).toContain(`href="${link}"`);
    }
  });
});
