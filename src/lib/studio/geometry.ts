import type { BoundingBox, Shape } from "./types";
import { MM_PER_INCH } from "./constants";

export function snap(value: number, gridSpacing: number): number {
  return Math.round(value / gridSpacing) * gridSpacing;
}

export function snapPoint(
  x: number,
  y: number,
  gridSpacing: number,
  enabled: boolean,
): { x: number; y: number } {
  if (!enabled) return { x, y };
  return { x: snap(x, gridSpacing), y: snap(y, gridSpacing) };
}

export function shapeBounds(shape: Shape): BoundingBox {
  if (shape.type === "line") {
    const x1 = shape.x + (shape.x1 ?? 0);
    const y1 = shape.y + (shape.y1 ?? 0);
    const x2 = shape.x + (shape.x2 ?? 0);
    const y2 = shape.y + (shape.y2 ?? 0);
    return {
      minX: Math.min(x1, x2),
      minY: Math.min(y1, y2),
      maxX: Math.max(x1, x2),
      maxY: Math.max(y1, y2),
    };
  }
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  if (!shape.rotation) {
    return {
      minX: shape.x - halfW,
      minY: shape.y - halfH,
      maxX: shape.x + halfW,
      maxY: shape.y + halfH,
    };
  }
  const cos = Math.cos((shape.rotation * Math.PI) / 180);
  const sin = Math.sin((shape.rotation * Math.PI) / 180);
  const corners = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ].map((p) => ({
    x: shape.x + p.x * cos - p.y * sin,
    y: shape.y + p.x * sin + p.y * cos,
  }));
  return {
    minX: Math.min(...corners.map((c) => c.x)),
    minY: Math.min(...corners.map((c) => c.y)),
    maxX: Math.max(...corners.map((c) => c.x)),
    maxY: Math.max(...corners.map((c) => c.y)),
  };
}

export function shapesBounds(shapes: Shape[]): BoundingBox | null {
  if (shapes.length === 0) return null;
  const bs = shapes.map(shapeBounds);
  return {
    minX: Math.min(...bs.map((b) => b.minX)),
    minY: Math.min(...bs.map((b) => b.minY)),
    maxX: Math.max(...bs.map((b) => b.maxX)),
    maxY: Math.max(...bs.map((b) => b.maxY)),
  };
}

export function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return !(
    a.maxX < b.minX ||
    a.minX > b.maxX ||
    a.maxY < b.minY ||
    a.minY > b.maxY
  );
}

export function screenToDoc(
  screenX: number,
  screenY: number,
  viewportX: number,
  viewportY: number,
  zoom: number,
): { x: number; y: number } {
  return {
    x: viewportX + screenX / zoom,
    y: viewportY + screenY / zoom,
  };
}

export function rectFromCorners(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): { x: number; y: number; width: number; height: number } {
  const minX = Math.min(ax, bx);
  const maxX = Math.max(ax, bx);
  const minY = Math.min(ay, by);
  const maxY = Math.max(ay, by);
  const width = maxX - minX;
  const height = maxY - minY;
  return {
    x: minX + width / 2,
    y: minY + height / 2,
    width,
    height,
  };
}

export function mmToDisplay(valueMm: number, unit: "mm" | "in"): number {
  return unit === "in" ? valueMm / MM_PER_INCH : valueMm;
}

export function displayToMm(value: number, unit: "mm" | "in"): number {
  return unit === "in" ? value * MM_PER_INCH : value;
}

export function formatDisplay(valueMm: number, unit: "mm" | "in"): string {
  const v = mmToDisplay(valueMm, unit);
  const decimals = unit === "in" ? 3 : 2;
  return v.toFixed(decimals);
}
