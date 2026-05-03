import { createCircle } from "../shape-factory";
import type { Shape } from "../types";
import { findShapeByDescription } from "./shape-resolver";
import type { GeneratorFn } from "./types";

export interface HoleParams {
  targetDescription: string;
  diameter: number;
  position?:
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center"
    | "left-center"
    | "right-center";
  offsetX?: number;
  offsetY?: number;
}

/**
 * Place a circle inside an existing shape (resolved by natural-language
 * description) and assign cutType: "inside" so it reads as a hole.
 *
 * If the description doesn't match anything, returns an empty result with
 * a `message` so the AI panel can surface the failure to the user.
 */
export const generateHole: GeneratorFn<HoleParams> = (params, ctx) => {
  const target = findShapeByDescription(params.targetDescription, ctx.shapes);
  if (!target) {
    return {
      message: `I couldn't find "${params.targetDescription}" on the canvas.`,
    };
  }
  const diameter = Math.max(0.1, params.diameter);
  const halfW = target.width / 2;
  const halfH = target.height / 2;
  const positions: Record<string, { x: number; y: number }> = {
    center: { x: target.x, y: target.y },
    "top-left": { x: target.x - halfW + diameter, y: target.y - halfH + diameter },
    "top-right": { x: target.x + halfW - diameter, y: target.y - halfH + diameter },
    "bottom-left": { x: target.x - halfW + diameter, y: target.y + halfH - diameter },
    "bottom-right": { x: target.x + halfW - diameter, y: target.y + halfH - diameter },
    "top-center": { x: target.x, y: target.y - halfH + diameter },
    "bottom-center": { x: target.x, y: target.y + halfH - diameter },
    "left-center": { x: target.x - halfW + diameter, y: target.y },
    "right-center": { x: target.x + halfW - diameter, y: target.y },
  };
  const base = positions[params.position ?? "center"] ?? positions.center;
  const offsetX = params.offsetX ?? 0;
  const offsetY = params.offsetY ?? 0;
  const hole: Shape = createCircle({
    x: base.x + offsetX,
    y: base.y + offsetY,
    width: diameter,
    height: diameter,
  });
  hole.cutType = "inside";
  return { shapesToAdd: [hole] };
};
