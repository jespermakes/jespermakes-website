import { createPath } from "../shape-factory";
import type { PathPoint, Shape } from "../types";
import type { GeneratorFn } from "./types";

export type FreeformShape =
  | "leaf"
  | "heart"
  | "arrow"
  | "arch"
  | "teardrop"
  | "keyhole"
  | "handle"
  | "rounded-rectangle"
  | "oval"
  | "cross"
  | "t-shape"
  | "l-bracket"
  | "wedge"
  | "dovetail"
  | "finger-test-strip";

export interface FreeformPathParams {
  description: FreeformShape;
  width: number;
  height?: number;
  cutType?: "inside" | "outside" | "online" | "pocket" | "guide";
}

/**
 * Returns control points (in a unit-1 box centred on the origin, ranging
 * roughly -0.5..0.5) for a named template. The caller scales them by the
 * requested width/height.
 */
function templatePoints(template: FreeformShape): PathPoint[] {
  const arc = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    startDeg: number,
    endDeg: number,
    steps: number,
  ): PathPoint[] => {
    const out: PathPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = startDeg + ((endDeg - startDeg) * i) / steps;
      const a = (t * Math.PI) / 180;
      out.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    }
    return out;
  };

  switch (template) {
    case "leaf":
      // Two arcs forming a pointed-oval leaf.
      return [
        ...arc(0, 0, 0.5, 0.35, -180, 0, 32),
        ...arc(0, 0, 0.5, 0.35, 0, -180, 32).slice(1),
      ];
    case "heart": {
      // Two top lobes + bottom point.
      const left = arc(-0.18, -0.1, 0.22, 0.22, 180, 0, 24);
      const right = arc(0.18, -0.1, 0.22, 0.22, 180, 0, 24);
      const bottom: PathPoint[] = [
        { x: 0.4, y: 0 },
        { x: 0, y: 0.5 },
        { x: -0.4, y: 0 },
      ];
      return [...left, ...right.slice(1), ...bottom];
    }
    case "arrow":
      return [
        { x: -0.5, y: -0.15 },
        { x: 0.15, y: -0.15 },
        { x: 0.15, y: -0.4 },
        { x: 0.5, y: 0 },
        { x: 0.15, y: 0.4 },
        { x: 0.15, y: 0.15 },
        { x: -0.5, y: 0.15 },
      ];
    case "arch":
      // Half-circle on top, vertical sides, flat bottom.
      return [
        { x: -0.5, y: 0.5 },
        { x: -0.5, y: 0 },
        ...arc(0, 0, 0.5, 0.5, 180, 0, 32),
        { x: 0.5, y: 0.5 },
      ];
    case "teardrop":
      return [
        { x: 0, y: -0.5 },
        ...arc(0, 0.1, 0.4, 0.4, -90, 270, 32).slice(1),
      ];
    case "keyhole":
      // Circle on top, rectangular slot below.
      return [
        ...arc(0, -0.2, 0.2, 0.2, 180, 0, 24),
        { x: 0.2, y: -0.2 },
        { x: 0.08, y: -0.2 },
        { x: 0.08, y: 0.5 },
        { x: -0.08, y: 0.5 },
        { x: -0.08, y: -0.2 },
        { x: -0.2, y: -0.2 },
      ];
    case "handle":
      // Hand-pull cutout: oval slot with rounded ends.
      return [
        ...arc(-0.35, 0, 0.15, 0.18, 90, 270, 16),
        ...arc(0.35, 0, 0.15, 0.18, -90, 90, 16),
      ];
    case "rounded-rectangle":
      return [
        ...arc(-0.4, -0.3, 0.1, 0.1, 180, 270, 8),
        ...arc(0.4, -0.3, 0.1, 0.1, 270, 360, 8),
        ...arc(0.4, 0.3, 0.1, 0.1, 0, 90, 8),
        ...arc(-0.4, 0.3, 0.1, 0.1, 90, 180, 8),
      ];
    case "oval":
      return arc(0, 0, 0.5, 0.5, 0, 360, 64);
    case "cross":
      return [
        { x: -0.15, y: -0.5 },
        { x: 0.15, y: -0.5 },
        { x: 0.15, y: -0.15 },
        { x: 0.5, y: -0.15 },
        { x: 0.5, y: 0.15 },
        { x: 0.15, y: 0.15 },
        { x: 0.15, y: 0.5 },
        { x: -0.15, y: 0.5 },
        { x: -0.15, y: 0.15 },
        { x: -0.5, y: 0.15 },
        { x: -0.5, y: -0.15 },
        { x: -0.15, y: -0.15 },
      ];
    case "t-shape":
      return [
        { x: -0.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: 0.5, y: -0.2 },
        { x: 0.15, y: -0.2 },
        { x: 0.15, y: 0.5 },
        { x: -0.15, y: 0.5 },
        { x: -0.15, y: -0.2 },
        { x: -0.5, y: -0.2 },
      ];
    case "l-bracket":
      return [
        { x: -0.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: 0.5, y: -0.2 },
        { x: -0.2, y: -0.2 },
        { x: -0.2, y: 0.5 },
        { x: -0.5, y: 0.5 },
      ];
    case "wedge":
      return [
        { x: -0.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: -0.5, y: 0.5 },
      ];
    case "dovetail":
      // Trapezoid with the wider end at the top.
      return [
        { x: -0.45, y: -0.5 },
        { x: 0.45, y: -0.5 },
        { x: 0.3, y: 0.5 },
        { x: -0.3, y: 0.5 },
      ];
    case "finger-test-strip":
      // 5 fingers along the top edge.
      return [
        { x: -0.5, y: 0.5 },
        { x: -0.5, y: -0.3 },
        { x: -0.4, y: -0.3 },
        { x: -0.4, y: -0.5 },
        { x: -0.2, y: -0.5 },
        { x: -0.2, y: -0.3 },
        { x: 0, y: -0.3 },
        { x: 0, y: -0.5 },
        { x: 0.2, y: -0.5 },
        { x: 0.2, y: -0.3 },
        { x: 0.4, y: -0.3 },
        { x: 0.4, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: 0.5, y: 0.5 },
      ];
  }
}

export const generateFreeformPath: GeneratorFn<FreeformPathParams> = (
  params,
) => {
  const tmpl = templatePoints(params.description);
  if (!tmpl || tmpl.length < 3) {
    return { message: `I don't have a template called "${params.description}" yet.` };
  }
  const W = Math.max(5, params.width);
  const H = Math.max(5, params.height ?? W);
  const points: PathPoint[] = tmpl.map((p) => ({
    x: p.x * W,
    y: p.y * H,
  }));
  const shape: Shape = createPath({ points, closed: true });
  if (params.cutType) shape.cutType = params.cutType;
  else shape.cutType = "outside";
  return { shapesToAdd: [shape] };
};
