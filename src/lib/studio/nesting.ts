import { translateShape } from "./transform";
import type { MaterialSettings, Shape } from "./types";

interface ShapeBounds {
  shape: Shape;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface PartGroup {
  parent: Shape;
  children: Shape[];
  /** Bounding box of the parent + children (axis-aligned, ignoring rotation). */
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function shapeBoundsBox(s: Shape): ShapeBounds {
  return {
    shape: s,
    minX: s.x - s.width / 2,
    minY: s.y - s.height / 2,
    maxX: s.x + s.width / 2,
    maxY: s.y + s.height / 2,
  };
}

function bboxContains(outer: ShapeBounds, inner: ShapeBounds): boolean {
  return (
    inner.minX >= outer.minX - 0.001 &&
    inner.minY >= outer.minY - 0.001 &&
    inner.maxX <= outer.maxX + 0.001 &&
    inner.maxY <= outer.maxY + 0.001
  );
}

function buildGroups(shapes: Shape[]): {
  groups: PartGroup[];
  loose: Shape[];
} {
  const outside = shapes.filter((s) => s.cutType === "outside");
  const others = shapes.filter((s) => s.cutType !== "outside");
  const outsideBoxes = outside.map(shapeBoundsBox);

  const childMap = new Map<string, Shape[]>();
  const claimedIds = new Set<string>();
  const looseList: Shape[] = [];

  for (const o of outsideBoxes) {
    childMap.set(o.shape.id, []);
  }
  for (const child of others) {
    const childBox = shapeBoundsBox(child);
    let parent: ShapeBounds | null = null;
    for (const o of outsideBoxes) {
      if (bboxContains(o, childBox)) {
        parent = o;
        break;
      }
    }
    if (parent) {
      childMap.get(parent.shape.id)?.push(child);
      claimedIds.add(child.id);
    } else {
      looseList.push(child);
    }
  }

  const groups: PartGroup[] = outsideBoxes.map((o) => {
    const children = childMap.get(o.shape.id) ?? [];
    let minX = o.minX;
    let minY = o.minY;
    let maxX = o.maxX;
    let maxY = o.maxY;
    for (const c of children) {
      const cb = shapeBoundsBox(c);
      minX = Math.min(minX, cb.minX);
      minY = Math.min(minY, cb.minY);
      maxX = Math.max(maxX, cb.maxX);
      maxY = Math.max(maxY, cb.maxY);
    }
    return { parent: o.shape, children, minX, minY, maxX, maxY };
  });

  return { groups, loose: looseList };
}

export interface NestResult {
  /** Per-shape translation: shape.id → (dx, dy). */
  translations: Map<string, { dx: number; dy: number }>;
  /** 0..1 fraction of the material area used by part bounding boxes. */
  usage: number;
  /** Number of groups that didn't fit. */
  overflow: number;
}

/**
 * Strip-packing nester: First Fit Decreasing Height. Groups are sorted by
 * height descending and packed left-to-right in horizontal rows. Spacing
 * is added between groups and at the row break.
 *
 * Doesn't rotate parts (v1) and doesn't try part-in-part nesting.
 */
export function nestParts(
  shapes: Shape[],
  material: MaterialSettings,
  spacing: number,
): NestResult {
  const { groups } = buildGroups(shapes);
  if (groups.length === 0) {
    return { translations: new Map(), usage: 0, overflow: 0 };
  }
  const sorted = [...groups].sort(
    (a, b) => b.maxY - b.minY - (a.maxY - a.minY),
  );

  const halfW = material.width / 2;
  const halfH = material.height / 2;
  const startX = -halfW + spacing;
  const startY = -halfH + spacing;
  const rowMaxX = halfW - spacing;
  const colMaxY = halfH - spacing;

  let cursorX = startX;
  let cursorY = startY;
  let rowHeight = 0;
  let usedArea = 0;
  let overflow = 0;
  const translations = new Map<string, { dx: number; dy: number }>();

  for (const g of sorted) {
    const w = g.maxX - g.minX;
    const h = g.maxY - g.minY;
    if (cursorX + w > rowMaxX && cursorX > startX) {
      // Wrap to a new row.
      cursorX = startX;
      cursorY += rowHeight + spacing;
      rowHeight = 0;
    }
    if (cursorY + h > colMaxY) {
      // Out of room — leave the part where it is and count as overflow.
      overflow += 1;
      continue;
    }
    const dx = cursorX - g.minX;
    const dy = cursorY - g.minY;
    translations.set(g.parent.id, { dx, dy });
    for (const c of g.children) translations.set(c.id, { dx, dy });
    cursorX += w + spacing;
    if (h > rowHeight) rowHeight = h;
    usedArea += w * h;
  }

  const totalArea = material.width * material.height;
  const usage = totalArea > 0 ? usedArea / totalArea : 0;
  return { translations, usage, overflow };
}

export function applyNestTranslations(
  shapes: Shape[],
  translations: Map<string, { dx: number; dy: number }>,
): Shape[] {
  if (translations.size === 0) return shapes;
  return shapes.map((s) => {
    const t = translations.get(s.id);
    if (!t) return s;
    return translateShape(s, s.x + t.dx, s.y + t.dy);
  });
}
