import { describe, it, expect } from "vitest";
import {
  getPrintSettings,
  checkBulbFit,
  getDimensionSummary,
  runAllChecks,
} from "../../../lib/lamp-designer/checks";
import type { ShapeParameters, LightParameters } from "../../../lib/lamp-designer/types";

const DEFAULT_SHAPE: ShapeParameters = {
  height: 200,
  topDiameter: 120,
  bottomDiameter: 80,
  curveTension: 0.3,
  wallThickness: 2,
};

const DEFAULT_LIGHT: LightParameters = {
  colorTemperature: 2700,
  beamAngle: 60,
  direction: "down",
};

describe("getPrintSettings", () => {
  it("uses finer layer height for smooth pattern", () => {
    const settings = getPrintSettings(DEFAULT_SHAPE, "smooth");
    expect(settings.layerHeight).toBe("0.16 mm");
  });

  it("uses coarser layer height for patterned surfaces", () => {
    const settings = getPrintSettings(DEFAULT_SHAPE, "fine-ribs");
    expect(settings.layerHeight).toBe("0.20 mm");
  });

  it("reports no supports when overhang is mild", () => {
    const settings = getPrintSettings(DEFAULT_SHAPE, "smooth");
    expect(settings.supports).toBe(false);
  });

  it("reports supports needed for high curve tension", () => {
    const steep = { ...DEFAULT_SHAPE, curveTension: 0.8 };
    const settings = getPrintSettings(steep, "smooth");
    expect(settings.supports).toBe(true);
  });

  it("wall loops scale with wall thickness", () => {
    const thin = getPrintSettings({ ...DEFAULT_SHAPE, wallThickness: 1 }, "smooth");
    const thick = getPrintSettings({ ...DEFAULT_SHAPE, wallThickness: 4 }, "smooth");
    expect(thick.wallLoops).toBeGreaterThan(thin.wallLoops);
  });

  it("sets infill to 0% for patterned surfaces", () => {
    const settings = getPrintSettings(DEFAULT_SHAPE, "bold-waves");
    expect(settings.infill).toContain("0%");
  });
});

describe("checkBulbFit", () => {
  it("passes when opening is large enough for E27", () => {
    const result = checkBulbFit({ ...DEFAULT_SHAPE, topDiameter: 120 });
    expect(result.fits).toBe(true);
    expect(result.clearance).toBeGreaterThan(0);
  });

  it("fails when both openings are too small", () => {
    const result = checkBulbFit({
      ...DEFAULT_SHAPE,
      topDiameter: 50,
      bottomDiameter: 50,
    });
    expect(result.fits).toBe(false);
  });

  it("uses the larger of top/bottom diameter", () => {
    const result = checkBulbFit({
      ...DEFAULT_SHAPE,
      topDiameter: 40,
      bottomDiameter: 100,
    });
    expect(result.fits).toBe(true);
    expect(result.actualOpening).toBe(100);
  });
});

describe("getDimensionSummary", () => {
  it("returns formatted dimensions with units", () => {
    const summary = getDimensionSummary(DEFAULT_SHAPE);
    expect(summary.height).toBe("200 mm");
    expect(summary.topDiameter).toBe("120 mm");
    expect(summary.bottomDiameter).toBe("80 mm");
    expect(summary.wallThickness).toBe("2 mm");
  });

  it("overhang is ok when angle <= 45 degrees", () => {
    const summary = getDimensionSummary(DEFAULT_SHAPE);
    expect(summary.overhangOk).toBe(true);
    expect(summary.maxOverhangAngle).toBeLessThanOrEqual(45);
  });

  it("overhang is not ok for extreme taper", () => {
    const extreme = { ...DEFAULT_SHAPE, topDiameter: 300, bottomDiameter: 10, height: 50 };
    const summary = getDimensionSummary(extreme);
    expect(summary.overhangOk).toBe(false);
    expect(summary.maxOverhangAngle).toBeGreaterThan(45);
  });
});

describe("runAllChecks", () => {
  const INPUT = {
    shape: DEFAULT_SHAPE,
    light: DEFAULT_LIGHT,
    pattern: { presetId: "smooth" as const, intensity: 1 },
    fixture: { moduleId: "e27-clamp" as const },
    templateId: "cone" as const,
  };

  it("returns four sections", () => {
    const sections = runAllChecks(INPUT);
    expect(sections).toHaveLength(4);
    expect(sections.map((s) => s.title)).toEqual([
      "Dimensions",
      "Fit and heat",
      "Print settings",
      "Material plan",
    ]);
  });

  it("all items have required fields", () => {
    const sections = runAllChecks(INPUT);
    for (const section of sections) {
      for (const item of section.items) {
        expect(item.label).toBeTruthy();
        expect(item.value).toBeTruthy();
        expect(typeof item.ok).toBe("boolean");
        expect(["info", "warn", "error"]).toContain(item.severity);
      }
    }
  });

  it("flags errors when the mount does not fit", () => {
    const tiny = { ...DEFAULT_SHAPE, topDiameter: 30, bottomDiameter: 30 };
    const sections = runAllChecks({ ...INPUT, shape: tiny });
    const fitSection = sections.find((s) => s.title === "Fit and heat")!;
    expect(fitSection.items[0].ok).toBe(false);
    expect(fitSection.items[0].severity).toBe("error");
  });

  it("material plan names a concrete Bambu filament", () => {
    const sections = runAllChecks(INPUT);
    const plan = sections.find((s) => s.title === "Material plan")!;
    expect(plan.items[0].value).toContain("Bambu");
  });
});
