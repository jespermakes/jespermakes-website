import { createCircle, createPath } from "../shape-factory";
import type { PathPoint, Shape } from "../types";
import type { GeneratorFn } from "./types";

export interface ShelfBracketParams {
  width: number;
  height: number;
  materialThickness?: number;
  style?: "triangle" | "curved" | "decorative";
  mountingHoles?: number;
  mountingHoleDiameter?: number;
}

export const generateShelfBracket: GeneratorFn<ShelfBracketParams> = (
  params,
  ctx,
) => {
  const W = Math.max(40, params.width);
  const H = Math.max(40, params.height);
  const thickness = Math.max(0.1, params.materialThickness ?? ctx.materialThickness);
  void thickness; // referenced for future routing offsets
  const style = params.style ?? "triangle";

  let outline: PathPoint[];
  if (style === "triangle") {
    // Right triangle with the right angle at top-left, hypotenuse running
    // from top-right to bottom-left.
    outline = [
      { x: -W / 2, y: -H / 2 }, // top-left (mount corner)
      { x: W / 2, y: -H / 2 }, // top-right (shelf edge)
      { x: -W / 2, y: H / 2 }, // bottom-left (wall edge)
    ];
  } else if (style === "curved") {
    // Rounded interior cut: top edge straight, then a quarter-circle arc
    // sweeping down to the wall edge. Approximated with a fan of points.
    outline = [{ x: -W / 2, y: -H / 2 }, { x: W / 2, y: -H / 2 }];
    const arcPoints = 16;
    const cx = -W / 2;
    const cy = -H / 2;
    for (let i = 0; i <= arcPoints; i++) {
      const a = (i / arcPoints) * (Math.PI / 2);
      outline.push({
        x: cx + Math.cos(a) * W,
        y: cy + Math.sin(a) * H,
      });
    }
  } else {
    // Decorative: a stepped profile (looks vaguely like a corbel).
    outline = [
      { x: -W / 2, y: -H / 2 },
      { x: W / 2, y: -H / 2 },
      { x: W / 2, y: -H / 2 + H * 0.25 },
      { x: W / 2 - W * 0.3, y: -H / 2 + H * 0.45 },
      { x: -W / 2 + W * 0.2, y: -H / 2 + H * 0.7 },
      { x: -W / 2, y: H / 2 },
    ];
  }

  const path = createPath({ points: outline, closed: true });
  path.cutType = "outside";
  const out: Shape[] = [path];

  const holes = Math.max(0, Math.min(8, Math.round(params.mountingHoles ?? 2)));
  if (holes > 0) {
    const d = Math.max(2, params.mountingHoleDiameter ?? 5);
    // Distribute mounting holes along the wall edge (left side).
    const top = -H / 2 + d * 1.5;
    const bottom = H / 2 - d * 1.5;
    for (let i = 0; i < holes; i++) {
      const t = holes === 1 ? 0.5 : i / (holes - 1);
      const y = top + (bottom - top) * t;
      const hole = createCircle({
        x: -W / 2 + d * 1.5,
        y,
        width: d,
        height: d,
      });
      hole.cutType = "inside";
      out.push(hole);
    }
  }
  return { shapesToAdd: out };
};
