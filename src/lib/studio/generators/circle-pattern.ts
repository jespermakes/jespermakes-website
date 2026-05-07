import { createCircle, createRectangle } from "../shape-factory";
import type { Shape } from "../types";
import type { GeneratorFn } from "./types";

export interface CirclePatternParams {
  centerX?: number;
  centerY?: number;
  radius: number;
  count: number;
  elementType: "circle" | "rectangle" | "slot";
  elementWidth: number;
  elementHeight?: number;
  startAngle?: number;
}

/** N elements evenly spaced around a circle, each rotated to face outward. */
export const generateCirclePattern: GeneratorFn<CirclePatternParams> = (
  params,
) => {
  const cx = params.centerX ?? 0;
  const cy = params.centerY ?? 0;
  const r = Math.max(0.1, params.radius);
  const count = Math.max(1, Math.min(120, Math.round(params.count)));
  const w = Math.max(0.1, params.elementWidth);
  const h = Math.max(0.1, params.elementHeight ?? w);
  const startAngleRad = ((params.startAngle ?? 0) * Math.PI) / 180;

  const out: Shape[] = [];
  for (let i = 0; i < count; i++) {
    const angle = startAngleRad + (i * 2 * Math.PI) / count;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    const rotationDeg = (angle * 180) / Math.PI + 90;
    let shape: Shape;
    if (params.elementType === "circle") {
      shape = createCircle({ x, y, width: w, height: w });
    } else {
      shape = createRectangle({ x, y, width: w, height: h });
      shape.rotation = rotationDeg;
    }
    shape.cutType = "inside";
    out.push(shape);
  }
  return { shapesToAdd: out };
};
