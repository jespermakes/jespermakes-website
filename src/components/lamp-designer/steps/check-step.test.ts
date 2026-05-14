import { describe, it, expect } from "vitest";
import {
  getMaterialRecommendations,
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

describe("getMaterialRecommendations", () => {
  it("recommends PLA for warm bulbs (<=2700K)", () => {
    const recs = getMaterialRecommendations({ ...DEFAULT_LIGHT, colorTemperature: 2400 });
    const pla = recs.find((r) => r.id === "pla");
    expect(pla?.recommended).toBe(true);
  });

  it("does not recommend PLA for hot bulbs", () => {
    const recs = getMaterialRecommendations({ ...DEFAULT_LIGHT, colorTemperature: 4000 });
    const pla = recs.find((r) => r.id === "pla");
    expect(pla?.recommended).toBe(false);
  });

  it("always recommends PETG", () => {
    for (const temp of [2000, 3000, 5000]) {
      const recs = getMaterialRecommendations({ ...DEFAULT_LIGHT, colorTemperature: temp });
      const petg = recs.find((r) => r.id === "petg");
      expect(petg?.recommended).toBe(true);
    }
  });

  it("recommends ASA for high-temperature bulbs (>=4000K)", () => {
    const recs = getMaterialRecommendations({ ...DEFAULT_LIGHT, colorTemperature: 4500 });
    const asa = recs.find((r) => r.id === "asa");
    expect(asa?.recommended).toBe(true);
  });

  it("does not recommend ASA for cool bulbs", () => {
    const recs = getMaterialRecommendations({ ...DEFAULT_LIGHT, colorTemperature: 2700 });
    const asa = recs.find((r) => r.id === "asa");
    expect(asa?.recommended).toBe(false);
  });
});

describe("getPrintSettings", () => {
  it("uses finer layer height for smooth pattern", () => {
    const settings = getPrintSettings(DEFAULT_SHAPE, "smooth");
    expect(settings.layerHeight).toBe("0.12 mm");
  });

  it("uses coarser layer height for patterned surfaces", () => {
    const settings = getPrintSettings(DEFAULT_SHAPE, "vertical-lines");
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
    const settings = getPrintSettings(DEFAULT_SHAPE, "diamond-grid");
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
  it("returns four sections", () => {
    const sections = runAllChecks(DEFAULT_SHAPE, DEFAULT_LIGHT, "smooth");
    expect(sections).toHaveLength(4);
    expect(sections.map((s) => s.title)).toEqual([
      "Dimensions",
      "Bulb compatibility",
      "Print settings",
      "Material",
    ]);
  });

  it("all items have required fields", () => {
    const sections = runAllChecks(DEFAULT_SHAPE, DEFAULT_LIGHT, "smooth");
    for (const section of sections) {
      for (const item of section.items) {
        expect(item.label).toBeTruthy();
        expect(item.value).toBeTruthy();
        expect(typeof item.ok).toBe("boolean");
        expect(["info", "warn", "error"]).toContain(item.severity);
      }
    }
  });

  it("flags errors when bulb does not fit", () => {
    const tiny = { ...DEFAULT_SHAPE, topDiameter: 30, bottomDiameter: 30 };
    const sections = runAllChecks(tiny, DEFAULT_LIGHT, "smooth");
    const bulbSection = sections.find((s) => s.title === "Bulb compatibility")!;
    expect(bulbSection.items[0].ok).toBe(false);
    expect(bulbSection.items[0].severity).toBe("error");
  });
});
