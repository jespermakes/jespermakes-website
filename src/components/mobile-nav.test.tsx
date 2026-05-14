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
  it("includes a link to /lamp-designer", () => {
    expect(source).toContain('href="/lamp-designer"');
  });

  it("includes Lamp Designer label text", () => {
    expect(source).toContain("Lamp Designer");
  });

  it("includes all Creator Tools links", () => {
    const expectedLinks = [
      "/studio",
      "/marketplace",
      "/title-lab",
      "/storyteller",
      "/box-joint-jig",
      "/cone-lamp",
      "/lamp-designer",
    ];
    for (const link of expectedLinks) {
      expect(source).toContain(`href="${link}"`);
    }
  });
});
