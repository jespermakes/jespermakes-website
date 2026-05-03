import {
  createCircle,
  createRectangle,
  createText,
} from "../shape-factory";
import type { Shape } from "../types";
import type { GeneratorFn } from "./types";

export interface NameplateParams {
  width: number;
  height: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  cornerRadius?: number;
  mountingHoles?: boolean;
  mountingHoleDiameter?: number;
  border?: boolean;
}

export const generateNameplate: GeneratorFn<NameplateParams> = (params) => {
  const W = Math.max(20, params.width);
  const H = Math.max(10, params.height);
  const r = createRectangle({ x: 0, y: 0, width: W, height: H });
  if (params.cornerRadius && params.cornerRadius > 0) {
    r.cornerRadius = Math.min(params.cornerRadius, Math.min(W, H) / 2);
  }
  r.cutType = "outside";
  const out: Shape[] = [r];

  const text = createText({
    x: 0,
    y: 0,
    text: params.text || "Name",
    fontSize: Math.max(3, params.fontSize ?? Math.min(W, H) * 0.4),
    fontFamily: params.fontFamily,
  });
  text.cutType = "pocket";
  out.push(text);

  if (params.border) {
    const inset = Math.min(W, H) * 0.08;
    const inner = createRectangle({
      x: 0,
      y: 0,
      width: W - inset * 2,
      height: H - inset * 2,
    });
    if (r.cornerRadius && r.cornerRadius > 0) {
      inner.cornerRadius = Math.max(0, r.cornerRadius - inset);
    }
    inner.cutType = "online";
    out.push(inner);
  }

  if (params.mountingHoles) {
    const d = Math.max(2, params.mountingHoleDiameter ?? 4);
    const margin = Math.max(d, Math.min(W, H) * 0.08);
    const positions = [
      { x: -W / 2 + margin, y: 0 },
      { x: W / 2 - margin, y: 0 },
    ];
    for (const p of positions) {
      const hole = createCircle({ x: p.x, y: p.y, width: d, height: d });
      hole.cutType = "inside";
      out.push(hole);
    }
  }

  return { shapesToAdd: out };
};
