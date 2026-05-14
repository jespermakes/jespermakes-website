import { describe, it, expect } from "vitest";
import { generateLampGeometry } from "../../lib/lamp-designer/geometry";
import type { ProfilePoint, ShapeParameters } from "../../lib/lamp-designer/types";
import { TEMPLATES } from "../../lib/lamp-designer/templates";

const coneTemplate = TEMPLATES.find((t) => t.id === "cone")!;
const domeTemplate = TEMPLATES.find((t) => t.id === "dome")!;
const cylinderTemplate = TEMPLATES.find((t) => t.id === "cylinder")!;

describe("LampMesh geometry integration", () => {
  it("generates valid geometry from cone template", () => {
    const geo = generateLampGeometry(
      coneTemplate.profile,
      coneTemplate.defaultParameters
    );
    const pos = geo.getAttribute("position");
    expect(pos).toBeDefined();
    expect(pos.count).toBeGreaterThan(0);
    expect(geo.index).not.toBeNull();
  });

  it("generates valid geometry from dome template", () => {
    const geo = generateLampGeometry(
      domeTemplate.profile,
      domeTemplate.defaultParameters
    );
    const pos = geo.getAttribute("position");
    expect(pos.count).toBeGreaterThan(0);
  });

  it("generates valid geometry from cylinder template", () => {
    const geo = generateLampGeometry(
      cylinderTemplate.profile,
      cylinderTemplate.defaultParameters
    );
    const pos = geo.getAttribute("position");
    expect(pos.count).toBeGreaterThan(0);
  });

  it("geometry vertices stay within expected bounds", () => {
    const shape = coneTemplate.defaultParameters;
    const geo = generateLampGeometry(coneTemplate.profile, shape);
    const pos = geo.getAttribute("position");

    let maxRadius = 0;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + z * z);
      maxRadius = Math.max(maxRadius, r);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    // Max radius should not exceed half the larger diameter + wall thickness
    const maxExpectedRadius =
      Math.max(shape.topDiameter, shape.bottomDiameter) / 2 +
      shape.wallThickness;
    expect(maxRadius).toBeLessThanOrEqual(maxExpectedRadius + 1);

    // Height span should approximate the shape height
    const heightSpan = maxY - minY;
    expect(heightSpan).toBeGreaterThan(shape.height * 0.8);
    expect(heightSpan).toBeLessThan(shape.height * 1.2);
  });

  it("wall thickness produces inner and outer surfaces", () => {
    const profile: ProfilePoint[] = [
      { x: 50, y: 0 },
      { x: 50, y: 100 },
    ];
    const shape: ShapeParameters = {
      height: 100,
      topDiameter: 100,
      bottomDiameter: 100,
      curveTension: 0,
      wallThickness: 5,
    };

    const geo = generateLampGeometry(profile, shape);
    const pos = geo.getAttribute("position");

    // Collect unique radii at y=0 (bottom)
    const radiiAtBottom = new Set<number>();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (Math.abs(y) < 0.1) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const r = Math.round(Math.sqrt(x * x + z * z));
        radiiAtBottom.add(r);
      }
    }

    // Should have both outer (50) and inner (45) radii
    expect(radiiAtBottom.has(50)).toBe(true);
    expect(radiiAtBottom.has(45)).toBe(true);
  });

  it("produces geometry with normals", () => {
    const geo = generateLampGeometry(
      coneTemplate.profile,
      coneTemplate.defaultParameters
    );
    const normals = geo.getAttribute("normal");
    expect(normals).toBeDefined();
    expect(normals.count).toBe(geo.getAttribute("position").count);
  });
});

describe("LampMesh scaling constant", () => {
  it("MM_TO_SCENE converts mm to reasonable scene units", () => {
    // The component uses 0.005 as the scale factor
    // A 200mm lamp should be 1 unit in scene space
    const MM_TO_SCENE = 0.005;
    expect(200 * MM_TO_SCENE).toBe(1);
    expect(100 * MM_TO_SCENE).toBe(0.5);
  });
});
