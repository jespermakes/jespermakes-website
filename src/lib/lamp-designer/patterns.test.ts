import { describe, it, expect } from "vitest";
import type { PatternId } from "./types";
import {
  PATTERNS,
  getPattern,
  getPerforationPatterns,
  getPatternsNeedingFineLayer,
} from "./patterns";

const ALL_IDS: PatternId[] = [
  "smooth",
  "vertical-lines",
  "horizontal-rings",
  "diamond-grid",
  "hexagonal",
  "organic",
];

describe("PATTERNS", () => {
  it("contains all expected pattern IDs in order", () => {
    expect(PATTERNS.map((p) => p.id)).toEqual(ALL_IDS);
  });

  it("has unique IDs", () => {
    const ids = PATTERNS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every pattern has a non-empty name and description", () => {
    for (const p of PATTERNS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
    }
  });

  it("every pattern has valid geometry", () => {
    for (const p of PATTERNS) {
      expect(["none", "perforation", "relief"]).toContain(p.geometry.type);
      expect(p.geometry.spacingMm).toBeGreaterThanOrEqual(0);
      expect(p.geometry.sizeMm).toBeGreaterThanOrEqual(0);
      expect(p.geometry.density).toBeGreaterThanOrEqual(0);
      expect(p.geometry.density).toBeLessThanOrEqual(1);
    }
  });

  it("smooth pattern has type 'none' and zero density", () => {
    const smooth = PATTERNS.find((p) => p.id === "smooth")!;
    expect(smooth.geometry.type).toBe("none");
    expect(smooth.geometry.density).toBe(0);
    expect(smooth.geometry.createsStructure).toBe(false);
  });

  it("organic pattern has type 'relief'", () => {
    const organic = PATTERNS.find((p) => p.id === "organic")!;
    expect(organic.geometry.type).toBe("relief");
  });

  it("perforation patterns have positive spacing and size", () => {
    const perforations = PATTERNS.filter((p) => p.geometry.type === "perforation");
    expect(perforations.length).toBeGreaterThan(0);
    for (const p of perforations) {
      expect(p.geometry.spacingMm).toBeGreaterThan(0);
      expect(p.geometry.sizeMm).toBeGreaterThan(0);
    }
  });
});

describe("getPattern", () => {
  it("returns the correct pattern for each ID", () => {
    for (const id of ALL_IDS) {
      expect(getPattern(id).id).toBe(id);
    }
  });

  it("throws for an unknown pattern ID", () => {
    expect(() => getPattern("wavy" as PatternId)).toThrow("Unknown pattern: wavy");
  });
});

describe("getPerforationPatterns", () => {
  it("returns only perforation-type patterns", () => {
    const result = getPerforationPatterns();
    expect(result.length).toBe(4);
    for (const p of result) {
      expect(p.geometry.type).toBe("perforation");
    }
  });

  it("excludes smooth and organic", () => {
    const ids = getPerforationPatterns().map((p) => p.id);
    expect(ids).not.toContain("smooth");
    expect(ids).not.toContain("organic");
  });
});

describe("getPatternsNeedingFineLayer", () => {
  it("returns patterns that need fine layer height", () => {
    const result = getPatternsNeedingFineLayer();
    for (const p of result) {
      expect(p.geometry.needsFineLayer).toBe(true);
    }
  });

  it("includes smooth and horizontal-rings", () => {
    const ids = getPatternsNeedingFineLayer().map((p) => p.id);
    expect(ids).toContain("smooth");
    expect(ids).toContain("horizontal-rings");
  });
});
