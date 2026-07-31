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

describe("bulbFit (crown fit, fixture-aware)", () => {
  // Default context is the E27 ring mount: crown minimum = 41/2 + 8 = 28.5,
  // so the top opening floor is 57 mm.
  it("passes when the top opening hosts the default E27 mount", () => {
    const result = bulbFit(makeShape({ topDiameter: 120 }));
    expect(result.ok).toBe(true);
    expect(result.severity).toBe("info");
  });

  it("fails when the top opening is under the crown minimum", () => {
    const result = bulbFit(makeShape({ topDiameter: 50 }));
    expect(result.ok).toBe(false);
    expect(result.severity).toBe("error");
  });

  it("honors the chosen fixture module", () => {
    // Kit 001 seat: crown minimum = 70/2 + 6 = 41 -> floor 82 mm.
    const ctx = { fixture: { moduleId: "kit001-seat" as const }, templateId: "cone" as const };
    expect(bulbFit(makeShape({ topDiameter: 70 }), ctx).ok).toBe(false);
    expect(bulbFit(makeShape({ topDiameter: 90 }), ctx).ok).toBe(true);
  });
});

describe("thermalClearance (bulb envelope, fixture-aware)", () => {
  // Cylinder shapes (top = bottom) make the sampled inner radius exact.
  it("reports the gap and per-material wattage when clearance is generous", () => {
    const result = thermalClearance(
      makeShape({ topDiameter: 200, bottomDiameter: 200, height: 200, wallThickness: 2.5 })
    );
    // inner radius 97.5, A60 radius 30 -> gap 67.5
    expect(result.ok).toBe(true);
    expect(result.severity).toBe("info");
    expect(result.value).toBeCloseTo(67.5, 1);
    expect(result.message).toContain("PLA up to 13 W");
  });

  it("errors when the wall enters the bulb zone", () => {
    const result = thermalClearance(
      makeShape({ topDiameter: 70, bottomDiameter: 70, height: 200, wallThickness: 2.5 })
    );
    // inner radius 32.5 -> gap 2.5, below the 5 mm hard floor
    expect(result.ok).toBe(false);
    expect(result.severity).toBe("error");
    expect(result.value).toBeCloseTo(2.5, 1);
  });

  it("warns PETG-only when the gap is below the PLA floor", () => {
    const result = thermalClearance(
      makeShape({ topDiameter: 90, bottomDiameter: 90, height: 200, wallThickness: 2 })
    );
    // inner radius 43 -> gap 13: under 15 mm PLA floor, PETG fine
    expect(result.ok).toBe(true);
    expect(result.severity).toBe("warn");
    expect(result.message).toContain("PETG only");
  });

  it("passes when the shade ends above the bulb zone", () => {
    const result = thermalClearance(
      makeShape({ topDiameter: 100, bottomDiameter: 100, height: 30, wallThickness: 2 })
    );
    expect(result.ok).toBe(true);
    expect(result.message).toContain("hangs free");
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
