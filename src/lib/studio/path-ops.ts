import type { BoundingBox, PathPoint, Shape } from "./types";

/** Cubic bezier handle distance for approximating a circle quarter. */
const KAPPA = 0.5522847498307933;

export function pointsToSVGPath(
  points: PathPoint[],
  closed: boolean,
): string {
  if (points.length === 0) return "";
  const parts: string[] = [];
  parts.push(`M${num(points[0].x)},${num(points[0].y)}`);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    parts.push(segment(prev, curr));
  }

  if (closed && points.length > 1) {
    const last = points[points.length - 1];
    const first = points[0];
    parts.push(segment(last, first));
    parts.push("Z");
  }

  return parts.join(" ");
}

function segment(prev: PathPoint, curr: PathPoint): string {
  const ho = prev.handleOut;
  const hi = curr.handleIn;
  if (ho || hi) {
    const c1 = ho ?? { x: prev.x, y: prev.y };
    const c2 = hi ?? { x: curr.x, y: curr.y };
    return `C${num(c1.x)},${num(c1.y)} ${num(c2.x)},${num(c2.y)} ${num(curr.x)},${num(curr.y)}`;
  }
  return `L${num(curr.x)},${num(curr.y)}`;
}

function num(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const f = n.toFixed(4);
  return f.replace(/\.?0+$/, "");
}

/* ----------------------------- Bounding boxes ---------------------------- */

export function pointsBounds(points: PathPoint[]): BoundingBox | null {
  if (points.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

const PATH_NUMBER_RE = /-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/g;

/**
 * Loose bounding box derived from every coordinate-pair token in an SVG path
 * `d` string. This includes control points, so the result can be slightly
 * larger than the visual bounds, but it's a safe over-estimate suitable for
 * selection and viewport math. Good enough for compound paths.
 */
export function pathDataBounds(d: string): BoundingBox | null {
  if (!d) return null;
  const nums = d.match(PATH_NUMBER_RE);
  if (!nums || nums.length < 2) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = Number(nums[i]);
    const y = Number(nums[i + 1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

/** Compute the bounding box of any path-typed shape. */
export function pathShapeBounds(shape: Shape): BoundingBox | null {
  if (shape.pathData) return pathDataBounds(shape.pathData);
  if (shape.points && shape.points.length > 0) return pointsBounds(shape.points);
  return null;
}

/* ----------------------------- Conversions ----------------------------- */

export function rectangleToPoints(shape: Shape): PathPoint[] {
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  const cx = shape.x;
  const cy = shape.y;
  return [
    { x: cx - halfW, y: cy - halfH },
    { x: cx + halfW, y: cy - halfH },
    { x: cx + halfW, y: cy + halfH },
    { x: cx - halfW, y: cy + halfH },
  ];
}

export function circleToPoints(shape: Shape): PathPoint[] {
  const cx = shape.x;
  const cy = shape.y;
  const rx = shape.width / 2;
  const ry = shape.height / 2;
  const ox = rx * KAPPA;
  const oy = ry * KAPPA;
  return [
    {
      x: cx,
      y: cy - ry,
      handleIn: { x: cx - ox, y: cy - ry },
      handleOut: { x: cx + ox, y: cy - ry },
    },
    {
      x: cx + rx,
      y: cy,
      handleIn: { x: cx + rx, y: cy - oy },
      handleOut: { x: cx + rx, y: cy + oy },
    },
    {
      x: cx,
      y: cy + ry,
      handleIn: { x: cx + ox, y: cy + ry },
      handleOut: { x: cx - ox, y: cy + ry },
    },
    {
      x: cx - rx,
      y: cy,
      handleIn: { x: cx - rx, y: cy + oy },
      handleOut: { x: cx - rx, y: cy - oy },
    },
  ];
}

export function lineToPoints(shape: Shape): PathPoint[] {
  return [
    { x: shape.x + (shape.x1 ?? 0), y: shape.y + (shape.y1 ?? 0) },
    { x: shape.x + (shape.x2 ?? 0), y: shape.y + (shape.y2 ?? 0) },
  ];
}

export function shapeToPath(shape: Shape): {
  points: PathPoint[];
  closed: boolean;
} {
  switch (shape.type) {
    case "rectangle":
      return { points: rectangleToPoints(shape), closed: true };
    case "circle":
      return { points: circleToPoints(shape), closed: true };
    case "line":
      return { points: lineToPoints(shape), closed: false };
    case "path":
      return { points: shape.points ?? [], closed: shape.closed ?? false };
    default:
      return { points: [], closed: false };
  }
}

/* ----------------------------- Mutations ----------------------------- */

/** Translate every point and handle by (dx, dy). */
export function translatePoints(
  points: PathPoint[],
  dx: number,
  dy: number,
): PathPoint[] {
  if (dx === 0 && dy === 0) return points;
  return points.map((p) => ({
    x: p.x + dx,
    y: p.y + dy,
    handleIn: p.handleIn
      ? { x: p.handleIn.x + dx, y: p.handleIn.y + dy }
      : undefined,
    handleOut: p.handleOut
      ? { x: p.handleOut.x + dx, y: p.handleOut.y + dy }
      : undefined,
  }));
}

/**
 * Scale points around an anchor by (sx, sy). Handles scale with their parent
 * point so the curve shape transforms uniformly.
 */
export function scalePoints(
  points: PathPoint[],
  anchorX: number,
  anchorY: number,
  sx: number,
  sy: number,
): PathPoint[] {
  if (sx === 1 && sy === 1) return points;
  const sp = (
    p: { x: number; y: number },
  ): { x: number; y: number } => ({
    x: anchorX + (p.x - anchorX) * sx,
    y: anchorY + (p.y - anchorY) * sy,
  });
  return points.map((p) => ({
    ...sp(p),
    handleIn: p.handleIn ? sp(p.handleIn) : undefined,
    handleOut: p.handleOut ? sp(p.handleOut) : undefined,
  }));
}

export function applyNodeDrag(
  drag:
    | {
        kind: "node";
        nodeIndex: number;
        origPoints: PathPoint[];
      }
    | {
        kind: "handle";
        nodeIndex: number;
        which: "in" | "out";
        origPoints: PathPoint[];
        alt: boolean;
      },
  currentPoints: PathPoint[],
  dx: number,
  dy: number,
  altNow: boolean,
): PathPoint[] {
  if (drag.kind === "node") {
    if (dx === 0 && dy === 0) return currentPoints;
    const idx = drag.nodeIndex;
    const orig = drag.origPoints[idx];
    if (!orig) return currentPoints;
    const next = currentPoints.slice();
    next[idx] = {
      x: orig.x + dx,
      y: orig.y + dy,
      handleIn: orig.handleIn
        ? { x: orig.handleIn.x + dx, y: orig.handleIn.y + dy }
        : undefined,
      handleOut: orig.handleOut
        ? { x: orig.handleOut.x + dx, y: orig.handleOut.y + dy }
        : undefined,
    };
    return next;
  }
  // handle drag
  const idx = drag.nodeIndex;
  const orig = drag.origPoints[idx];
  if (!orig) return currentPoints;
  const breakSym = drag.alt || altNow;
  const next = currentPoints.slice();
  if (drag.which === "out") {
    const baseOut = orig.handleOut ?? { x: orig.x, y: orig.y };
    const newOut = { x: baseOut.x + dx, y: baseOut.y + dy };
    let newIn = orig.handleIn;
    if (!breakSym && orig.handleIn) {
      newIn = { x: 2 * orig.x - newOut.x, y: 2 * orig.y - newOut.y };
    }
    next[idx] = { ...orig, handleOut: newOut, handleIn: newIn };
  } else {
    const baseIn = orig.handleIn ?? { x: orig.x, y: orig.y };
    const newIn = { x: baseIn.x + dx, y: baseIn.y + dy };
    let newOut = orig.handleOut;
    if (!breakSym && orig.handleOut) {
      newOut = { x: 2 * orig.x - newIn.x, y: 2 * orig.y - newIn.y };
    }
    next[idx] = { ...orig, handleIn: newIn, handleOut: newOut };
  }
  return next;
}

export function generateArcPoints(
  cx: number,
  cy: number,
  radius: number,
  startAngleDeg: number,
  sweepDeg: number,
): PathPoint[] {
  if (radius <= 0 || sweepDeg === 0) return [];
  const segCount = Math.max(1, Math.ceil(Math.abs(sweepDeg) / 90));
  const segSweepDeg = sweepDeg / segCount;
  const segSweepRad = (segSweepDeg * Math.PI) / 180;
  const handleLen = ((4 / 3) * Math.tan(segSweepRad / 4)) * radius;
  const points: PathPoint[] = [];
  for (let i = 0; i <= segCount; i++) {
    const aDeg = startAngleDeg + segSweepDeg * i;
    const a = (aDeg * Math.PI) / 180;
    const px = cx + radius * Math.cos(a);
    const py = cy + radius * Math.sin(a);
    const tx = -Math.sin(a);
    const ty = Math.cos(a);
    const handleIn =
      i > 0
        ? { x: px - tx * handleLen, y: py - ty * handleLen }
        : undefined;
    const handleOut =
      i < segCount
        ? { x: px + tx * handleLen, y: py + ty * handleLen }
        : undefined;
    points.push({ x: px, y: py, handleIn, handleOut });
  }
  return points;
}

export function generatePolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  star: boolean,
  innerPct: number,
  rotationDeg: number,
): PathPoint[] {
  if (radius <= 0 || sides < 3) return [];
  const count = star ? sides * 2 : sides;
  const baseAngle = ((rotationDeg - 90) * Math.PI) / 180;
  const innerR = (radius * Math.max(1, Math.min(100, innerPct))) / 100;
  const points: PathPoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (i * 2 * Math.PI) / count;
    const r = star && i % 2 === 1 ? innerR : radius;
    points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return points;
}

/** Recompute width/height/x/y on a path shape from its points or pathData. */
export function syncPathBounds(shape: Shape): Shape {
  if (shape.type !== "path") return shape;
  const b = pathShapeBounds(shape);
  if (!b) return shape;
  const width = b.maxX - b.minX;
  const height = b.maxY - b.minY;
  return {
    ...shape,
    x: (b.minX + b.maxX) / 2,
    y: (b.minY + b.maxY) / 2,
    width,
    height,
  };
}
