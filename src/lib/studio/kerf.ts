import ClipperLib from "clipper-lib";
import { circleToPoints, rectangleToPoints } from "./path-ops";
import type { CutType, PathPoint, Shape } from "./types";

const SCALE = 1000;

// ---------- Flattening (curves → polylines) ----------

const FLATNESS_TOLERANCE = 0.25;

function mid(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function flattenBezier(
  out: { x: number; y: number }[],
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  depth = 0,
): void {
  if (depth > 12) {
    out.push(p3);
    return;
  }
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
    out.push(p3);
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

function pointsToPolyline(
  points: PathPoint[],
  closed: boolean,
): { x: number; y: number }[] {
  if (points.length === 0) return [];
  const out: { x: number; y: number }[] = [
    { x: points[0].x, y: points[0].y },
  ];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (prev.handleOut || curr.handleIn) {
      flattenBezier(
        out,
        { x: prev.x, y: prev.y },
        prev.handleOut ?? { x: prev.x, y: prev.y },
        curr.handleIn ?? { x: curr.x, y: curr.y },
        { x: curr.x, y: curr.y },
      );
    } else {
      out.push({ x: curr.x, y: curr.y });
    }
  }
  if (closed && points.length > 1) {
    const last = points[points.length - 1];
    const first = points[0];
    if (last.handleOut || first.handleIn) {
      flattenBezier(
        out,
        { x: last.x, y: last.y },
        last.handleOut ?? { x: last.x, y: last.y },
        first.handleIn ?? { x: first.x, y: first.y },
        { x: first.x, y: first.y },
      );
    }
  }
  return out;
}

function shapeToPolylines(
  shape: Shape,
): { polyline: { x: number; y: number }[]; closed: boolean }[] {
  if (shape.type === "rectangle") {
    return [{ polyline: pointsToPolyline(rectangleToPoints(shape), true), closed: true }];
  }
  if (shape.type === "circle") {
    return [{ polyline: pointsToPolyline(circleToPoints(shape), true), closed: true }];
  }
  if (shape.type === "line") {
    return [
      {
        polyline: [
          { x: shape.x + (shape.x1 ?? 0), y: shape.y + (shape.y1 ?? 0) },
          { x: shape.x + (shape.x2 ?? 0), y: shape.y + (shape.y2 ?? 0) },
        ],
        closed: false,
      },
    ];
  }
  if (shape.type === "path") {
    if (shape.points && shape.points.length > 0) {
      return [
        {
          polyline: pointsToPolyline(shape.points, shape.closed === true),
          closed: shape.closed === true,
        },
      ];
    }
    if (shape.pathData) {
      // Compound paths via raw d — defer offset (return originals).
      return [];
    }
  }
  return [];
}

// ---------- Clipper interop ----------

function toClipperPath(
  poly: { x: number; y: number }[],
): ClipperLib.IntPoint[] {
  return poly.map((p) => ({
    X: Math.round(p.x * SCALE),
    Y: Math.round(p.y * SCALE),
  }));
}

function clipperToSVGPath(paths: ClipperLib.Paths, closed: boolean): string {
  if (paths.length === 0) return "";
  const parts: string[] = [];
  for (const path of paths) {
    if (path.length === 0) continue;
    const first = path[0];
    parts.push(`M${num(first.X / SCALE)},${num(first.Y / SCALE)}`);
    for (let i = 1; i < path.length; i++) {
      const p = path[i];
      parts.push(`L${num(p.X / SCALE)},${num(p.Y / SCALE)}`);
    }
    if (closed) parts.push("Z");
  }
  return parts.join(" ");
}

function num(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(4).replace(/\.?0+$/, "");
}

// ---------- Public API ----------

/**
 * Returns the kerf-compensated path d-string for a shape, given its cut
 * type and the active tool's kerf width. Returns null if the shape can't
 * be offset (e.g. compound paths or unsupported types).
 *
 * - outside / pocket boundary: offset OUTWARD by kerf/2 (positive delta)
 * - inside: offset INWARD by kerf/2 (negative delta)
 * - online / guide / no cutType: returns null (no offset)
 */
export function compensatePath(
  shape: Shape,
  cutType: CutType | undefined,
  kerfMm: number,
): string | null {
  if (!cutType || cutType === "online" || cutType === "guide") return null;
  if (kerfMm <= 0) return null;

  const polylines = shapeToPolylines(shape);
  if (polylines.length === 0) return null;

  const sign = cutType === "inside" ? -1 : 1;
  const delta = (sign * kerfMm) / 2 * SCALE;

  const offset = new ClipperLib.ClipperOffset(2.0, 0.25);
  for (const { polyline, closed } of polylines) {
    if (polyline.length < 2) continue;
    offset.AddPath(
      toClipperPath(polyline),
      ClipperLib.JoinType.jtRound,
      closed ? ClipperLib.EndType.etClosedPolygon : ClipperLib.EndType.etOpenButt,
    );
  }
  const result: ClipperLib.Paths = [];
  offset.Execute(result, delta);
  if (!result || result.length === 0) return null;

  // For closed inputs the result is a closed polygon; for open inputs the
  // result is also closed (round-cap end-type). We always emit closed paths.
  return clipperToSVGPath(result, true);
}
