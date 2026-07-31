import { describe, it, expect } from "vitest";
import {
  PATTERNS,
  getPattern,
  resolveModulation,
  isFlat,
  MIN_PATTERN_INTENSITY,
  MAX_PATTERN_INTENSITY,
} from "./patterns";
import type { ShapeParameters } from "./types";

const SHAPE: ShapeParameters = {
  height: 200,
  topDiameter: 120,
  bottomDiameter: 200,
  curveTension: 0,
  wallThickness: 2.5,
};

describe("pattern presets", () => {
  it("contains the five vase-family presets", () => {
    expect(PATTERNS.map((p) => p.id)).toEqual([
      "smooth",
      "fine-ribs",
      "bold-waves",
      "spiral-twist",
      "wavy-bands",
    ]);
  });

  it("smooth resolves to a flat modulation", () => {
    const m = resolveModulation({ presetId: "smooth", intensity: 1 }, SHAPE);
    expect(isFlat(m)).toBe(true);
  });

  it("throws on unknown pattern ids", () => {
    expect(() => getPattern("nope" as never)).toThrow();
  });
});

describe("resolveModulation clamps (correct by construction)", () => {
  it("applies intensity to depths", () => {
    const base = resolveModulation({ presetId: "bold-waves", intensity: 1 }, SHAPE);
    const half = resolveModulation({ presetId: "bold-waves", intensity: 0.5 }, SHAPE);
    expect(half.waveDepth).toBeCloseTo(base.waveDepth * 0.5, 4);
  });

  it("clamps intensity to the allowed range", () => {
    const over = resolveModulation({ presetId: "bold-waves", intensity: 99 }, SHAPE);
    const max = resolveModulation(
      { presetId: "bold-waves", intensity: MAX_PATTERN_INTENSITY },
      SHAPE
    );
    expect(over.waveDepth).toBeCloseTo(max.waveDepth, 6);
    const under = resolveModulation({ presetId: "bold-waves", intensity: 0 }, SHAPE);
    const min = resolveModulation(
      { presetId: "bold-waves", intensity: MIN_PATTERN_INTENSITY },
      SHAPE
    );
    expect(under.waveDepth).toBeCloseTo(min.waveDepth, 6);
  });

  it("caps total depth at 30 percent of the smallest radius", () => {
    const narrow: ShapeParameters = { ...SHAPE, topDiameter: 40, bottomDiameter: 40 };
    const m = resolveModulation({ presetId: "bold-waves", intensity: 1.5 }, narrow);
    expect(m.waveDepth + m.bandDepth).toBeLessThanOrEqual(0.3 * 20 + 1e-9);
  });

  it("caps band depth by the overhang slope for short lamps", () => {
    const short: ShapeParameters = { ...SHAPE, height: 60 };
    const m = resolveModulation({ presetId: "wavy-bands", intensity: 1.5 }, short);
    const maxSlopeDepth = (Math.tan((50 * Math.PI) / 180) * 60) / (m.bandCount * Math.PI);
    expect(m.bandDepth).toBeLessThanOrEqual(maxSlopeDepth + 1e-9);
  });

  it("caps wave depth by wave count on small radii", () => {
    const tiny: ShapeParameters = { ...SHAPE, topDiameter: 60, bottomDiameter: 60 };
    const m = resolveModulation({ presetId: "fine-ribs", intensity: 1.5 }, tiny);
    expect(m.waveDepth).toBeLessThanOrEqual((Math.PI * 30) / (2 * m.waveCount) + 1e-9);
  });
});
