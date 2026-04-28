import type { CutType, Shape } from "./types";

export const CUT_TYPE_COLORS: Record<CutType, string> = {
  inside: "#0000FF",
  outside: "#FF0000",
  online: "#000000",
  pocket: "#00AA00",
  guide: "#808080",
};

export const UNASSIGNED_COLOR = "#C17F3C"; // amber

export const CUT_TYPE_LABELS: Record<CutType, string> = {
  inside: "Inside",
  outside: "Outside",
  online: "On-line",
  pocket: "Pocket",
  guide: "Guide",
};

export const CUT_TYPE_ORDER: CutType[] = [
  "inside",
  "outside",
  "online",
  "pocket",
  "guide",
];

export function getCutTypeColor(cutType: CutType | undefined): string {
  if (!cutType) return UNASSIGNED_COLOR;
  return CUT_TYPE_COLORS[cutType];
}

/**
 * Returns shapes with their stroke color and fill replaced by the cut-type
 * colour scheme. Used in Plan mode rendering. Pockets get a translucent fill
 * so the user can see the pocket area at a glance.
 */
export function shapesWithCutTypeColors(shapes: Shape[]): Shape[] {
  return shapes.map((s) => {
    const color = getCutTypeColor(s.cutType);
    let fill = s.fill;
    if (s.cutType === "pocket") {
      fill = "rgba(0, 170, 0, 0.12)";
    } else if (!s.cutType && s.fill !== "none") {
      // Keep design fills for unassigned shapes so they're still recognizable.
      fill = s.fill;
    } else if (s.cutType) {
      fill = "none";
    }
    return {
      ...s,
      stroke: color,
      fill,
    };
  });
}

export function isClosedPath(shape: Shape): boolean {
  if (shape.type === "rectangle" || shape.type === "circle") return true;
  if (shape.type === "line" || shape.type === "text") return false;
  if (shape.type === "path") return shape.closed === true;
  return false;
}
