import {
  createCircle,
  createLine,
  createPath,
  createRectangle,
  createText,
} from "./shape-factory";
import type { Shape } from "./types";
import { MM_PER_INCH } from "./constants";

export interface SVGImportResult {
  shapes: Shape[];
  /** Names of element types that were skipped during import. */
  skipped: string[];
}

/* ------------------------------ Affine matrix --------------------------- */

export type Matrix2D = [number, number, number, number, number, number];
const IDENTITY: Matrix2D = [1, 0, 0, 1, 0, 0];

function multiply(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

function applyMatrix(m: Matrix2D, x: number, y: number): { x: number; y: number } {
  return { x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] };
}

function translate(tx: number, ty: number): Matrix2D {
  return [1, 0, 0, 1, tx, ty];
}

function scale(sx: number, sy: number = sx): Matrix2D {
  return [sx, 0, 0, sy, 0, 0];
}

function rotate(deg: number): Matrix2D {
  const a = (deg * Math.PI) / 180;
  return [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0];
}

function parseTransform(str: string | null): Matrix2D {
  if (!str) return IDENTITY;
  let m: Matrix2D = IDENTITY;
  const re = /(translate|rotate|scale|matrix|skewX|skewY)\s*\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(str)) !== null) {
    const fn = match[1];
    const args = match[2]
      .split(/[\s,]+/)
      .map((s) => Number.parseFloat(s))
      .filter((n) => !Number.isNaN(n));
    let next: Matrix2D = IDENTITY;
    switch (fn) {
      case "translate":
        next = translate(args[0] ?? 0, args[1] ?? 0);
        break;
      case "scale":
        next = scale(args[0] ?? 1, args.length >= 2 ? args[1] : args[0] ?? 1);
        break;
      case "rotate":
        if (args.length >= 3) {
          next = multiply(
            translate(args[1], args[2]),
            multiply(rotate(args[0]), translate(-args[1], -args[2])),
          );
        } else {
          next = rotate(args[0] ?? 0);
        }
        break;
      case "matrix":
        if (args.length === 6) {
          next = args as Matrix2D;
        }
        break;
      default:
        // skewX / skewY — rare, ignore.
        next = IDENTITY;
        break;
    }
    m = multiply(m, next);
  }
  return m;
}

function isAxisAligned(m: Matrix2D): boolean {
  return Math.abs(m[1]) < 1e-6 && Math.abs(m[2]) < 1e-6;
}

function rotationDegrees(m: Matrix2D): number {
  return (Math.atan2(m[1], m[0]) * 180) / Math.PI;
}

function uniformScale(m: Matrix2D): { sx: number; sy: number } {
  return {
    sx: Math.hypot(m[0], m[1]),
    sy: Math.hypot(m[2], m[3]),
  };
}

/* ------------------------------ Path parsing --------------------------- */

const COMMAND_RE = /[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:[eE][-+]?\d+)?/g;

interface ParsedSegment {
  cmd: string; // always uppercase = absolute
  args: number[];
}

/** Parse a path d-string and convert all commands to absolute. */
function parsePathD(d: string): ParsedSegment[] {
  const tokens = d.match(COMMAND_RE) ?? [];
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
      // Implicit repeat: subsequent coords use last command, with M→L per spec.
      cmd =
        lastCmd === "M" ? "L" : lastCmd === "m" ? "l" : lastCmd || "L";
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
        // Reflect previous control point.
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
        // Pass through unchanged; transforming arcs precisely requires
        // arc-to-bezier conversion which we skip.
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
        // Unknown command — bail.
        return segments;
    }
  }
  return segments;
}

function transformPathD(d: string, m: Matrix2D): string {
  if (m === IDENTITY) return d;
  const segs = parsePathD(d);
  const parts: string[] = [];
  for (const s of segs) {
    if (s.cmd === "Z") {
      parts.push("Z");
      continue;
    }
    if (s.cmd === "A") {
      // For arcs, only transform the endpoint and (loosely) the radii.
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

function num(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(4).replace(/\.?0+$/, "");
}

/* ------------------------------ Element walk --------------------------- */

const PRESENTATION_DEFAULTS = {
  stroke: "#2C1810",
  strokeWidth: 0.5,
  fill: "none",
};

function readPresentation(
  el: Element,
  inherited = PRESENTATION_DEFAULTS,
): { stroke: string; strokeWidth: number; fill: string } {
  const styleAttr = el.getAttribute("style") ?? "";
  const styleMap = new Map<string, string>();
  for (const part of styleAttr.split(";")) {
    const [k, v] = part.split(":").map((s) => s?.trim());
    if (k && v) styleMap.set(k, v);
  }
  const get = (name: string) =>
    styleMap.get(name) ?? el.getAttribute(name) ?? null;
  const stroke = get("stroke");
  const fill = get("fill");
  const strokeWidth = get("stroke-width");
  return {
    stroke: stroke && stroke !== "none" ? stroke : inherited.stroke,
    fill: fill ?? inherited.fill,
    strokeWidth: strokeWidth ? Number.parseFloat(strokeWidth) : inherited.strokeWidth,
  };
}

function len(el: Element, attr: string, fallback = 0): number {
  const v = el.getAttribute(attr);
  if (v == null) return fallback;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function walk(
  el: Element,
  parentMatrix: Matrix2D,
  parentPres: ReturnType<typeof readPresentation>,
  out: Shape[],
  skipped: Set<string>,
): void {
  if (el.nodeType !== 1) return;
  const tag = el.tagName.toLowerCase();
  const localTransform = parseTransform(el.getAttribute("transform"));
  const matrix = multiply(parentMatrix, localTransform);
  const pres = readPresentation(el, parentPres);

  switch (tag) {
    case "svg":
    case "g":
    case "symbol":
    case "defs": {
      // <defs> / <symbol>: usually contains reusable elements but not direct
      // shapes. We still recurse to find anything renderable.
      const kids = Array.from(el.children) as Element[];
      for (const k of kids) walk(k, matrix, pres, out, skipped);
      return;
    }
    case "rect": {
      const x = len(el, "x");
      const y = len(el, "y");
      const w = len(el, "width");
      const h = len(el, "height");
      if (w <= 0 || h <= 0) return;
      if (isAxisAligned(matrix)) {
        const tl = applyMatrix(matrix, x, y);
        const br = applyMatrix(matrix, x + w, y + h);
        const minX = Math.min(tl.x, br.x);
        const maxX = Math.max(tl.x, br.x);
        const minY = Math.min(tl.y, br.y);
        const maxY = Math.max(tl.y, br.y);
        const shape = createRectangle({
          x: (minX + maxX) / 2,
          y: (minY + maxY) / 2,
          width: maxX - minX,
          height: maxY - minY,
        });
        out.push(applyPresentation(shape, pres));
        return;
      }
      // Rotated/skewed rect → convert to a path.
      const d = `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`;
      const transformed = transformPathD(d, matrix);
      const shape = createPath({ pathData: transformed, closed: true });
      out.push(applyPresentation(shape, pres));
      return;
    }
    case "circle": {
      const cx = len(el, "cx");
      const cy = len(el, "cy");
      const r = len(el, "r");
      if (r <= 0) return;
      if (isAxisAligned(matrix)) {
        const c = applyMatrix(matrix, cx, cy);
        const sc = uniformScale(matrix);
        const shape = createCircle({
          x: c.x,
          y: c.y,
          width: 2 * r * sc.sx,
          height: 2 * r * sc.sy,
        });
        out.push(applyPresentation(shape, pres));
        return;
      }
      // Rotated → convert to circle path approximation.
      const d = circleD(cx, cy, r);
      const transformed = transformPathD(d, matrix);
      const shape = createPath({ pathData: transformed, closed: true });
      out.push(applyPresentation(shape, pres));
      return;
    }
    case "ellipse": {
      const cx = len(el, "cx");
      const cy = len(el, "cy");
      const rx = len(el, "rx");
      const ry = len(el, "ry");
      if (rx <= 0 || ry <= 0) return;
      if (isAxisAligned(matrix)) {
        const c = applyMatrix(matrix, cx, cy);
        const sc = uniformScale(matrix);
        const shape = createCircle({
          x: c.x,
          y: c.y,
          width: 2 * rx * sc.sx,
          height: 2 * ry * sc.sy,
        });
        out.push(applyPresentation(shape, pres));
        return;
      }
      const d = ellipseD(cx, cy, rx, ry);
      const transformed = transformPathD(d, matrix);
      const shape = createPath({ pathData: transformed, closed: true });
      out.push(applyPresentation(shape, pres));
      return;
    }
    case "line": {
      const x1 = len(el, "x1");
      const y1 = len(el, "y1");
      const x2 = len(el, "x2");
      const y2 = len(el, "y2");
      const a = applyMatrix(matrix, x1, y1);
      const b = applyMatrix(matrix, x2, y2);
      const shape = createLine({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      out.push(applyPresentation(shape, pres));
      return;
    }
    case "polygon":
    case "polyline": {
      const pts = (el.getAttribute("points") ?? "")
        .split(/[\s,]+/)
        .map((s) => Number.parseFloat(s))
        .filter((n) => Number.isFinite(n));
      if (pts.length < 4) return;
      let d = "";
      for (let i = 0; i < pts.length; i += 2) {
        d += i === 0 ? `M${pts[i]},${pts[i + 1]}` : ` L${pts[i]},${pts[i + 1]}`;
      }
      if (tag === "polygon") d += " Z";
      const transformed = transformPathD(d, matrix);
      const shape = createPath({
        pathData: transformed,
        closed: tag === "polygon",
      });
      out.push(applyPresentation(shape, pres));
      return;
    }
    case "path": {
      const d = el.getAttribute("d");
      if (!d) return;
      const transformed = transformPathD(d, matrix);
      const closed = /[zZ]\s*$/.test(transformed);
      const shape = createPath({ pathData: transformed, closed });
      out.push(applyPresentation(shape, pres));
      return;
    }
    case "text": {
      const x = len(el, "x");
      const y = len(el, "y");
      const fontSize = Number.parseFloat(el.getAttribute("font-size") ?? "10") || 10;
      const text = (el.textContent ?? "").trim();
      const p = applyMatrix(matrix, x, y);
      const rot = isAxisAligned(matrix) ? 0 : rotationDegrees(matrix);
      const shape = createText({
        x: p.x,
        y: p.y,
        text: text || "Text",
        fontSize,
      });
      shape.rotation = rot;
      shape.stroke = pres.stroke;
      out.push(shape);
      return;
    }
    case "image":
    case "use":
    case "clippath":
    case "mask":
    case "filter":
    case "lineargradient":
    case "radialgradient":
    case "pattern":
    case "style":
      skipped.add(tag);
      return;
    default:
      // Unknown element — try recursing in case it has children.
      {
        const kids = Array.from(el.children) as Element[];
        if (kids.length === 0) skipped.add(tag);
        else for (const k of kids) walk(k, matrix, pres, out, skipped);
      }
      return;
  }
}

function applyPresentation(
  shape: Shape,
  pres: { stroke: string; strokeWidth: number; fill: string },
): Shape {
  return {
    ...shape,
    stroke: pres.stroke,
    strokeWidth: pres.strokeWidth,
    fill: pres.fill,
  };
}

function circleD(cx: number, cy: number, r: number): string {
  const k = 0.5522847498307933 * r;
  return [
    `M${cx},${cy - r}`,
    `C${cx + k},${cy - r} ${cx + r},${cy - k} ${cx + r},${cy}`,
    `C${cx + r},${cy + k} ${cx + k},${cy + r} ${cx},${cy + r}`,
    `C${cx - k},${cy + r} ${cx - r},${cy + k} ${cx - r},${cy}`,
    `C${cx - r},${cy - k} ${cx - k},${cy - r} ${cx},${cy - r}`,
    "Z",
  ].join(" ");
}

function ellipseD(cx: number, cy: number, rx: number, ry: number): string {
  const kx = 0.5522847498307933 * rx;
  const ky = 0.5522847498307933 * ry;
  return [
    `M${cx},${cy - ry}`,
    `C${cx + kx},${cy - ry} ${cx + rx},${cy - ky} ${cx + rx},${cy}`,
    `C${cx + rx},${cy + ky} ${cx + kx},${cy + ry} ${cx},${cy + ry}`,
    `C${cx - kx},${cy + ry} ${cx - rx},${cy + ky} ${cx - rx},${cy}`,
    `C${cx - rx},${cy - ky} ${cx - kx},${cy - ry} ${cx},${cy - ry}`,
    "Z",
  ].join(" ");
}

/* ------------------------------ Unit handling -------------------------- */

function parseLengthMm(value: string | null): number | null {
  if (!value) return null;
  const m = /^\s*(-?\d*\.?\d+)\s*([a-z%]*)\s*$/i.exec(value);
  if (!m) return null;
  const n = Number.parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  switch (unit) {
    case "mm":
      return n;
    case "cm":
      return n * 10;
    case "in":
      return n * MM_PER_INCH;
    case "pt":
      return n * (MM_PER_INCH / 72);
    case "pc":
      return n * (MM_PER_INCH / 6);
    case "px":
    case "":
      // Treat as 96dpi pixels.
      return n * (MM_PER_INCH / 96);
    default:
      return null;
  }
}

/* ------------------------------ Public API ----------------------------- */

export function parseSVG(svgString: string): SVGImportResult {
  if (typeof DOMParser === "undefined") {
    return { shapes: [], skipped: [] };
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return { shapes: [], skipped: [] };

  // Compute outer transform from width/height + viewBox so the import is
  // always in mm document units.
  const widthAttr = svg.getAttribute("width");
  const heightAttr = svg.getAttribute("height");
  const widthMm = parseLengthMm(widthAttr);
  const heightMm = parseLengthMm(heightAttr);
  const viewBox = (svg.getAttribute("viewBox") ?? "")
    .split(/[\s,]+/)
    .map((s) => Number.parseFloat(s))
    .filter((n) => Number.isFinite(n));

  let rootMatrix: Matrix2D = IDENTITY;
  if (viewBox.length === 4 && widthMm && heightMm) {
    const sx = widthMm / viewBox[2];
    const sy = heightMm / viewBox[3];
    rootMatrix = multiply(scale(sx, sy), translate(-viewBox[0], -viewBox[1]));
  } else if (viewBox.length !== 4 && (widthMm || heightMm)) {
    // No viewBox: assume coords are pixels at 96dpi.
    const f = MM_PER_INCH / 96;
    rootMatrix = scale(f, f);
  } else if (viewBox.length !== 4) {
    // No viewBox and no width/height in mm: assume pixels at 96dpi.
    const f = MM_PER_INCH / 96;
    rootMatrix = scale(f, f);
  }

  const out: Shape[] = [];
  const skipped = new Set<string>();
  walk(svg, rootMatrix, PRESENTATION_DEFAULTS, out, skipped);
  return { shapes: out, skipped: Array.from(skipped) };
}

export function recenterImportedShapes(
  shapes: Shape[],
  centerX: number,
  centerY: number,
): Shape[] {
  if (shapes.length === 0) return shapes;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of shapes) {
    minX = Math.min(minX, s.x - s.width / 2);
    minY = Math.min(minY, s.y - s.height / 2);
    maxX = Math.max(maxX, s.x + s.width / 2);
    maxY = Math.max(maxY, s.y + s.height / 2);
  }
  const dx = centerX - (minX + maxX) / 2;
  const dy = centerY - (minY + maxY) / 2;
  if (dx === 0 && dy === 0) return shapes;
  return shapes.map((s) => translateShape(s, dx, dy));
}

function translateShape(s: Shape, dx: number, dy: number): Shape {
  const next: Shape = { ...s, x: s.x + dx, y: s.y + dy };
  if (s.points) {
    next.points = s.points.map((p) => ({
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
  if (s.pathData) {
    next.pathData = transformPathD(s.pathData, translate(dx, dy));
  }
  return next;
}
