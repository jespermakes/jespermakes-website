// The Phase D seed: golden-parameter matrix. Every pattern preset at
// parameter extremes, across fixtures, must produce exactly one connected,
// watertight mesh. If a generator change breaks that, this fails in CI,
// not on a user's printer.

import { describe, it, expect } from "vitest";
import { buildLampGeometryYUp } from "./build";
import { setHeightFieldForTests } from "./moonfield";
import type { HeightField } from "./moonfield";
import { buildExportGeometry } from "./export";
import { validateLampGeometry } from "./validate";
import type {
  FixtureModuleId,
  LampParameters,
  PatternId,
  ShapeParameters,
  TemplateId,
} from "./types";

const PRESETS: PatternId[] = [
  "smooth",
  "fine-ribs",
  "bold-waves",
  "spiral-twist",
  "wavy-bands",
];

const SHAPES: Record<string, ShapeParameters> = {
  default: { height: 180, topDiameter: 120, bottomDiameter: 200, curveTension: 0, wallThickness: 2.5 },
  minimal: { height: 60, topDiameter: 60, bottomDiameter: 60, curveTension: 0, wallThickness: 1 },
  maximal: { height: 400, topDiameter: 300, bottomDiameter: 300, curveTension: 0, wallThickness: 6 },
  extremeTaper: { height: 300, topDiameter: 60, bottomDiameter: 300, curveTension: 0, wallThickness: 2 },
};

const FIXTURES: FixtureModuleId[] = ["e27-clamp", "kit001-seat"];
const TEMPLATES_TO_TEST: TemplateId[] = ["cone", "dome", "cylinder"];

function params(
  templateId: TemplateId,
  shape: ShapeParameters,
  presetId: PatternId,
  moduleId: FixtureModuleId,
  intensity = 1.5
): LampParameters {
  return {
    context: "bedside",
    fixture: { moduleId },
    archetype: "vase",
    templateId,
    shape,
    light: { colorTemperature: 2700, beamAngle: 120, direction: "down" },
    pattern: { presetId, intensity },
  };
}

describe("golden matrix: every preset x shape x fixture is printable", () => {
  for (const presetId of PRESETS) {
    for (const [shapeName, shape] of Object.entries(SHAPES)) {
      for (const moduleId of FIXTURES) {
        it(`${presetId} / ${shapeName} / ${moduleId}: one watertight component`, () => {
          const geometry = buildLampGeometryYUp(
            params("cone", shape, presetId, moduleId)
          );
          const result = validateLampGeometry(geometry);
          expect(result.connectedComponents).toBe(1);
          expect(result.nonManifoldEdges).toBe(0);
          geometry.dispose();
        });
      }
    }
  }

  for (const templateId of TEMPLATES_TO_TEST) {
    it(`${templateId} silhouette with spiral twist: one watertight component`, () => {
      const geometry = buildLampGeometryYUp(
        params(templateId, SHAPES.default, "spiral-twist", "e27-clamp")
      );
      const result = validateLampGeometry(geometry);
      expect(result.connectedComponents).toBe(1);
      expect(result.nonManifoldEdges).toBe(0);
      geometry.dispose();
    });
  }
});

describe("patterns are real geometry", () => {
  it("bold waves displace the exported mesh outward vs smooth", () => {
    const smooth = buildExportGeometry(
      params("cylinder", SHAPES.default, "smooth", "e27-clamp")
    );
    const waved = buildExportGeometry(
      params("cylinder", SHAPES.default, "bold-waves", "e27-clamp", 1)
    );
    smooth.computeBoundingBox();
    waved.computeBoundingBox();
    const smoothExtent = smooth.boundingBox!.max.x - smooth.boundingBox!.min.x;
    const wavedExtent = waved.boundingBox!.max.x - waved.boundingBox!.min.x;
    expect(wavedExtent).toBeGreaterThan(smoothExtent + 5);
    smooth.dispose();
    waved.dispose();
  });

  it("modulation keeps the fixture crown circular (aperture undisturbed)", () => {
    const geometry = buildLampGeometryYUp(
      params("cylinder", SHAPES.default, "bold-waves", "e27-clamp", 1.5)
    );
    const position = geometry.getAttribute("position");
    // The aperture ring is the smallest radius in the crown plane. With
    // the crown fade in place it must stay exactly circular at 20.5 mm
    // even under maximum pattern intensity.
    const apertureRadii: number[] = [];
    for (let i = 0; i < position.count; i++) {
      if (position.getY(i) > 1) continue;
      const r = Math.hypot(position.getX(i), position.getZ(i));
      if (r < 21.5) apertureRadii.push(r);
    }
    expect(apertureRadii.length).toBeGreaterThan(0);
    const min = Math.min(...apertureRadii);
    const max = Math.max(...apertureRadii);
    expect(min).toBeCloseTo(20.5, 2);
    expect(max).toBeCloseTo(20.5, 2);
    geometry.dispose();
  });

  it("pattern depth respects the height dimension (export height unchanged)", () => {
    const geometry = buildExportGeometry(
      params("cone", SHAPES.default, "wavy-bands", "e27-clamp", 1.5)
    );
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    expect(box.max.z - box.min.z).toBeCloseTo(SHAPES.default.height, 3);
    geometry.dispose();
  });
});

describe("moon archetype (lithophane sphere)", () => {
  function moonParams(moduleId: FixtureModuleId = "kit001-seat"): LampParameters {
    return {
      ...params("cone", { ...SHAPES.default, bottomDiameter: 150 }, "smooth", moduleId),
      archetype: "moon",
    };
  }

  function gradientField(bright: number): HeightField {
    return {
      width: 8,
      height: 4,
      data: new Float32Array(32).fill(bright),
    };
  }

  it("is one watertight component on both target fixtures", () => {
    setHeightFieldForTests(gradientField(0.5));
    for (const moduleId of ["kit001-seat", "e27-clamp"] as FixtureModuleId[]) {
      const geometry = buildLampGeometryYUp(moonParams(moduleId));
      const result = validateLampGeometry(geometry);
      expect(result.connectedComponents).toBe(1);
      expect(result.nonManifoldEdges).toBe(0);
      geometry.dispose();
    }
    setHeightFieldForTests(null);
  });

  it("bright terrain prints thinner walls than dark terrain", () => {
    setHeightFieldForTests(gradientField(1));
    const bright = buildLampGeometryYUp(moonParams());
    setHeightFieldForTests(gradientField(0));
    const dark = buildLampGeometryYUp(moonParams());
    // Same outer sphere; the inner surface differs. Compare total inner
    // material via vertex distance: sample matching indices.
    const bp = bright.getAttribute("position");
    const dp = dark.getAttribute("position");
    expect(bp.count).toBe(dp.count);
    // Outer vertices are identical in both; only the inner surface moves.
    // Bright terrain = thin wall = inner surface sits further out, so the
    // mean radius across the whole buffer is strictly larger.
    let brightMean = 0;
    let darkMean = 0;
    for (let i = 0; i < bp.count; i++) {
      brightMean += Math.hypot(bp.getX(i), bp.getZ(i));
      darkMean += Math.hypot(dp.getX(i), dp.getZ(i));
    }
    brightMean /= bp.count;
    darkMean /= dp.count;
    expect(brightMean).toBeGreaterThan(darkMean + 0.3);
    bright.dispose();
    dark.dispose();
    setHeightFieldForTests(null);
  });

  it("crown aperture matches the fixture exactly, moon or not", () => {
    setHeightFieldForTests(gradientField(0.5));
    const geometry = buildLampGeometryYUp(moonParams("kit001-seat"));
    const position = geometry.getAttribute("position");
    let minR = Infinity;
    for (let i = 0; i < position.count; i++) {
      if (position.getY(i) > 0.5) continue;
      const r = Math.hypot(position.getX(i), position.getZ(i));
      if (r < 40) minR = Math.min(minR, r);
    }
    // Kit 001 aperture radius is 35
    expect(minR).toBeCloseTo(35, 1);
    geometry.dispose();
    setHeightFieldForTests(null);
  });

  it("builds a smooth sphere before the height field loads", () => {
    setHeightFieldForTests(null);
    const geometry = buildLampGeometryYUp(moonParams());
    const result = validateLampGeometry(geometry);
    expect(result.connectedComponents).toBe(1);
    expect(result.nonManifoldEdges).toBe(0);
    geometry.dispose();
  });
});
