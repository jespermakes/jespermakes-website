import polygonClipping, {
  type MultiPolygon,
  type Polygon,
  type Ring,
} from "polygon-clipping";
import {
  circleToPoints,
  pointsToSVGPath,
  rectangleToPoints,
} from "./path-ops";
import { createPath } from "./shape-factory";
import type { PathPoint, Shape } from "./types";

/* ----------------------------- Flattening ------------------------------ */

const FLATNESS_TOLERANCE = 0.25; // mm

function flattenBezier(
  out: number[][],
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  depth = 0,
): void {
  if (depth > 12) {
    out.push([p3.x, p3.y]);
    return;
  }
  // Distance from control points to chord; adaptive subdivision.
  const dx = p3.x - p0.x;
  const dy = p3.y - p0.y;
  const denom = Math.hypot(dx, dy);
  let d1 = 0;
  let d2 = 0;
  if (denom > 1e-9) {
    d1 = Math.abs((p1.x - p0.x) * dy - (p1.y - p0.y) * dx) / denom;
    d2 = Math.abs((p2.x - p0.x) * dy - (p2.y - p0.y) * dx) / denom;
  } else {
    d1 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    d2 = Math.hypot(p2.x - p0.x, p2.y - p0.y);
  }
  if (Math.max(d1, d2) <= FLATNESS_TOLERANCE) {
    out.push([p3.x, p3.y]);
    return;
  }
  const m01 = mid(p0, p1);
  const m12 = mid(p1, p2);
  const m23 = mid(p2, p3);
  const m012 = mid(m01, m12);
  const m123 = mid(m12, m23);
  const m0123 = mid(m012, m123);
  flattenBezier(out, p0, m01, m012, m0123, depth + 1);
  flattenBezier(out, m0123, m123, m23, p3, depth + 1);
}

function mid(
  a: { x: number; y: number },
  b: { x: number; y: number },
): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/* ------------------------- Path → polygon rings ------------------------ */

function pointsToRing(points: PathPoint[]): Ring | null {
  if (points.length < 3) return null;
  const ring: number[][] = [[points[0].x, points[0].y]];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (prev.handleOut || curr.handleIn) {
      flattenBezier(
        ring,
        { x: prev.x, y: prev.y },
        prev.handleOut ?? { x: prev.x, y: prev.y },
        curr.handleIn ?? { x: curr.x, y: curr.y },
        { x: curr.x, y: curr.y },
      );
    } else {
      ring.push([curr.x, curr.y]);
    }
  }
  // Close from last to first.
  const last = points[points.length - 1];
  const first = points[0];
  if (last.handleOut || first.handleIn) {
    flattenBezier(
      ring,
      { x: last.x, y: last.y },
      last.handleOut ?? { x: last.x, y: last.y },
      first.handleIn ?? { x: first.x, y: first.y },
      { x: first.x, y: first.y },
    );
  } else {
    ring.push([first.x, first.y]);
  }
  return ring as Ring;
}

const PATH_TOKEN_RE =
  /[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g;

function pathDataToPolygons(d: string): Ring[] {
  const tokens = d.match(PATH_TOKEN_RE) ?? [];
  const rings: number[][][] = [];
  let current: number[][] = [];
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;
  let i = 0;
  let lastCmd = "";
  const next = () => Number.parseFloat(tokens[i++]);

  const finish = () => {
    if (current.length >= 3) rings.push(current);
    current = [];
  };

  while (i < tokens.length) {
    const tok = tokens[i];
    let cmd: string;
    if (/^[MmLlHhVvCcSsQqTtAaZz]$/.test(tok)) {
      cmd = tok;
      i++;
    } else {
      cmd = lastCmd === "M" ? "L" : lastCmd === "m" ? "l" : lastCmd || "L";
    }
    lastCmd = cmd;
    const upper = cmd.toUpperCase();
    const rel = cmd !== upper;

    switch (upper) {
      case "M": {
        if (current.length > 0) finish();
        const x = next();
        const y = next();
        const ax = rel ? cx + x : x;
        const ay = rel ? cy + y : y;
        current = [[ax, ay]];
        cx = ax;
        cy = ay;
        startX = ax;
        startY = ay;
        break;
      }
      case "L": {
        const x = next();
        const y = next();
        const ax = rel ? cx + x : x;
        const ay = rel ? cy + y : y;
        current.push([ax, ay]);
        cx = ax;
        cy = ay;
        break;
      }
      case "H": {
        const x = next();
        const ax = rel ? cx + x : x;
        current.push([ax, cy]);
        cx = ax;
        break;
      }
      case "V": {
        const y = next();
        const ay = rel ? cy + y : y;
        current.push([cx, ay]);
        cy = ay;
        break;
      }
      case "C": {
        const x1 = next();
        const y1 = next();
        const x2 = next();
        const y2 = next();
        const x = next();
        const y = next();
        const ax1 = rel ? cx + x1 : x1;
        const ay1 = rel ? cy + y1 : y1;
        const ax2 = rel ? cx + x2 : x2;
        const ay2 = rel ? cy + y2 : y2;
        const ax = rel ? cx + x : x;
        const ay = rel ? cy + y : y;
        flattenBezier(
          current,
          { x: cx, y: cy },
          { x: ax1, y: ay1 },
          { x: ax2, y: ay2 },
          { x: ax, y: ay },
        );
        cx = ax;
        cy = ay;
        break;
      }
      case "Q": {
        // Convert quadratic to cubic and flatten.
        const x1 = next();
        const y1 = next();
        const x = next();
        const y = next();
        const ax1 = rel ? cx + x1 : x1;
        const ay1 = rel ? cy + y1 : y1;
        const ax = rel ? cx + x : x;
        const ay = rel ? cy + y : y;
        const c1 = { x: cx + (2 / 3) * (ax1 - cx), y: cy + (2 / 3) * (ay1 - cy) };
        const c2 = { x: ax + (2 / 3) * (ax1 - ax), y: ay + (2 / 3) * (ay1 - ay) };
        flattenBezier(current, { x: cx, y: cy }, c1, c2, { x: ax, y: ay });
        cx = ax;
        cy = ay;
        break;
      }
      case "Z": {
        // Close to the start of this sub-path.
        if (
          current.length > 0 &&
          (current[current.length - 1][0] !== startX ||
            current[current.length - 1][1] !== startY)
        ) {
          current.push([startX, startY]);
        }
        finish();
        cx = startX;
        cy = startY;
        break;
      }
      default:
        // S, T, A: skip these tokens to avoid an infinite loop on unsupported
        // commands. polygon-clipping doesn't need extreme precision here.
        return rings.map((r) => r as Ring);
    }
  }
  if (current.length > 0) finish();
  return rings.map((r) => r as Ring);
}

function shapeToPolygon(shape: Shape): Polygon | null {
  if (shape.type === "rectangle") {
    const ring = pointsToRing(rectangleToPoints(shape));
    return ring ? [ring] : null;
  }
  if (shape.type === "circle") {
    const ring = pointsToRing(circleToPoints(shape));
    return ring ? [ring] : null;
  }
  if (shape.type === "path") {
    if (shape.pathData) {
      const rings = pathDataToPolygons(shape.pathData);
      if (rings.length === 0) return null;
      return rings;
    }
    if (shape.points && shape.points.length >= 3) {
      const ring = pointsToRing(shape.points);
      return ring ? [ring] : null;
    }
  }
  return null;
}

/* ----------------------- MultiPolygon → SVG path ----------------------- */

function multiPolygonToPathData(mp: MultiPolygon): string {
  if (mp.length === 0) return "";
  const parts: string[] = [];
  for (const poly of mp) {
    for (const ring of poly) {
      if (ring.length < 3) continue;
      let d = `M${num(ring[0][0])},${num(ring[0][1])}`;
      for (let i = 1; i < ring.length; i++) {
        d += ` L${num(ring[i][0])},${num(ring[i][1])}`;
      }
      d += " Z";
      parts.push(d);
    }
  }
  return parts.join(" ");
}

function num(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(4).replace(/\.?0+$/, "");
}

/* -------------------------------- Public API --------------------------- */

export type BooleanOp = "union" | "difference" | "intersection";

export function applyBoolean(
  shapes: Shape[],
  op: BooleanOp,
): Shape | null {
  if (shapes.length < 2) return null;
  const polygons = shapes.map(shapeToPolygon).filter((p): p is Polygon => !!p);
  if (polygons.length < 2) return null;

  let result: MultiPolygon;
  try {
    const [first, ...rest] = polygons;
    if (op === "union") {
      result = polygonClipping.union(first, ...rest);
    } else if (op === "intersection") {
      result = polygonClipping.intersection(first, ...rest);
    } else {
      result = polygonClipping.difference(first, ...rest);
    }
  } catch {
    return null;
  }

  if (!result || result.length === 0) return null;

  const pathData = multiPolygonToPathData(result);
  if (!pathData) return null;

  // Use stroke/fill from the first input shape so the result inherits style.
  const ref = shapes[0];
  return createPath({
    pathData,
    closed: true,
    stroke: ref.stroke,
    strokeWidth: ref.strokeWidth,
    fill: ref.fill,
  });
}

// Re-export pointsToSVGPath for callers that compose paths directly.
export { pointsToSVGPath };
