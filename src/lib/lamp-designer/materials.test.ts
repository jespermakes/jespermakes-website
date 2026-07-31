import { describe, it, expect } from "vitest";
import { recommendLampPlan } from "./materials";
import type { LampPlanInput } from "./materials";
import type { ShapeParameters } from "./types";

const ROOMY: ShapeParameters = {
  height: 200,
  topDiameter: 200,
  bottomDiameter: 200,
  curveTension: 0,
  wallThickness: 1.6,
};

function input(overrides: Partial<LampPlanInput> = {}): LampPlanInput {
  return {
    shape: ROOMY,
    light: { colorTemperature: 2700, beamAngle: 120, direction: "down" },
    pattern: { presetId: "smooth", intensity: 1 },
    fixture: { moduleId: "e27-clamp" },
    templateId: "cone",
    ...overrides,
  };
}

describe("recommendLampPlan", () => {
  it("warm smooth shades get PLA Translucent", () => {
    const plan = recommendLampPlan(input());
    expect(plan.filamentName).toContain("PLA Translucent");
    expect(plan.petgRequired).toBe(false);
    expect(plan.material).toBe("pla");
  });

  it("warm patterned shades get white PLA", () => {
    const plan = recommendLampPlan(
      input({ pattern: { presetId: "bold-waves", intensity: 1 } })
    );
    expect(plan.filamentName).toContain("Jade White");
  });

  it("neutral light gets matte white", () => {
    const plan = recommendLampPlan(
      input({ light: { colorTemperature: 4000, beamAngle: 120, direction: "down" } })
    );
    expect(plan.filamentName).toContain("PLA Matte");
    expect(plan.bulbSpec).toContain("4000 K");
  });

  it("tight bulb gaps force PETG", () => {
    const plan = recommendLampPlan(
      input({ shape: { ...ROOMY, topDiameter: 90, bottomDiameter: 90 } })
    );
    // Gap ~13 mm: below the PLA floor, inside PETG's
    expect(plan.petgRequired).toBe(true);
    expect(plan.material).toBe("petg");
    expect(plan.filamentName).toContain("PETG");
    expect(plan.maxWattPla).toBe(0);
    expect(plan.maxWattPetg).toBeGreaterThan(0);
  });

  it("the wattage in the bulb spec matches the chosen material", () => {
    const plan = recommendLampPlan(input());
    expect(plan.bulbSpec).toContain(`up to ${plan.maxWattPla} W`);
    const petgPlan = recommendLampPlan(
      input({ shape: { ...ROOMY, topDiameter: 90, bottomDiameter: 90 } })
    );
    expect(petgPlan.bulbSpec).toContain(`up to ${petgPlan.maxWattPetg} W`);
  });

  it("Kit 001 lamps are material-free and capped at 5 W", () => {
    const plan = recommendLampPlan(
      input({ fixture: { moduleId: "kit001-seat" } })
    );
    expect(plan.material).toBe("any");
    expect(plan.maxWattPla).toBe(5);
    expect(plan.bulbSpec).toContain("Kit 001");
  });

  it("shades ending above the bulb allow any wattage", () => {
    const plan = recommendLampPlan(
      input({ shape: { ...ROOMY, height: 30 } })
    );
    expect(plan.gapMm).toBe(Number.POSITIVE_INFINITY);
    expect(plan.bulbSpec).toContain("any household LED");
  });

  it("wall advice tracks thickness bands", () => {
    const thin = recommendLampPlan(input({ shape: { ...ROOMY, wallThickness: 1 } }));
    const mid = recommendLampPlan(input({ shape: { ...ROOMY, wallThickness: 1.6 } }));
    const thick = recommendLampPlan(input({ shape: { ...ROOMY, wallThickness: 4 } }));
    expect(thin.wallAdvice).toContain("hotspot");
    expect(mid.wallAdvice).toContain("sweet spot");
    expect(thick.wallAdvice).toContain("opaque");
  });
});
