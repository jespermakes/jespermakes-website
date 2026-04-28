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

/* ------------------------- Path d-string transform --------------------- */

export type Matrix2D = [number, number, number, number, number, number];
const IDENTITY: Matrix2D = [1, 0, 0, 1, 0, 0];

function applyMatrix(m: Matrix2D, x: number, y: number): { x: number; y: number } {
  return { x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] };
}

function uniformScale(m: Matrix2D): { sx: number; sy: number } {
  return { sx: Math.hypot(m[0], m[1]), sy: Math.hypot(m[2], m[3]) };
}

const PATH_TOKEN_RE =
  /[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g;

interface ParsedSegment {
  cmd: string; // always uppercase = absolute
  args: number[];
}

/** Parse a path d-string and convert all commands to absolute. */
export function parsePathD(d: string): ParsedSegment[] {
  const tokens = d.match(PATH_TOKEN_RE) ?? [];
  const segments: ParsedSegment[] = [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;
  let lastCmd = "";

  const next = () => Number.parseFloat(tokens[i++]);
  const eat = (n: number): number[] => {
    const out: number[] = [];
    for (let k = 0; k < n; k++) out.push(next());
    return out;
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
    const isRel = cmd !== upper;

    switch (upper) {
      case "M": {
        const [x, y] = eat(2);
        const ax = isRel ? cx + x : x;
        const ay = isRel ? cy + y : y;
        segments.push({ cmd: "M", args: [ax, ay] });
        cx = ax;
        cy = ay;
        startX = ax;
        startY = ay;
        break;
      }
      case "L": {
        const [x, y] = eat(2);
        const ax = isRel ? cx + x : x;
        const ay = isRel ? cy + y : y;
        segments.push({ cmd: "L", args: [ax, ay] });
        cx = ax;
        cy = ay;
        break;
      }
      case "H": {
        const [x] = eat(1);
        const ax = isRel ? cx + x : x;
        segments.push({ cmd: "L", args: [ax, cy] });
        cx = ax;
        break;
      }
      case "V": {
        const [y] = eat(1);
        const ay = isRel ? cy + y : y;
        segments.push({ cmd: "L", args: [cx, ay] });
        cy = ay;
        break;
      }
      case "C": {
        const [x1, y1, x2, y2, x, y] = eat(6);
        const ax1 = isRel ? cx + x1 : x1;
        const ay1 = isRel ? cy + y1 : y1;
        const ax2 = isRel ? cx + x2 : x2;
        const ay2 = isRel ? cy + y2 : y2;
        const ax = isRel ? cx + x : x;
        const ay = isRel ? cy + y : y;
        segments.push({ cmd: "C", args: [ax1, ay1, ax2, ay2, ax, ay] });
        cx = ax;
        cy = ay;
        break;
      }
      case "S": {
        const [x2, y2, x, y] = eat(4);
        const ax2 = isRel ? cx + x2 : x2;
        const ay2 = isRel ? cy + y2 : y2;
        const ax = isRel ? cx + x : x;
        const ay = isRel ? cy + y : y;
        const prev = segments[segments.length - 1];
        let ax1 = cx;
        let ay1 = cy;
        if (prev && (prev.cmd === "C" || prev.cmd === "S")) {
          ax1 = 2 * cx - prev.args[prev.args.length - 4];
          ay1 = 2 * cy - prev.args[prev.args.length - 3];
        }
        segments.push({ cmd: "C", args: [ax1, ay1, ax2, ay2, ax, ay] });
        cx = ax;
        cy = ay;
        break;
      }
      case "Q": {
        const [x1, y1, x, y] = eat(4);
        const ax1 = isRel ? cx + x1 : x1;
        const ay1 = isRel ? cy + y1 : y1;
        const ax = isRel ? cx + x : x;
        const ay = isRel ? cy + y : y;
        segments.push({ cmd: "Q", args: [ax1, ay1, ax, ay] });
        cx = ax;
        cy = ay;
        break;
      }
      case "T": {
        const [x, y] = eat(2);
        const ax = isRel ? cx + x : x;
        const ay = isRel ? cy + y : y;
        const prev = segments[segments.length - 1];
        let ax1 = cx;
        let ay1 = cy;
        if (prev && prev.cmd === "Q") {
          ax1 = 2 * cx - prev.args[0];
          ay1 = 2 * cy - prev.args[1];
        }
        segments.push({ cmd: "Q", args: [ax1, ay1, ax, ay] });
        cx = ax;
        cy = ay;
        break;
      }
      case "A": {
        const [rx, ry, xRot, large, sweep, x, y] = eat(7);
        const ax = isRel ? cx + x : x;
        const ay = isRel ? cy + y : y;
        segments.push({ cmd: "A", args: [rx, ry, xRot, large, sweep, ax, ay] });
        cx = ax;
        cy = ay;
        break;
      }
      case "Z": {
        segments.push({ cmd: "Z", args: [] });
        cx = startX;
        cy = startY;
        break;
      }
      default:
        return segments;
    }
  }
  return segments;
}

export function transformPathD(d: string, m: Matrix2D): string {
  if (m === IDENTITY) return d;
  const segs = parsePathD(d);
  const parts: string[] = [];
  for (const s of segs) {
    if (s.cmd === "Z") {
      parts.push("Z");
      continue;
    }
    if (s.cmd === "A") {
      const [rx, ry, xRot, large, sweep, x, y] = s.args;
      const p = applyMatrix(m, x, y);
      const sc = uniformScale(m);
      parts.push(
        `A${num(rx * sc.sx)} ${num(ry * sc.sy)} ${num(xRot)} ${large} ${sweep} ${num(p.x)} ${num(p.y)}`,
      );
      continue;
    }
    const out: number[] = [];
    for (let i = 0; i < s.args.length; i += 2) {
      const p = applyMatrix(m, s.args[i], s.args[i + 1]);
      out.push(p.x, p.y);
    }
    parts.push(`${s.cmd}${out.map(num).join(" ")}`);
  }
  return parts.join(" ");
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
