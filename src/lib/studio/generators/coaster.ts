import {
  createCircle,
  createPath,
  createRectangle,
  createText,
} from "../shape-factory";
import { generatePolygonPoints } from "../path-ops";
import type { Shape } from "../types";
import { rowLayout } from "./layout";
import type { GeneratorFn } from "./types";

export interface CoasterParams {
  diameter: number;
  shape?: "circle" | "square" | "hexagon" | "rounded-square";
  cornerRadius?: number;
  text?: string;
  textSize?: number;
  border?: boolean;
  borderWidth?: number;
  count?: number;
}

function buildOne(params: CoasterParams): Shape[] {
  const d = Math.max(10, params.diameter);
  const shape = params.shape ?? "circle";
  const out: Shape[] = [];
  let outline: Shape;
  if (shape === "square") {
    outline = createRectangle({ x: 0, y: 0, width: d, height: d });
  } else if (shape === "rounded-square") {
    const rect = createRectangle({ x: 0, y: 0, width: d, height: d });
    rect.cornerRadius = Math.max(0, params.cornerRadius ?? d * 0.15);
    outline = rect;
  } else if (shape === "hexagon") {
    const pts = generatePolygonPoints(0, 0, d / 2, 6, false, 100, 0);
    outline = createPath({ points: pts, closed: true });
  } else {
    outline = createCircle({ x: 0, y: 0, width: d, height: d });
  }
  outline.cutType = "outside";
  out.push(outline);
  if (params.border) {
    const borderW = Math.max(0.5, params.borderWidth ?? 3);
    const innerD = Math.max(2, d - 2 * borderW);
    let inner: Shape;
    if (shape === "square") {
      inner = createRectangle({ x: 0, y: 0, width: innerD, height: innerD });
    } else if (shape === "rounded-square") {
      const rect = createRectangle({ x: 0, y: 0, width: innerD, height: innerD });
      rect.cornerRadius = Math.max(0, params.cornerRadius ?? innerD * 0.15);
      inner = rect;
    } else if (shape === "hexagon") {
      const pts = generatePolygonPoints(0, 0, innerD / 2, 6, false, 100, 0);
      inner = createPath({ points: pts, closed: true });
    } else {
      inner = createCircle({ x: 0, y: 0, width: innerD, height: innerD });
    }
    inner.cutType = "online";
    out.push(inner);
  }
  if (params.text && params.text.trim().length > 0) {
    const textShape = createText({
      x: 0,
      y: 0,
      text: params.text,
      fontSize: Math.max(2, params.textSize ?? d * 0.18),
    });
    textShape.cutType = "pocket";
    out.push(textShape);
  }
  return out;
}

export const generateCoaster: GeneratorFn<CoasterParams> = (params) => {
  const count = Math.max(1, Math.min(20, params.count ?? 1));
  const groups: Shape[][] = [];
  for (let i = 0; i < count; i++) groups.push(buildOne(params));
  const placed = rowLayout(groups, 12);
  return { shapesToAdd: placed };
};
