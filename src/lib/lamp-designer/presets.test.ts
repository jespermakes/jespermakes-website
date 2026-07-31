// Every preset must be a complete, printable lamp: this is the gallery's
// contract. Each one builds to a single watertight component and respects
// its fixture's crown minimum, so nothing gets silently clamped.

import { describe, it, expect } from "vitest";
import { PRESETS, getPreset } from "./presets";
import { buildLampGeometryYUp } from "./build";
import { validateLampGeometry } from "./validate";
import { getMountInterface } from "./fixtures";
import { setHeightFieldForTests } from "./moonfield";

describe("preset gallery", () => {
  it("offers at least ten designs", () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(10);
  });

  it("ids are unique", () => {
    const ids = PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getPreset throws on unknown ids", () => {
    expect(() => getPreset("nope")).toThrow();
  });

  it("covers pendant, table and accent modes", () => {
    const modes = new Set(
      PRESETS.map((p) => getMountInterface(p.parameters.fixture.moduleId).mode)
    );
    expect(modes.has("pendant")).toBe(true);
    expect(modes.has("table")).toBe(true);
    expect(modes.has("accent")).toBe(true);
  });

  for (const preset of PRESETS) {
    it(`${preset.id}: respects its fixture crown minimum`, () => {
      if (preset.parameters.archetype === "moon") return;
      const mount = getMountInterface(preset.parameters.fixture.moduleId);
      expect(preset.parameters.shape.topDiameter).toBeGreaterThanOrEqual(
        Math.ceil(mount.crownMinRadius * 2)
      );
    });

    it(`${preset.id}: builds one watertight component`, () => {
      if (preset.parameters.archetype === "moon") {
        setHeightFieldForTests({
          width: 8,
          height: 4,
          data: new Float32Array(32).fill(0.5),
        });
      }
      const geometry = buildLampGeometryYUp(preset.parameters);
      const result = validateLampGeometry(geometry);
      expect(result.connectedComponents).toBe(1);
      expect(result.nonManifoldEdges).toBe(0);
      geometry.dispose();
      setHeightFieldForTests(null);
    });
  }
});
