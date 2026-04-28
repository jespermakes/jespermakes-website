import { circleToPoints, rectangleToPoints } from "./path-ops";
import type { PathPoint, Shape, TabDefinition } from "./types";

interface PerimeterSegment {
  start: { x: number; y: number };
  end: { x: number; y: number };
  length: number;
  cumulative: number; // length up to and including this segment
}

interface PerimeterSamples {
  segments: PerimeterSegment[];
  total: number;
}

function buildPolyline(shape: Shape): { x: number; y: number }[] {
  if (shape.type === "rectangle") {
    return rectangleToPoints(shape).map((p) => ({ x: p.x, y: p.y }));
  }
  if (shape.type === "circle") {
    // Sample 64 points around the ellipse for a smooth perimeter.
    const points: { x: number; y: number }[] = [];
    const N = 64;
    const rx = shape.width / 2;
    const ry = shape.height / 2;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      points.push({
        x: shape.x + Math.cos(a) * rx,
        y: shape.y + Math.sin(a) * ry,
      });
    }
    return points;
  }
  if (shape.type === "path" && shape.points && shape.closed) {
    return flattenPathPoints(shape.points);
  }
  return [];
}

function flattenPathPoints(points: PathPoint[]): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    const prev = i === 0 ? points[points.length - 1] : points[i - 1];
    const curr = points[i];
    if (prev.handleOut || curr.handleIn) {
      sampleBezier(
        out,
        { x: prev.x, y: prev.y },
        prev.handleOut ?? { x: prev.x, y: prev.y },
        curr.handleIn ?? { x: curr.x, y: curr.y },
        { x: curr.x, y: curr.y },
        16,
      );
    } else {
      out.push({ x: curr.x, y: curr.y });
    }
  }
  return out;
}

function sampleBezier(
  out: { x: number; y: number }[],
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  n: number,
) {
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    const x =
      u * u * u * p0.x +
      3 * u * u * t * p1.x +
      3 * u * t * t * p2.x +
      t * t * t * p3.x;
    const y =
      u * u * u * p0.y +
      3 * u * u * t * p1.y +
      3 * u * t * t * p2.y +
      t * t * t * p3.y;
    out.push({ x, y });
  }
}

function buildPerimeter(shape: Shape): PerimeterSamples {
  const polyline = buildPolyline(shape);
  if (polyline.length < 2) {
    return { segments: [], total: 0 };
  }
  const segments: PerimeterSegment[] = [];
  let cumulative = 0;
  for (let i = 0; i < polyline.length; i++) {
    const start = polyline[i];
    const end = polyline[(i + 1) % polyline.length];
    const len = Math.hypot(end.x - start.x, end.y - start.y);
    cumulative += len;
    segments.push({ start, end, length: len, cumulative });
  }
  return { segments, total: cumulative };
}

export interface TabSample {
  /** Center point of the tab on the path. */
  cx: number;
  cy: number;
  /** Tangent angle in radians (for orienting the rendered tab marker). */
  angleRad: number;
  /** The TabDefinition this came from (echoed for the renderer). */
  tab: TabDefinition;
}

/**
 * Sample the position + tangent along the shape's perimeter for each tab.
 * Returns an empty array if the shape doesn't support tabs.
 */
export function sampleTabsForShape(shape: Shape): TabSample[] {
  if (!shape.tabs || shape.tabs.length === 0) return [];
  const perim = buildPerimeter(shape);
  if (perim.total <= 0) return [];

  const samples: TabSample[] = [];
  for (const tab of shape.tabs) {
    const target = ((tab.position % 1) + 1) % 1 * perim.total;
    let prevCum = 0;
    for (const seg of perim.segments) {
      if (target <= seg.cumulative) {
        const within = (target - prevCum) / Math.max(1e-9, seg.length);
        const cx = seg.start.x + (seg.end.x - seg.start.x) * within;
        const cy = seg.start.y + (seg.end.y - seg.start.y) * within;
        const angleRad = Math.atan2(
          seg.end.y - seg.start.y,
          seg.end.x - seg.start.x,
        );
        samples.push({ cx, cy, angleRad, tab });
        break;
      }
      prevCum = seg.cumulative;
    }
  }
  return samples;
}

/**
 * Build N tabs evenly spaced around the perimeter, with the requested
 * width and height (height defaults to half the material thickness).
 */
export function autoPlaceTabs(
  count: number,
  width: number,
  height: number,
): TabDefinition[] {
  if (count <= 0) return [];
  const tabs: TabDefinition[] = [];
  for (let i = 0; i < count; i++) {
    tabs.push({
      position: (i + 0.5) / count,
      width,
      height,
    });
  }
  return tabs;
}
