import { isClosedPath } from "./cut-types";
import type { CuttingTool, MaterialSettings, Shape } from "./types";

export type CheckLevel = "ok" | "warn" | "error";

export interface ReviewCheck {
  level: CheckLevel;
  message: string;
  /** Shape ID to highlight when the user clicks the row (optional). */
  shapeId?: string;
}

export interface ReviewSummary {
  total: number;
  assigned: number;
  unassigned: number;
  warnings: ReviewCheck[];
}

export function computeReview(
  shapes: Shape[],
  material: MaterialSettings,
  activeTool: CuttingTool | null,
): ReviewSummary {
  const warnings: ReviewCheck[] = [];
  let assigned = 0;
  let unassigned = 0;

  const halfW = material.width / 2;
  const halfH = material.height / 2;

  for (const s of shapes) {
    const label = labelForShape(s);
    if (s.cutType) assigned += 1;
    else unassigned += 1;

    if (!s.cutType) {
      warnings.push({
        level: "warn",
        message: `${label} has no cut type`,
        shapeId: s.id,
      });
    }

    // Open paths can only be on-line or guide.
    if (
      s.cutType &&
      !isClosedPath(s) &&
      s.cutType !== "online" &&
      s.cutType !== "guide"
    ) {
      warnings.push({
        level: "error",
        message: `${label} is open — only 'on-line' or 'guide' apply`,
        shapeId: s.id,
      });
    }

    // Outside material check.
    const minX = s.x - s.width / 2;
    const maxX = s.x + s.width / 2;
    const minY = s.y - s.height / 2;
    const maxY = s.y + s.height / 2;
    if (
      minX < -halfW - 0.01 ||
      maxX > halfW + 0.01 ||
      minY < -halfH - 0.01 ||
      maxY > halfH + 0.01
    ) {
      warnings.push({
        level: "warn",
        message: `${label} extends past the material boundary`,
        shapeId: s.id,
      });
    }

    // Undersized features for inside / pocket cuts.
    if (
      activeTool &&
      activeTool.type === "router_bit" &&
      (s.cutType === "inside" || s.cutType === "pocket") &&
      activeTool.diameter > 0
    ) {
      const minDim = Math.min(s.width, s.height);
      if (minDim > 0 && minDim < activeTool.diameter) {
        warnings.push({
          level: "warn",
          message: `${label} (${minDim.toFixed(2)} mm) is smaller than the bit diameter (${activeTool.diameter.toFixed(2)} mm)`,
          shapeId: s.id,
        });
      }
    }

    // No tabs on outside cuts (router only).
    if (
      activeTool &&
      activeTool.type === "router_bit" &&
      s.cutType === "outside" &&
      (!s.tabs || s.tabs.length === 0)
    ) {
      warnings.push({
        level: "warn",
        message: `${label} has no tabs — the part may break free during cutting`,
        shapeId: s.id,
      });
    }
  }

  return {
    total: shapes.length,
    assigned,
    unassigned,
    warnings,
  };
}

function labelForShape(s: Shape): string {
  switch (s.type) {
    case "rectangle":
      return "Rectangle";
    case "circle":
      return "Circle";
    case "line":
      return "Line";
    case "text":
      return `Text "${(s.text ?? "").slice(0, 16)}"`;
    case "path":
      return "Path";
    default:
      return "Shape";
  }
}
