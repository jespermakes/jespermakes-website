import type { Shape } from "../types";

/**
 * Lay out a list of shape groups (one group = one part) in a left-to-right
 * row centred on the origin, with `gap` mm between bounding boxes. Each
 * group's center is moved so its left edge sits at `cursorX`.
 *
 * Returns a NEW shape array with the translated shapes.
 */
export function rowLayout(
  groups: Shape[][],
  gap: number,
  startX = 0,
): Shape[] {
  const placed: Shape[] = [];
  let cursorX = startX;
  for (const group of groups) {
    if (group.length === 0) continue;
    const bounds = bbox(group);
    const dx = cursorX - bounds.minX;
    for (const s of group) {
      placed.push(translateShape(s, dx, -bounds.minY - (bounds.maxY - bounds.minY) / 2));
    }
    cursorX += bounds.maxX - bounds.minX + gap;
  }
  // Recenter the whole row horizontally on the origin.
  const allBounds = bbox(placed);
  const centerOffset = -((allBounds.minX + allBounds.maxX) / 2);
  return placed.map((s) => translateShape(s, centerOffset, 0));
}

function bbox(shapes: Shape[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of shapes) {
    minX = Math.min(minX, s.x - s.width / 2);
    minY = Math.min(minY, s.y - s.height / 2);
    maxX = Math.max(maxX, s.x + s.width / 2);
    maxY = Math.max(maxY, s.y + s.height / 2);
  }
  return { minX, minY, maxX, maxY };
}

function translateShape(s: Shape, dx: number, dy: number): Shape {
  return { ...s, x: s.x + dx, y: s.y + dy };
}
