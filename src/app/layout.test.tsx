import { describe, it, expect } from "vitest";

/**
 * Structural tests for the desktop nav Creator Tools dropdown in layout.tsx.
 * We verify expected links by inspecting the source file.
 */

import { readFileSync } from "fs";
import { join } from "path";

const source = readFileSync(
  join(__dirname, "layout.tsx"),
  "utf-8"
);

describe("Desktop nav Creator Tools dropdown", () => {
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
