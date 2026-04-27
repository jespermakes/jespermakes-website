import type { Shape, ShapeType } from "./types";
import {
  DEFAULT_FILL,
  DEFAULT_STROKE,
  DEFAULT_STROKE_WIDTH,
} from "./constants";

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

export { generateId };
