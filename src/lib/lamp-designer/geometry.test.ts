import { describe, it, expect } from "vitest";
import { Vector2 } from "three";
import {
  interpolateProfile,
  offsetProfile,
  revolveProfile,
  generateLampGeometry,
} from "./geometry";
import type { ProfilePoint } from "./types";
import { getTemplate } from "./templates";

describe("interpolateProfile", () => {
  it("returns the correct number of points for a straight segment", () => {
    const profile: ProfilePoint[] = [
      { x: 20, y: 0 },
      { x: 100, y: 180 },
    ];
    const points = interpolateProfile(profile, 10);
    expect(points).toHaveLength(11); // segments + 1
  });

  it("interpolates a straight line correctly", () => {
    const profile: ProfilePoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 200 },
    ];
    const points = interpolateProfile(profile, 4);
    expect(points[0].x).toBeCloseTo(0);
    expect(points[0].y).toBeCloseTo(0);
    expect(points[points.length - 1].x).toBeCloseTo(100);
    expect(points[points.length - 1].y).toBeCloseTo(200);
    // Midpoint should be at (50, 100)
    expect(points[2].x).toBeCloseTo(50);
    expect(points[2].y).toBeCloseTo(100);
  });

  it("handles bezier handles on profile points", () => {
    const profile: ProfilePoint[] = [
      { x: 10, y: 0 },
      {
        x: 110,
        y: 60,
        handleIn: { x: -40, y: 0 },
        handleOut: { x: 40, y: 0 },
      },
      { x: 110, y: 160 },
    ];
    const points = interpolateProfile(profile, 20);
    expect(points.length).toBeGreaterThanOrEqual(10);
    // First and last should match profile endpoints
    expect(points[0].x).toBeCloseTo(10);
    expect(points[0].y).toBeCloseTo(0);
    expect(points[points.length - 1].x).toBeCloseTo(110);
    expect(points[points.length - 1].y).toBeCloseTo(160);
  });

  it("throws for fewer than 2 profile points", () => {
    expect(() => interpolateProfile([{ x: 0, y: 0 }], 10)).toThrow(
      "Profile must have at least 2 points"
    );
  });
});

describe("offsetProfile", () => {
  it("reduces radius by wall thickness", () => {
    const profile = [new Vector2(50, 0), new Vector2(100, 100)];
    const offset = offsetProfile(profile, 2.5);
    expect(offset[0].x).toBeCloseTo(47.5);
    expect(offset[1].x).toBeCloseTo(97.5);
  });

  it("clamps radius to zero", () => {
    const profile = [new Vector2(1, 0), new Vector2(50, 100)];
    const offset = offsetProfile(profile, 5);
    expect(offset[0].x).toBe(0);
    expect(offset[1].x).toBeCloseTo(45);
  });

  it("preserves y values", () => {
    const profile = [new Vector2(50, 10), new Vector2(100, 200)];
    const offset = offsetProfile(profile, 3);
    expect(offset[0].y).toBe(10);
    expect(offset[1].y).toBe(200);
  });
});

describe("revolveProfile", () => {
  it("produces correct vertex count", () => {
    const profile = [new Vector2(50, 0), new Vector2(50, 100)];
    const verts = revolveProfile(profile, 8);
    // 2 profile points * (8 + 1) ring vertices
    expect(verts).toHaveLength(2 * 9);
  });

  it("first and last ring vertex are at the same position (wrap-around)", () => {
    const profile = [new Vector2(50, 0)];
    const verts = revolveProfile(profile, 16);
    const first = verts[0];
    const last = verts[16];
    expect(first.x).toBeCloseTo(last.x);
    expect(first.y).toBeCloseTo(last.y);
    expect(first.z).toBeCloseTo(last.z);
  });

  it("revolves around the Y axis", () => {
    const profile = [new Vector2(100, 50)];
    const verts = revolveProfile(profile, 4);
    // At theta = 0: (100, 50, 0)
    expect(verts[0].x).toBeCloseTo(100);
    expect(verts[0].y).toBeCloseTo(50);
    expect(verts[0].z).toBeCloseTo(0);
    // At theta = PI/2: (0, 50, 100)
    expect(verts[1].x).toBeCloseTo(0);
    expect(verts[1].y).toBeCloseTo(50);
    expect(verts[1].z).toBeCloseTo(100);
    // At theta = PI: (-100, 50, 0)
    expect(verts[2].x).toBeCloseTo(-100);
    expect(verts[2].y).toBeCloseTo(50);
    expect(verts[2].z).toBeCloseTo(0);
  });
});

describe("generateLampGeometry", () => {
  const coneTemplate = getTemplate("cone");
  const shape = coneTemplate.defaultParameters;

  it("returns a BufferGeometry with position, normal, uv, and index", () => {
    const geo = generateLampGeometry(coneTemplate.profile, shape, {
      radialSegments: 8,
      profileSegments: 4,
    });
    expect(geo.getAttribute("position")).toBeDefined();
    expect(geo.getAttribute("normal")).toBeDefined();
    expect(geo.getAttribute("uv")).toBeDefined();
    expect(geo.getIndex()).not.toBeNull();
  });

  it("generates UV coordinates in [0, 1] range", () => {
    const geo = generateLampGeometry(coneTemplate.profile, shape, {
      radialSegments: 8,
      profileSegments: 4,
    });
    const uvAttr = geo.getAttribute("uv");
    expect(uvAttr.count).toBeGreaterThan(0);
    for (let i = 0; i < uvAttr.count; i++) {
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThanOrEqual(1);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it("has non-zero vertex count", () => {
    const geo = generateLampGeometry(coneTemplate.profile, shape, {
      radialSegments: 8,
      profileSegments: 4,
    });
    const posAttr = geo.getAttribute("position");
    expect(posAttr.count).toBeGreaterThan(0);
  });

  it("has non-zero index count", () => {
    const geo = generateLampGeometry(coneTemplate.profile, shape, {
      radialSegments: 8,
      profileSegments: 4,
    });
    const index = geo.getIndex()!;
    expect(index.count).toBeGreaterThan(0);
    // Triangle count should be divisible by 3
    expect(index.count % 3).toBe(0);
  });

  it("works with all templates", () => {
    for (const templateId of ["cone", "dome", "cylinder"] as const) {
      const template = getTemplate(templateId);
      const geo = generateLampGeometry(
        template.profile,
        template.defaultParameters,
        { radialSegments: 8, profileSegments: 8 }
      );
      expect(geo.getAttribute("position").count).toBeGreaterThan(0);
    }
  });

  it("produces a hollow geometry (inner wall has smaller radius)", () => {
    const geo = generateLampGeometry(coneTemplate.profile, shape, {
      radialSegments: 8,
      profileSegments: 4,
    });
    const pos = geo.getAttribute("position");
    // Collect all radii (distance from Y axis)
    const radii: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      radii.push(Math.sqrt(x * x + z * z));
    }
    const maxRadius = Math.max(...radii);
    const nonZeroRadii = radii.filter((r) => r > 0.01);
    const minRadius = Math.min(...nonZeroRadii);
    // The difference between max and min radius should be at least wallThickness
    expect(maxRadius - minRadius).toBeGreaterThanOrEqual(shape.wallThickness - 0.1);
  });

  it("increases vertex count with more segments", () => {
    const geoLow = generateLampGeometry(coneTemplate.profile, shape, {
      radialSegments: 4,
      profileSegments: 4,
    });
    const geoHigh = generateLampGeometry(coneTemplate.profile, shape, {
      radialSegments: 16,
      profileSegments: 16,
    });
    expect(geoHigh.getAttribute("position").count).toBeGreaterThan(
      geoLow.getAttribute("position").count
    );
  });
});
