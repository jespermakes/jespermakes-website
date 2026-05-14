import { describe, it, expect } from "vitest";
import type { ShapeParameters } from "./types";
import { applySliderResistance } from "./soft-resistance";

// A shape that passes all constraints comfortably
const safeShape: ShapeParameters = {
  height: 200,
  topDiameter: 120,
  bottomDiameter: 150,
  curveTension: 0.3,
  wallThickness: 2,
};

describe("applySliderResistance", () => {
  it("returns raw value when no constraints are relevant", () => {
    // curveTension has no linked constraints
    const result = applySliderResistance(safeShape, "curveTension", 0.8, 0.01);
    expect(result).toBe(0.8);
  });

  it("returns raw value when constraints stay healthy", () => {
    // Small height change that keeps everything in info
    const result = applySliderResistance(safeShape, "height", 210, 1);
    expect(result).toBe(210);
  });

  it("returns raw value when delta is zero", () => {
    const result = applySliderResistance(safeShape, "height", 200, 1);
    expect(result).toBe(200);
  });

  it("dampens movement into warn territory", () => {
    // Very flat shape triggers proportionCheck warn (ratio < 0.5)
    // height=60 with avg diameter 135 → ratio 0.44 (warn)
    // Going from 200 → 60 should be dampened
    const result = applySliderResistance(safeShape, "height", 60, 1);
    // Should be between 60 (raw) and 200 (current) due to damping
    expect(result).toBeGreaterThan(60);
    expect(result).toBeLessThan(200);
  });

  it("dampens movement into error territory more strongly", () => {
    // Shrink both diameters to trigger bulbFit error (need ≥70mm)
    const narrowShape: ShapeParameters = {
      ...safeShape,
      topDiameter: 75,
      bottomDiameter: 75,
    };
    // Moving topDiameter from 75 → 30 triggers bulbFit error
    const result = applySliderResistance(narrowShape, "topDiameter", 30, 1);
    expect(result).toBeGreaterThan(30);
    expect(result).toBeLessThan(75);
  });

  it("error damping is stronger than warn damping", () => {
    // Create a shape near the warn boundary for proportionCheck
    const tallShape: ShapeParameters = {
      ...safeShape,
      height: 300,
      topDiameter: 100,
      bottomDiameter: 100,
    };

    // Push height up to trigger proportion warn (ratio > 2.5)
    const warnResult = applySliderResistance(tallShape, "height", 400, 1);
    const warnDelta = Math.abs(warnResult - tallShape.height);

    // Create shape near error boundary for bulbFit
    const nearErrorShape: ShapeParameters = {
      ...safeShape,
      topDiameter: 75,
      bottomDiameter: 75,
    };
    const errorResult = applySliderResistance(nearErrorShape, "topDiameter", 30, 1);
    const errorDelta = Math.abs(errorResult - nearErrorShape.topDiameter);

    // Error damping should reduce delta more (keep 30%) vs warn (keep 60%)
    const warnDamping = warnDelta / Math.abs(400 - tallShape.height);
    const errorDamping = errorDelta / Math.abs(30 - nearErrorShape.topDiameter);
    expect(errorDamping).toBeLessThan(warnDamping);
  });

  it("does not resist movement away from constraint violations", () => {
    // Start with a shape that has bulbFit error
    const badShape: ShapeParameters = {
      ...safeShape,
      topDiameter: 40,
      bottomDiameter: 40,
    };
    // Moving diameter UP should not be resisted (improving bulbFit)
    const result = applySliderResistance(badShape, "topDiameter", 120, 1);
    expect(result).toBe(120);
  });

  it("rounds result to nearest slider step", () => {
    // wallThickness has step 0.1
    const shape: ShapeParameters = {
      ...safeShape,
      wallThickness: 1.5,
    };
    // Moving toward thin wall (error at < 0.8mm)
    const result = applySliderResistance(shape, "wallThickness", 1.0, 0.1);
    // Result should be rounded to nearest 0.1
    const decimalPlaces = (result.toString().split(".")[1] || "").length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });

  it("handles all shape parameter keys without error", () => {
    const keys: (keyof ShapeParameters)[] = [
      "height",
      "topDiameter",
      "bottomDiameter",
      "curveTension",
      "wallThickness",
    ];
    for (const key of keys) {
      // Should not throw for any key
      const result = applySliderResistance(safeShape, key, safeShape[key] + 1, 1);
      expect(typeof result).toBe("number");
      expect(Number.isFinite(result)).toBe(true);
    }
  });
});
