import { describe, it, expect } from "vitest";
import {
  FIXTURE_MODULES,
  getFixtureModule,
  getMountInterface,
  maxLedWatt,
  cappedWatt,
} from "./fixtures";
import { buildLampAssemblyProfile, clampShapeToFixture, getTemplate } from "./templates";
import { buildFitCouponGeometry } from "./export";
import type { ShapeParameters } from "./types";

describe("fixture registry", () => {
  it("contains the five Phase A modules", () => {
    expect(FIXTURE_MODULES.map((m) => m.id)).toEqual([
      "e27-clamp",
      "ikea-slip",
      "e14-clamp",
      "stem-m10",
      "kit001-seat",
    ]);
  });

  it("holds the researched aperture dimensions", () => {
    expect(getFixtureModule("e27-clamp").apertureDiameter).toBe(41.0);
    expect(getFixtureModule("ikea-slip").apertureDiameter).toBe(45.0);
    expect(getFixtureModule("e14-clamp").apertureDiameter).toBe(29.0);
    expect(getFixtureModule("stem-m10").apertureDiameter).toBe(10.4);
  });

  it("derives the crown minimum radius", () => {
    const mount = getMountInterface("e27-clamp");
    expect(mount.crownMinRadius).toBeCloseTo(41 / 2 + 8);
  });

  it("throws on unknown module ids", () => {
    expect(() => getFixtureModule("nope" as never)).toThrow();
  });
});

describe("heat gating", () => {
  it("maps clearance to wattage per material", () => {
    expect(maxLedWatt(67, "pla")).toBe(13);
    expect(maxLedWatt(30, "pla")).toBe(7);
    expect(maxLedWatt(13, "pla")).toBe(0);
    expect(maxLedWatt(13, "petg")).toBe(4);
    expect(maxLedWatt(30, "petg")).toBe(13);
  });

  it("applies module hardware caps", () => {
    expect(cappedWatt(13, "ikea-slip")).toBe(13);
    expect(cappedWatt(13, "kit001-seat")).toBe(5);
    expect(cappedWatt(13, "e27-clamp")).toBe(13);
  });
});

describe("assembly profile (fixture crown first)", () => {
  const shape: ShapeParameters = {
    height: 200,
    topDiameter: 120,
    bottomDiameter: 200,
    curveTension: 0,
    wallThickness: 2.5,
  };

  it("starts at the mount aperture and runs the crown to the shade top", () => {
    const profile = buildLampAssemblyProfile({
      templateId: "cone",
      shape,
      fixture: { moduleId: "e27-clamp" },
    });
    expect(profile[0].x).toBeCloseTo(20.5);
    expect(profile[0].y).toBe(0);
    expect(profile[1].x).toBeCloseTo(60);
    expect(profile[1].y).toBeCloseTo(0);
  });

  it("clamps the shade top opening up to the crown minimum", () => {
    const clamped = clampShapeToFixture(
      { ...shape, topDiameter: 30 },
      "kit001-seat"
    );
    expect(clamped.topDiameter).toBe(82);
  });

  it("keeps user shapes untouched when they already fit", () => {
    const clamped = clampShapeToFixture(shape, "e27-clamp");
    expect(clamped).toBe(shape);
  });

  it("keeps the shade profile identical behind the crown", () => {
    const profile = buildLampAssemblyProfile({
      templateId: "cone",
      shape,
      fixture: { moduleId: "e27-clamp" },
    });
    const template = getTemplate("cone");
    expect(profile).toHaveLength(template.profile.length + 1);
    const last = profile[profile.length - 1];
    expect(last.x).toBeCloseTo(100);
    expect(last.y).toBeCloseTo(200);
  });
});

describe("fit coupon", () => {
  it("builds a small Z-up ring for each module", () => {
    for (const mod of FIXTURE_MODULES) {
      const geometry = buildFitCouponGeometry(mod.id);
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      const innerDiameter = mod.apertureDiameter;
      // Radial extent: aperture + land + 4 mm flare, both sides.
      const expectedOuter = (innerDiameter / 2 + mod.landWidth + 4) * 2;
      expect(box.max.x - box.min.x).toBeCloseTo(expectedOuter, 1);
      // Height along Z after the Z-up rotation: 6 mm skirt + wall offset.
      expect(box.max.z - box.min.z).toBeLessThanOrEqual(9);
      expect(box.max.z - box.min.z).toBeGreaterThanOrEqual(6);
      geometry.dispose();
    }
  });
});
