import type { Shape } from "../types";

/**
 * Best-effort natural-language → Shape lookup. Used by `hole` and
 * `modify` generators to resolve descriptions like "the lid",
 * "the large rectangle", "the top panel" to a specific shape.
 *
 * Returns null when nothing matches.
 */
export function findShapeByDescription(
  description: string,
  shapes: Shape[],
): Shape | null {
  if (shapes.length === 0) return null;
  const desc = description.toLowerCase().trim();

  const byType = (type: Shape["type"]) =>
    shapes.filter((s) => s.type === type);
  const sortByArea = (arr: Shape[]) =>
    [...arr].sort((a, b) => b.width * b.height - a.width * a.height);
  const wantsLarge = /\b(large|big|biggest|largest)\b/.test(desc);
  const wantsSmall = /\b(small|little|smallest)\b/.test(desc);

  const pickSized = (arr: Shape[]) => {
    if (arr.length === 0) return null;
    if (arr.length === 1) return arr[0];
    if (wantsLarge) return sortByArea(arr)[0];
    if (wantsSmall) return sortByArea(arr).reverse()[0];
    return null;
  };

  // Type-specific descriptions
  if (/\bcircle|circles\b/.test(desc) || /\bhole\b/.test(desc)) {
    const arr = byType("circle");
    const sized = pickSized(arr);
    if (sized) return sized;
    if (arr.length > 0) return arr[arr.length - 1];
  }
  if (/\bsquare\b/.test(desc) || /\brectangle|rectangles\b/.test(desc)) {
    const arr = byType("rectangle");
    const sized = pickSized(arr);
    if (sized) return sized;
    if (arr.length > 0) return arr[arr.length - 1];
  }
  if (/\bline\b/.test(desc)) {
    const arr = byType("line");
    if (arr.length > 0) return arr[0];
  }
  if (/\btext\b/.test(desc)) {
    const arr = byType("text");
    if (arr.length > 0) return arr[0];
  }
  if (/\bpath\b/.test(desc) || /\bpanel|panels\b/.test(desc)) {
    const arr = [...byType("path"), ...byType("rectangle")];
    const sized = pickSized(arr);
    if (sized) return sized;
  }

  // Position-based descriptions, applied to the rect/path "panel" set
  // first, then to all shapes.
  const panelLike = shapes.filter(
    (s) => s.type === "rectangle" || s.type === "path",
  );
  const pool = panelLike.length > 0 ? panelLike : shapes;
  if (/\b(lid|top|topmost|upper)\b/.test(desc)) {
    return [...pool].sort((a, b) => a.y - b.y)[0] ?? null;
  }
  if (/\b(bottom|lowest|bottommost)\b/.test(desc)) {
    return [...pool].sort((a, b) => b.y - a.y)[0] ?? null;
  }
  if (/\b(left|leftmost)\b/.test(desc)) {
    return [...pool].sort((a, b) => a.x - b.x)[0] ?? null;
  }
  if (/\b(right|rightmost)\b/.test(desc)) {
    return [...pool].sort((a, b) => b.x - a.x)[0] ?? null;
  }
  if (/\b(center|middle|central|centre)\b/.test(desc)) {
    // Closest to the origin.
    return [...pool].sort(
      (a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y),
    )[0] ?? null;
  }

  // Last resort: only one shape in the pool, return it.
  if (pool.length === 1) return pool[0];

  // No good match.
  return null;
}
