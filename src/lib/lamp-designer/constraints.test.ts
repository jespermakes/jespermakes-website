import { describe, it, expect } from "vitest";
import type { ShapeParameters } from "./types";
import {
  shieldingAngle,
  bulbFit,
  thermalClearance,
  proportionCheck,
  wallThickness,
  overhangAngle,
  openingRatio,
  runAllConstraints,
} from "./constraints";

function makeShape(overrides: Partial<ShapeParameters> = {}): ShapeParameters {
  return {
    height: 200,
    topDiameter: 120,
    bottomDiameter: 80,
    curveTension: 0.5,
    wallThickness: 2,
    ...overrides,
  };
}

describe("shieldingAngle", () => {
  it("returns ok for a tall, narrow shade (good shielding)", () => {
    const result = shieldingAngle(makeShape({ height: 200, topDiameter: 80, bottomDiameter: 80 }));
    expect(result.ok).toBe(true);
    expect(result.severity).toBe("info");
    expect(result.value).toBeGreaterThan(30);
  });

  it("warns when shielding angle is between 25 and 30 degrees", () => {
    // tan(27°) ≈ 0.51 → radius/halfHeight ≈ 1/0.51 → for height=100, radius ≈ 98
    const result = shieldingAngle(makeShape({ height: 100, topDiameter: 196, bottomDiameter: 196 }));
    expect(result.ok).toBe(true);
    expect(result.severity).toBe("warn");
  });

  it("fails when shade is too wide and short", () => {
    const result = shieldingAngle(makeShape({ height: 50, topDiameter: 300, bottomDiameter: 300 }));
    expect(result.ok).toBe(false);
    expect(result.severity).toBe("error");
  });

  it("uses the smaller opening for the angle calculation", () => {
    const narrow = shieldingAngle(makeShape({ topDiameter: 60, bottomDiameter: 200 }));
    const wide = shieldingAngle(makeShape({ topDiameter: 200, bottomDiameter: 60 }));
    expect(narrow.value).toBeCloseTo(wide.value, 5);
  });
});

describe("bulbFit", () => {
  it("passes when the larger opening is >= 70 mm", () => {
    const result = bulbFit(makeShape({ topDiameter: 120, bottomDiameter: 80 }));
    expect(result.ok).toBe(true);
    expect(result.severity).toBe("info");
  });

  it("fails when both openings are too small", () => {
    const result = bulbFit(makeShape({ topDiameter: 50, bottomDiameter: 60 }));
    expect(result.ok).toBe(false);
    expect(result.severity).toBe("error");
  });

  it("uses the larger of top/bottom diameter", () => {
    const result = bulbFit(makeShape({ topDiameter: 40, bottomDiameter: 80 }));
    expect(result.ok).toBe(true);
    expect(result.value).toBe(80);
  });
});

describe("thermalClearance", () => {
  it("passes with sufficient clearance", () => {
    const result = thermalClearance(makeShape({ topDiameter: 120, wallThickness: 2 }));
    // inner radius = 60 - 2 = 58, bulb radius = 30, gap = 28
    expect(result.ok).toBe(true);
    expect(result.value).toBe(28);
  });

  it("fails when gap is too small", () => {
    const result = thermalClearance(makeShape({ topDiameter: 72, bottomDiameter: 60, wallThickness: 4 }));
    // inner radius = 36 - 4 = 32, bulb radius = 30, gap = 2
    expect(result.ok).toBe(false);
    expect(result.value).toBe(2);
  });

  it("uses warn severity when gap is 10–19 mm", () => {
    const result = thermalClearance(makeShape({ topDiameter: 90, bottomDiameter: 60, wallThickness: 2 }));
    // inner radius = 45 - 2 = 43, bulb radius = 30, gap = 13
    expect(result.ok).toBe(false);
    expect(result.severity).toBe("warn");
  });
});

describe("proportionCheck", () => {
  it("passes for balanced proportions", () => {
    const result = proportionCheck(makeShape({ height: 150, topDiameter: 100, bottomDiameter: 100 }));
    // ratio = 150/100 = 1.5
    expect(result.ok).toBe(true);
    expect(result.value).toBeCloseTo(1.5);
  });

  it("fails when too flat", () => {
    const result = proportionCheck(makeShape({ height: 30, topDiameter: 200, bottomDiameter: 200 }));
    // ratio = 30/200 = 0.15
    expect(result.ok).toBe(false);
    expect(result.message).toContain("too flat");
  });

  it("fails when too tall", () => {
    const result = proportionCheck(makeShape({ height: 500, topDiameter: 60, bottomDiameter: 60 }));
    // ratio = 500/60 ≈ 8.33
    expect(result.ok).toBe(false);
    expect(result.message).toContain("too tall");
  });
});

describe("wallThickness", () => {
  it("passes when >= 0.8 mm", () => {
    expect(wallThickness(makeShape({ wallThickness: 0.8 })).ok).toBe(true);
    expect(wallThickness(makeShape({ wallThickness: 2.0 })).ok).toBe(true);
  });

  it("fails when < 0.8 mm", () => {
    const result = wallThickness(makeShape({ wallThickness: 0.5 }));
    expect(result.ok).toBe(false);
    expect(result.severity).toBe("error");
  });
});

describe("overhangAngle", () => {
  it("passes for gentle slopes", () => {
    const result = overhangAngle(makeShape({ height: 200, topDiameter: 100, bottomDiameter: 120 }));
    // radiusDiff = 10, angle = atan2(10, 200) ≈ 2.9°
    expect(result.ok).toBe(true);
  });

  it("fails when slope exceeds 45 degrees", () => {
    const result = overhangAngle(makeShape({ height: 50, topDiameter: 200, bottomDiameter: 60 }));
    // radiusDiff = 70, angle = atan2(70, 50) ≈ 54°
    expect(result.ok).toBe(false);
    expect(result.severity).toBe("warn");
  });

  it("is exactly 45° at the boundary", () => {
    const result = overhangAngle(makeShape({ height: 100, topDiameter: 300, bottomDiameter: 100 }));
    // radiusDiff = 100, angle = atan2(100, 100) = 45°
    expect(result.ok).toBe(true);
    expect(result.value).toBeCloseTo(45);
  });
});

describe("openingRatio", () => {
  it("passes for ratio in range 0.2–1.5", () => {
    const result = openingRatio(makeShape({ topDiameter: 100, bottomDiameter: 100 }));
    expect(result.ok).toBe(true);
    expect(result.value).toBeCloseTo(1.0);
  });

  it("fails when top is too narrow relative to bottom", () => {
    const result = openingRatio(makeShape({ topDiameter: 10, bottomDiameter: 200 }));
    // ratio = 0.05
    expect(result.ok).toBe(false);
    expect(result.message).toContain("top too narrow");
  });

  it("fails when top is too wide relative to bottom", () => {
    const result = openingRatio(makeShape({ topDiameter: 200, bottomDiameter: 50 }));
    // ratio = 4.0
    expect(result.ok).toBe(false);
    expect(result.message).toContain("top too wide");
  });
});

describe("runAllConstraints", () => {
  it("returns results for all seven constraint IDs", () => {
    const results = runAllConstraints(makeShape());
    const ids = Object.keys(results);
    expect(ids).toHaveLength(7);
    expect(ids).toContain("shieldingAngle");
    expect(ids).toContain("bulbFit");
    expect(ids).toContain("thermalClearance");
    expect(ids).toContain("proportionCheck");
    expect(ids).toContain("wallThickness");
    expect(ids).toContain("overhangAngle");
    expect(ids).toContain("openingRatio");
  });

  it("each result has the correct shape", () => {
    const results = runAllConstraints(makeShape());
    for (const result of Object.values(results)) {
      expect(result).toHaveProperty("ok");
      expect(result).toHaveProperty("value");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("severity");
      expect(typeof result.ok).toBe("boolean");
      expect(typeof result.value).toBe("number");
      expect(typeof result.message).toBe("string");
      expect(["info", "warn", "error"]).toContain(result.severity);
    }
  });

  it("all constraints pass for a well-proportioned shade", () => {
    const good = makeShape({
      height: 200,
      topDiameter: 120,
      bottomDiameter: 100,
      wallThickness: 2,
    });
    const results = runAllConstraints(good);
    for (const [id, result] of Object.entries(results)) {
      expect(result.ok, `${id} should pass`).toBe(true);
    }
  });
});
