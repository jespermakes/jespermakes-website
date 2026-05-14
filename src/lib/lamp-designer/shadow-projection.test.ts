import { describe, it, expect } from "vitest";
import {
  computeInnerFraction,
  computeProjectionIntensity,
  mapToPatternCoords,
} from "./shadow-projection";
import type { ShapeParameters } from "./types";

const defaultShape: ShapeParameters = {
  height: 200,
  topDiameter: 80,
  bottomDiameter: 120,
  curveTension: 0.5,
  wallThickness: 2,
};

describe("computeInnerFraction", () => {
  it("returns a value between 0 and 0.15", () => {
    const frac = computeInnerFraction(defaultShape);
    expect(frac).toBeGreaterThan(0);
    expect(frac).toBeLessThanOrEqual(0.15);
  });

  it("increases for wider lamps", () => {
    const narrow = computeInnerFraction({ ...defaultShape, bottomDiameter: 60, topDiameter: 40 });
    const wide = computeInnerFraction({ ...defaultShape, bottomDiameter: 200, topDiameter: 180 });
    expect(wide).toBeGreaterThan(narrow);
  });

  it("decreases for taller lamps", () => {
    const short = computeInnerFraction({ ...defaultShape, height: 100 });
    const tall = computeInnerFraction({ ...defaultShape, height: 400 });
    expect(tall).toBeLessThan(short);
  });

  it("is capped at 0.15", () => {
    const veryWide = computeInnerFraction({
      ...defaultShape,
      bottomDiameter: 500,
      topDiameter: 500,
      height: 50,
    });
    expect(veryWide).toBe(0.15);
  });
});

describe("computeProjectionIntensity", () => {
  const innerFrac = 0.1;

  it("returns 0 outside the projection circle", () => {
    expect(computeProjectionIntensity(1.5, 0, 0, innerFrac)).toBe(0);
  });

  it("returns 0 inside the inner radius", () => {
    expect(computeProjectionIntensity(0.05, 0, 0, innerFrac)).toBe(0);
  });

  it("returns 0 when wall is fully opaque (255)", () => {
    expect(computeProjectionIntensity(0.5, 0, 255, innerFrac)).toBe(0);
  });

  it("returns positive intensity for full opening (0) at valid distance", () => {
    const intensity = computeProjectionIntensity(0.5, 0, 0, innerFrac);
    expect(intensity).toBeGreaterThan(0);
    expect(intensity).toBeLessThanOrEqual(1);
  });

  it("intensity decreases with distance (falloff)", () => {
    const close = computeProjectionIntensity(0.3, 0, 0, innerFrac);
    const far = computeProjectionIntensity(0.9, 0, 0, innerFrac);
    expect(close).toBeGreaterThan(far);
  });

  it("partially opaque wall reduces intensity proportionally", () => {
    const full = computeProjectionIntensity(0.5, 0, 0, innerFrac);
    const half = computeProjectionIntensity(0.5, 0, 128, innerFrac);
    expect(half).toBeLessThan(full);
    expect(half).toBeGreaterThan(0);
  });

  it("fades near the inner edge", () => {
    // Just beyond innerFrac — should be faded
    const atEdge = computeProjectionIntensity(innerFrac + 0.01, 0, 0, innerFrac);
    // Well past innerFrac — should be stronger
    const pastEdge = computeProjectionIntensity(innerFrac + 0.15, 0, 0, innerFrac);
    expect(pastEdge).toBeGreaterThan(atEdge);
  });
});

describe("mapToPatternCoords", () => {
  const innerFrac = 0.1;
  const size = 512;

  it("returns coordinates within source texture bounds", () => {
    const angles = [0, Math.PI / 4, Math.PI, -Math.PI / 2];
    const distances = [0.2, 0.5, 0.8];

    for (const angle of angles) {
      for (const dist of distances) {
        const [x, y] = mapToPatternCoords(angle, dist, innerFrac, size);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThan(size);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThan(size);
      }
    }
  });

  it("maps different angles to different U coordinates", () => {
    const [x1] = mapToPatternCoords(0, 0.5, innerFrac, size);
    const [x2] = mapToPatternCoords(Math.PI / 3, 0.5, innerFrac, size);
    expect(x1).not.toBe(x2);
  });

  it("maps different distances to different V coordinates", () => {
    const [, y1] = mapToPatternCoords(0, 0.3, innerFrac, size);
    const [, y2] = mapToPatternCoords(0, 0.7, innerFrac, size);
    expect(y1).not.toBe(y2);
  });
});
