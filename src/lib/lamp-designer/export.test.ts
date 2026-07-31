import { describe, it, expect } from "vitest";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { geometryToBinaryStl } from "./export";
import { generateLampGeometry } from "./geometry";
import { getTemplate } from "./templates";

describe("geometryToBinaryStl", () => {
  it("serializes a non-indexed triangle to a valid binary STL", () => {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3),
    );

    const stl = geometryToBinaryStl(geometry);
    const view = new DataView(stl);

    expect(stl.byteLength).toBe(84 + 1 * 50);
    expect(view.getUint32(80, true)).toBe(1);
  });

  it("serializes real lamp geometry with the indexed triangle count", () => {
    const cone = getTemplate("cone");
    const geometry = generateLampGeometry(cone.profile, cone.defaultParameters);
    const index = geometry.getIndex();
    expect(index).not.toBeNull();

    const triCount = index!.count / 3;
    expect(triCount).toBeGreaterThan(100);

    const stl = geometryToBinaryStl(geometry);
    const view = new DataView(stl);

    expect(view.getUint32(80, true)).toBe(triCount);
    expect(stl.byteLength).toBe(84 + triCount * 50);

    // Spot-check: no NaN in the first triangle's normal + vertices
    for (let i = 0; i < 12; i++) {
      expect(Number.isNaN(view.getFloat32(84 + i * 4, true))).toBe(false);
    }
  });
});
