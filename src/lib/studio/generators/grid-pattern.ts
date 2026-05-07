import { createCircle, createRectangle } from "../shape-factory";
import type { Shape } from "../types";
import type { GeneratorFn } from "./types";

export interface GridPatternParams {
  startX?: number;
  startY?: number;
  columns: number;
  rows: number;
  spacingX: number;
  spacingY: number;
  elementType: "circle" | "rectangle";
  elementWidth: number;
  elementHeight?: number;
}

export const generateGridPattern: GeneratorFn<GridPatternParams> = (
  params,
) => {
  const cols = Math.max(1, Math.min(50, Math.round(params.columns)));
  const rows = Math.max(1, Math.min(50, Math.round(params.rows)));
  const sx = Math.max(0.1, params.spacingX);
  const sy = Math.max(0.1, params.spacingY);
  const w = Math.max(0.1, params.elementWidth);
  const h = Math.max(0.1, params.elementHeight ?? w);
  // Center the grid on (startX, startY) — defaults to origin.
  const totalW = (cols - 1) * sx;
  const totalH = (rows - 1) * sy;
  const cx0 = (params.startX ?? 0) - totalW / 2;
  const cy0 = (params.startY ?? 0) - totalH / 2;

  const out: Shape[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = cx0 + c * sx;
      const y = cy0 + r * sy;
      const shape =
        params.elementType === "circle"
          ? createCircle({ x, y, width: w, height: w })
          : createRectangle({ x, y, width: w, height: h });
      shape.cutType = "inside";
      out.push(shape);
    }
  }
  return { shapesToAdd: out };
};
