import type { PathPoint, Shape, ShapeType } from "./types";
import {
  DEFAULT_FILL,
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH,
} from "./constants";
import { pathDataBounds, pointsBounds } from "./path-ops";

let counter = 0;
function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    try {
      return crypto.randomUUID();
    } catch {
      // fall through
    }
  }
  counter += 1;
  return `shape-${Date.now().toString(36)}-${counter}`;
}

export interface RectangleInput {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LineInput {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function baseShape(type: ShapeType): Pick<
  Shape,
  "id" | "type" | "rotation" | "stroke" | "strokeWidth" | "fill"
> {
  return {
    id: generateId(),
    type,
    rotation: 0,
    stroke: DEFAULT_STROKE,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    fill: DEFAULT_FILL,
  };
}

export function createRectangle({ x, y, width, height }: RectangleInput): Shape {
  return {
    ...baseShape("rectangle"),
    x,
    y,
    width: Math.max(0, width),
    height: Math.max(0, height),
  };
}

export function createCircle({ x, y, width, height }: RectangleInput): Shape {
  return {
    ...baseShape("circle"),
    x,
    y,
    width: Math.max(0, width),
    height: Math.max(0, height),
  };
}

export const DEFAULT_TEXT = "Text";
export const DEFAULT_FONT_SIZE = 10;
export const DEFAULT_FONT_FAMILY = "Inter, sans-serif";

/** Estimate a bounding box for a text shape from its content + size. */
export function estimateTextBox(
  text: string,
  fontSize: number,
): { width: number; height: number } {
  const lines = (text === "" ? " " : text).split("\n");
  const longest = lines.reduce(
    (n, line) => Math.max(n, line.length),
    1,
  );
  // Rough heuristic for proportional fonts; good enough for selection bboxes.
  const width = fontSize * 0.55 * longest;
  const height = fontSize * 1.2 * lines.length;
  return { width, height };
}

export interface TextInput {
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAnchor?: "start" | "middle" | "end";
}

export function createText({
  x,
  y,
  text = DEFAULT_TEXT,
  fontSize = DEFAULT_FONT_SIZE,
  fontFamily = DEFAULT_FONT_FAMILY,
  textAnchor = "middle",
}: TextInput): Shape {
  const { width, height } = estimateTextBox(text, fontSize);
  return {
    ...baseShape("text"),
    x,
    y,
    width,
    height,
    text,
    fontSize,
    fontFamily,
    textAnchor,
  };
}

export function createLine({ x1, y1, x2, y2 }: LineInput): Shape {
  // Store the line with its centroid as (x, y); endpoints relative.
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const dx1 = x1 - cx;
  const dy1 = y1 - cy;
  const dx2 = x2 - cx;
  const dy2 = y2 - cy;
  return {
    ...baseShape("line"),
    x: cx,
    y: cy,
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
    x1: dx1,
    y1: dy1,
    x2: dx2,
    y2: dy2,
  };
}

export interface PathInput {
  points?: PathPoint[];
  closed?: boolean;
  pathData?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
}

export function createPath({
  points,
  closed = false,
  pathData,
  stroke,
  strokeWidth,
  fill,
}: PathInput): Shape {
  const base = baseShape("path");
  let bounds = null;
  if (pathData) bounds = pathDataBounds(pathData);
  else if (points && points.length > 0) bounds = pointsBounds(points);
  const width = bounds ? bounds.maxX - bounds.minX : 0;
  const height = bounds ? bounds.maxY - bounds.minY : 0;
  const cx = bounds ? (bounds.minX + bounds.maxX) / 2 : 0;
  const cy = bounds ? (bounds.minY + bounds.maxY) / 2 : 0;
  return {
    ...base,
    stroke: stroke ?? base.stroke,
    strokeWidth: strokeWidth ?? base.strokeWidth,
    fill: fill ?? base.fill,
    x: cx,
    y: cy,
    width,
    height,
    points,
    pathData,
    closed,
  };
}

export { generateId };
