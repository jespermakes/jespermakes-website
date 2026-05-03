import type { Shape } from "../types";
import {
  createCircle,
  createPath,
  createRectangle,
} from "../shape-factory";
import { generatePolygonPoints } from "../path-ops";
import type { GeneratorFn } from "./types";

export interface SimpleShapeParams {
  type: "rectangle" | "circle" | "polygon" | "star";
  width: number;
  height?: number;
  cornerRadius?: number;
  sides?: number;
  /** For star: ratio of inner to outer radius, 0–1. Default 0.5. */
  innerRadius?: number;
  x?: number;
  y?: number;
}

export const generateSimpleShape: GeneratorFn<SimpleShapeParams> = (
  params,
) => {
  const x = params.x ?? 0;
  const y = params.y ?? 0;
  const width = Math.max(0.1, params.width);
  const height = Math.max(0.1, params.height ?? width);

  if (params.type === "rectangle") {
    const shape = createRectangle({ x, y, width, height });
    if (params.cornerRadius && params.cornerRadius > 0) {
      shape.cornerRadius = params.cornerRadius;
    }
    return { shapesToAdd: [shape] };
  }
  if (params.type === "circle") {
    return {
      shapesToAdd: [createCircle({ x, y, width, height })],
    };
  }
  if (params.type === "polygon" || params.type === "star") {
    const sides = Math.max(3, params.sides ?? 6);
    const star = params.type === "star";
    const radius = Math.min(width, height) / 2;
    const innerPct = Math.max(
      5,
      Math.min(95, (params.innerRadius ?? 0.5) * 100),
    );
    const points = generatePolygonPoints(
      x,
      y,
      radius,
      sides,
      star,
      innerPct,
      0,
    );
    const shape = createPath({ points, closed: true });
    return { shapesToAdd: [shape] };
  }
  return {};
};

export type { Shape };
