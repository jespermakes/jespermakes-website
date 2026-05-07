import { createPath, createRectangle, generateId } from "../shape-factory";
import type { PathPoint, Shape } from "../types";
import { rowLayout } from "./layout";
import type { GeneratorFn } from "./types";

export interface PhoneStandParams {
  angle?: number;
  width?: number;
  depth?: number;
  materialThickness?: number;
  deviceThickness?: number;
  lipHeight?: number;
}

/**
 * A two-piece interlocking phone/tablet stand:
 *  - "Base" is a flat L-shape with a slot for the upright.
 *  - "Upright" is a rectangle (tilted to `angle`) with a matching slot
 *    that slides over the base. A short front lip stops the device.
 *
 * Slot widths = materialThickness, matching the box-joint convention.
 */
export const generatePhoneStand: GeneratorFn<PhoneStandParams> = (
  params,
  ctx,
) => {
  const angle = Math.max(45, Math.min(85, params.angle ?? 65));
  const W = Math.max(40, params.width ?? 90);
  const baseDepth = Math.max(60, params.depth ?? 110);
  const t = Math.max(0.1, params.materialThickness ?? ctx.materialThickness);
  const deviceT = Math.max(t, params.deviceThickness ?? 12);
  const lipH = Math.max(6, params.lipHeight ?? 15);

  // Upright: simple rectangle of the requested width × visible height,
  // sized so it stands roughly half as tall as the base depth.
  const uprightH = Math.max(80, baseDepth * 0.9);
  const uprightShape: Shape[] = [];
  const upright = createPath({
    points: rectanglePoints(W, uprightH),
    closed: true,
  });
  upright.cutType = "outside";
  uprightShape.push(upright);
  // Slot at the bottom of the upright (mates with the base's upright slot).
  const baseSlot = createRectangle({
    x: 0,
    y: uprightH / 2 - t * 1.5,
    width: t,
    height: t * 2,
  });
  baseSlot.cutType = "inside";
  uprightShape.push(baseSlot);

  // Base: a thicker rectangle with a vertical slot (tilted to `angle`)
  // that holds the upright.
  const baseH = Math.max(50, W * 0.6);
  const base: Shape[] = [];
  const baseRect = createRectangle({ x: 0, y: 0, width: baseDepth, height: baseH });
  baseRect.cutType = "outside";
  base.push(baseRect);
  // Slot near the front for the upright (perpendicular to the base, but
  // we model the rotation in the slot's `rotation` so the AI's angle
  // value still has visible meaning).
  const slot = createRectangle({
    x: -baseDepth / 2 + Math.max(t * 3, baseDepth * 0.35),
    y: 0,
    width: t,
    height: Math.max(deviceT * 1.6, baseH * 0.6),
  });
  slot.rotation = 90 - angle;
  slot.cutType = "inside";
  base.push(slot);

  // Front lip — a small rectangle that stops the device sliding off.
  const lip = createRectangle({
    x: -baseDepth / 2 + Math.max(t * 1.5, deviceT * 1.2),
    y: 0,
    width: t,
    height: lipH,
  });
  lip.cutType = "outside";
  base.push(lip);

  const placed = rowLayout([base, uprightShape], 15);

  // De-dupe ids in case any reused.
  const seen = new Set<string>();
  const final = placed.map((s) => {
    if (seen.has(s.id)) {
      const next = { ...s, id: generateId() };
      seen.add(next.id);
      return next;
    }
    seen.add(s.id);
    return s;
  });
  return { shapesToAdd: final };
};

function rectanglePoints(W: number, H: number): PathPoint[] {
  return [
    { x: -W / 2, y: -H / 2 },
    { x: W / 2, y: -H / 2 },
    { x: W / 2, y: H / 2 },
    { x: -W / 2, y: H / 2 },
  ];
}
