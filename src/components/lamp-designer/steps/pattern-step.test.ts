import { describe, it, expect } from "vitest";
import type { PatternId } from "../../../lib/lamp-designer/types";
import { PATTERNS, getPattern } from "../../../lib/lamp-designer/patterns";

const ALL_PATTERNS: PatternId[] = [
  "smooth",
  "vertical-lines",
  "horizontal-rings",
  "diamond-grid",
  "hexagonal",
  "organic",
];

describe("PatternStep pattern data", () => {
  it("PATTERNS contains exactly the expected pattern IDs", () => {
    const ids = PATTERNS.map((p) => p.id);
    expect(ids).toEqual(ALL_PATTERNS);
  });

  it("each pattern has a non-empty name", () => {
    for (const pattern of PATTERNS) {
      expect(pattern.name.length).toBeGreaterThan(0);
    }
  });

  it("getPattern returns the correct pattern for each ID", () => {
    for (const id of ALL_PATTERNS) {
      const pattern = getPattern(id);
      expect(pattern.id).toBe(id);
    }
  });

  it("getPattern throws for an unknown pattern ID", () => {
    expect(() => getPattern("wavy" as PatternId)).toThrow(
      "Unknown pattern: wavy"
    );
  });

  it("pattern IDs are unique", () => {
    const ids = PATTERNS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
