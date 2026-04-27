import type { Shape } from "./types";
import { shapeBounds, shapesBounds } from "./geometry";

export interface GuideLine {
  axis: "horizontal" | "vertical";
  /** Document-mm position along the perpendicular axis. */
  position: number;
}

interface AxisCandidate {
  position: number;
  /** Source label for debugging; not rendered. */
  source: "min" | "center" | "max";
}

function candidatesForBox(
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
): {
  x: AxisCandidate[];
  y: AxisCandidate[];
} {
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return {
    x: [
      { position: bounds.minX, source: "min" },
      { position: cx, source: "center" },
      { position: bounds.maxX, source: "max" },
    ],
    y: [
      { position: bounds.minY, source: "min" },
      { position: cy, source: "center" },
      { position: bounds.maxY, source: "max" },
    ],
  };
}

interface SnapResult {
  delta: number;
  guidePositions: number[];
}

function findBestSnap(
  movingCandidates: AxisCandidate[],
  staticCandidates: AxisCandidate[],
  threshold: number,
): SnapResult | null {
  let bestDelta: number | null = null;
  let bestAbs = Infinity;
  for (const m of movingCandidates) {
    for (const s of staticCandidates) {
      const d = s.position - m.position;
      const ad = Math.abs(d);
      if (ad <= threshold && ad < bestAbs) {
        bestAbs = ad;
        bestDelta = d;
      }
    }
  }
  if (bestDelta === null) return null;
  // Collect every guide position (static side) that ends up aligned after the
  // best delta is applied — these are the lines we want to render.
  const guidePositions: number[] = [];
  for (const m of movingCandidates) {
    const after = m.position + bestDelta;
    for (const s of staticCandidates) {
      if (Math.abs(s.position - after) < 1e-3) guidePositions.push(s.position);
    }
  }
  return { delta: bestDelta, guidePositions: dedupe(guidePositions) };
}

function dedupe(xs: number[]): number[] {
  const seen = new Set<string>();
  const out: number[] = [];
  for (const x of xs) {
    const key = x.toFixed(4);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(x);
    }
  }
  return out;
}

export interface MoveSnapInput {
  movingShapes: Shape[];
  /** Provisional translation of the moving shapes in document mm. */
  rawDx: number;
  rawDy: number;
  /** Shapes the moving group can align to (excludes the moving shapes). */
  staticShapes: Shape[];
  /** Snap threshold in document mm. */
  threshold: number;
  /** Grid spacing in mm. Used as fallback when no smart guide matches. */
  gridSpacing: number;
  snapToGrid: boolean;
}

export interface MoveSnapResult {
  dx: number;
  dy: number;
  guides: GuideLine[];
}

/**
 * Find smart-guide snaps for a translation. Guides take priority over grid
 * snap; if no guide is within threshold on an axis, grid snap applies as a
 * fallback (when enabled).
 */
export function applyMoveSnap(input: MoveSnapInput): MoveSnapResult {
  const { movingShapes, rawDx, rawDy, staticShapes, threshold } = input;
  if (movingShapes.length === 0) {
    return { dx: rawDx, dy: rawDy, guides: [] };
  }

  const movingBoundsRaw = shapesBounds(movingShapes);
  if (!movingBoundsRaw) {
    return { dx: rawDx, dy: rawDy, guides: [] };
  }
  const movedBounds = {
    minX: movingBoundsRaw.minX + rawDx,
    minY: movingBoundsRaw.minY + rawDy,
    maxX: movingBoundsRaw.maxX + rawDx,
    maxY: movingBoundsRaw.maxY + rawDy,
  };

  const staticAllBounds = staticShapes.map(shapeBounds);

  // Build candidate sets.
  const moving = candidatesForBox(movedBounds);
  const staticX: AxisCandidate[] = [];
  const staticY: AxisCandidate[] = [];
  for (const b of staticAllBounds) {
    const c = candidatesForBox(b);
    staticX.push(...c.x);
    staticY.push(...c.y);
  }

  const guides: GuideLine[] = [];
  let dx = rawDx;
  let dy = rawDy;

  const xSnap = findBestSnap(moving.x, staticX, threshold);
  if (xSnap) {
    dx = rawDx + xSnap.delta;
    for (const p of xSnap.guidePositions) {
      guides.push({ axis: "vertical", position: p });
    }
  } else if (input.snapToGrid && input.gridSpacing > 0) {
    dx = Math.round(rawDx / input.gridSpacing) * input.gridSpacing;
  }

  const ySnap = findBestSnap(moving.y, staticY, threshold);
  if (ySnap) {
    dy = rawDy + ySnap.delta;
    for (const p of ySnap.guidePositions) {
      guides.push({ axis: "horizontal", position: p });
    }
  } else if (input.snapToGrid && input.gridSpacing > 0) {
    dy = Math.round(rawDy / input.gridSpacing) * input.gridSpacing;
  }

  return { dx, dy, guides };
}

export function snapThresholdMm(zoom: number): number {
  return Math.max(2, 6 / Math.max(0.0001, zoom));
}
