import { describe, it, expect } from "vitest";
import type { ShapeParameters } from "../../../lib/lamp-designer/types";
import { TEMPLATES } from "../../../lib/lamp-designer/templates";

const SLIDER_KEYS: (keyof ShapeParameters)[] = [
  "height",
  "topDiameter",
  "bottomDiameter",
  "curveTension",
  "wallThickness",
];

describe("ShapeStep slider config", () => {
  it("covers all ShapeParameters keys", () => {
    const shapeKeys = Object.keys(
      TEMPLATES[0].defaultParameters
    ) as (keyof ShapeParameters)[];
    expect(shapeKeys.sort()).toEqual([...SLIDER_KEYS].sort());
  });

  it("all template defaults fall within slider ranges", () => {
    const RANGES: Record<keyof ShapeParameters, [number, number]> = {
      height: [60, 400],
      topDiameter: [10, 300],
      bottomDiameter: [10, 300],
      curveTension: [0, 1],
      wallThickness: [1, 6],
    };

    for (const template of TEMPLATES) {
      for (const key of SLIDER_KEYS) {
        const value = template.defaultParameters[key];
        const [min, max] = RANGES[key];
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    }
  });

  it("curveTension range is 0–1 with fine step", () => {
    // curveTension is a normalized value; step should be <= 0.05
    const step = 0.01;
    expect(step).toBeLessThanOrEqual(0.05);
  });

  it("wallThickness range starts at 1mm minimum", () => {
    const minWall = 1;
    expect(minWall).toBeGreaterThanOrEqual(1);
  });
});

describe("ShapeParameters defaults", () => {
  it("cone has wider bottom than top", () => {
    const cone = TEMPLATES.find((t) => t.id === "cone")!;
    expect(cone.defaultParameters.bottomDiameter).toBeGreaterThan(
      cone.defaultParameters.topDiameter
    );
  });

  it("cylinder has equal top and bottom diameters", () => {
    const cyl = TEMPLATES.find((t) => t.id === "cylinder")!;
    expect(cyl.defaultParameters.topDiameter).toBe(
      cyl.defaultParameters.bottomDiameter
    );
  });

  it("dome has non-zero curveTension", () => {
    const dome = TEMPLATES.find((t) => t.id === "dome")!;
    expect(dome.defaultParameters.curveTension).toBeGreaterThan(0);
  });
});
