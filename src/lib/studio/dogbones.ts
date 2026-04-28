import { circleToPoints, rectangleToPoints } from "./path-ops";
import type { PathPoint, Shape } from "./types";

export interface DogboneCorner {
  /** Center of the dogbone circle in document mm. */
  cx: number;
  cy: number;
  /** Radius of the dogbone circle (= toolDiameter / 2). */
  r: number;
  /** Reference to the source corner — used by exporters to bake geometry. */
  cornerIndex: number;
}

function normalize(v: { x: number; y: number }): { x: number; y: number } {
  const m = Math.hypot(v.x, v.y);
  if (m < 1e-9) return { x: 0, y: 0 };
  return { x: v.x / m, y: v.y / m };
}

/**
 * Get the corner positions for a shape that supports dogbones — rectangles
 * (axis-aligned, treated as 4 corners) and points-based paths (closed only).
 */
export function shapeCornerPoints(shape: Shape): PathPoint[] {
  if (shape.type === "rectangle") {
    return rectangleToPoints(shape);
  }
  if (shape.type === "circle") {
    // Circles have no corners; use bezier points so the overlay still works.
    return circleToPoints(shape);
  }
  if (shape.type === "path" && shape.points && shape.closed) {
    return shape.points;
  }
  return [];
}

/**
 * Compute the dogbone circles for the corner indices stored on a shape,
 * using the active tool diameter. Returns one DogboneCorner per applied
 * corner, or an empty array if the shape can't carry dogbones.
 */
export function computeDogbones(
  shape: Shape,
  toolDiameter: number,
): DogboneCorner[] {
  const cornerIndices = shape.dogboneCorners;
  if (!cornerIndices || cornerIndices.length === 0) return [];
  if (toolDiameter <= 0) return [];

  const points = shapeCornerPoints(shape);
  if (points.length < 3) return [];

  const r = toolDiameter / 2;
  const dogbones: DogboneCorner[] = [];
  for (const idx of cornerIndices) {
    if (idx < 0 || idx >= points.length) continue;
    const p = points[idx];
    const prev = points[(idx - 1 + points.length) % points.length];
    const next = points[(idx + 1) % points.length];
    const v1 = normalize({ x: prev.x - p.x, y: prev.y - p.y });
    const v2 = normalize({ x: next.x - p.x, y: next.y - p.y });
    const bisector = normalize({ x: v1.x + v2.x, y: v1.y + v2.y });
    if (bisector.x === 0 && bisector.y === 0) continue;
    // Dogbone goes opposite the internal bisector (out of the kept-material
    // side of the corner); circle edge touches the corner point.
    const cx = p.x - bisector.x * r;
    const cy = p.y - bisector.y * r;
    dogbones.push({ cx, cy, r, cornerIndex: idx });
  }
  return dogbones;
}

/** All-corners array for a shape — used by 'Apply dogbones'. */
export function defaultDogboneCorners(shape: Shape): number[] {
  if (shape.type === "rectangle") return [0, 1, 2, 3];
  if (shape.type === "path" && shape.points && shape.closed) {
    // For paths, include every corner-only point (no handles). Curve nodes
    // typically don't need dogbones.
    const out: number[] = [];
    for (let i = 0; i < shape.points.length; i++) {
      const p = shape.points[i];
      if (!p.handleIn && !p.handleOut) out.push(i);
    }
    return out;
  }
  return [];
}
