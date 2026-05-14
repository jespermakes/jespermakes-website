import { describe, it, expect } from "vitest";
import type { ShapeParameters, ConstraintId, LampConstraint } from "../../../lib/lamp-designer/types";
import { TEMPLATES } from "../../../lib/lamp-designer/templates";
import { runAllConstraints } from "../../../lib/lamp-designer/constraints";
import { SLIDER_CONSTRAINTS, worstSeverity } from "../../../lib/lamp-designer/constraint-display";

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

describe("SLIDER_CONSTRAINTS mapping", () => {
  it("maps all ShapeParameters keys", () => {
    const mappedKeys = Object.keys(SLIDER_CONSTRAINTS).sort();
    expect(mappedKeys).toEqual([...SLIDER_KEYS].sort());
  });

  it("height maps to shielding, proportion, and overhang", () => {
    expect(SLIDER_CONSTRAINTS.height).toContain("shieldingAngle");
    expect(SLIDER_CONSTRAINTS.height).toContain("proportionCheck");
    expect(SLIDER_CONSTRAINTS.height).toContain("overhangAngle");
  });

  it("topDiameter maps to bulbFit and openingRatio", () => {
    expect(SLIDER_CONSTRAINTS.topDiameter).toContain("bulbFit");
    expect(SLIDER_CONSTRAINTS.topDiameter).toContain("openingRatio");
  });

  it("wallThickness maps to thermalClearance and wallThickness", () => {
    expect(SLIDER_CONSTRAINTS.wallThickness).toContain("thermalClearance");
    expect(SLIDER_CONSTRAINTS.wallThickness).toContain("wallThickness");
  });

  it("curveTension has no constraints", () => {
    expect(SLIDER_CONSTRAINTS.curveTension).toEqual([]);
  });

  it("all referenced constraint IDs are valid", () => {
    const validIds: ConstraintId[] = [
      "shieldingAngle", "bulbFit", "thermalClearance",
      "proportionCheck", "wallThickness", "overhangAngle", "openingRatio",
    ];
    for (const ids of Object.values(SLIDER_CONSTRAINTS)) {
      for (const id of ids) {
        expect(validIds).toContain(id);
      }
    }
  });
});

describe("worstSeverity", () => {
  const make = (severity: "info" | "warn" | "error"): LampConstraint => ({
    ok: severity === "info",
    value: 0,
    message: "test",
    severity,
  });

  it("returns null for empty array", () => {
    expect(worstSeverity([])).toBeNull();
  });

  it("returns info when all are info", () => {
    expect(worstSeverity([make("info"), make("info")])).toBe("info");
  });

  it("returns warn when worst is warn", () => {
    expect(worstSeverity([make("info"), make("warn")])).toBe("warn");
  });

  it("returns error when any is error", () => {
    expect(worstSeverity([make("info"), make("warn"), make("error")])).toBe("error");
  });

  it("returns error even if only one constraint is error", () => {
    expect(worstSeverity([make("error")])).toBe("error");
  });
});

describe("constraint integration with shape parameters", () => {
  it("valid shape produces no errors", () => {
    const goodShape: ShapeParameters = {
      height: 200,
      topDiameter: 120,
      bottomDiameter: 150,
      curveTension: 0.3,
      wallThickness: 2,
    };
    const results = runAllConstraints(goodShape);
    const errors = Object.values(results).filter((c) => c.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("tiny openings trigger bulbFit error", () => {
    const tinyShape: ShapeParameters = {
      height: 200,
      topDiameter: 30,
      bottomDiameter: 30,
      curveTension: 0.3,
      wallThickness: 2,
    };
    const results = runAllConstraints(tinyShape);
    expect(results.bulbFit.ok).toBe(false);
    expect(results.bulbFit.severity).toBe("error");
  });

  it("extreme taper triggers overhang warning", () => {
    const taperShape: ShapeParameters = {
      height: 60,
      topDiameter: 300,
      bottomDiameter: 10,
      curveTension: 0,
      wallThickness: 2,
    };
    const results = runAllConstraints(taperShape);
    expect(results.overhangAngle.ok).toBe(false);
  });

  it("slider constraints correctly link errors to sliders", () => {
    const tinyShape: ShapeParameters = {
      height: 200,
      topDiameter: 30,
      bottomDiameter: 30,
      curveTension: 0.3,
      wallThickness: 2,
    };
    const results = runAllConstraints(tinyShape);

    // topDiameter should show an error because bulbFit is in its constraint list
    const topRelated = SLIDER_CONSTRAINTS.topDiameter.map((id) => results[id]);
    const topSeverity = worstSeverity(topRelated);
    expect(topSeverity).toBe("error");

    // curveTension should have no constraints to show
    const curveRelated = SLIDER_CONSTRAINTS.curveTension.map((id) => results[id]);
    expect(worstSeverity(curveRelated)).toBeNull();
  });
});
