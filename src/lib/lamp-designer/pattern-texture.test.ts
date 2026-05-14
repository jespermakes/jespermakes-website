import { describe, it, expect } from "vitest";
import { getPatternDrawFn } from "./pattern-texture";
import type { PatternId } from "./types";

describe("getPatternDrawFn", () => {
  it("returns null for 'smooth'", () => {
    expect(getPatternDrawFn("smooth")).toBeNull();
  });

  it("returns null for unknown patterns", () => {
    expect(getPatternDrawFn("nonexistent" as PatternId)).toBeNull();
  });

  const patternsWithTexture: PatternId[] = [
    "vertical-lines",
    "horizontal-rings",
    "diamond-grid",
    "hexagonal",
    "organic",
  ];

  for (const id of patternsWithTexture) {
    it(`returns a draw function for '${id}'`, () => {
      const fn = getPatternDrawFn(id);
      expect(fn).toBeTypeOf("function");
    });
  }

  it("covers all non-smooth pattern ids", () => {
    for (const id of patternsWithTexture) {
      expect(getPatternDrawFn(id)).not.toBeNull();
    }
  });
});
