import { createPath, createRectangle, generateId } from "../shape-factory";
import type { PathPoint, Shape } from "../types";
import { rowLayout } from "./layout";
import type { GeneratorFn } from "./types";

export type BoxJointType = "butt" | "finger" | "rabbet" | "miter";

export interface BoxParams {
  width: number;
  depth: number;
  height: number;
  materialThickness: number;
  jointType?: BoxJointType;
  fingerWidth?: number;
  openTop?: boolean;
  openBottom?: boolean;
  dividers?: number;
}

type EdgeStyle = "flat" | "tab" | "slot";

interface PanelEdges {
  top: EdgeStyle;
  right: EdgeStyle;
  bottom: EdgeStyle;
  left: EdgeStyle;
}

/**
 * Box-joint math (mirrors the Box Joint Jig tool):
 *   slotWidth = fingerWidth = materialThickness
 *   fingerCount = floor(edgeLength / (fingerWidth * 2))
 *   margin at each end = (edgeLength - (2N - 1) * fingerWidth) / 2
 *
 * Builds a closed path for a panel of W × H mm with the four edges
 * styled as 'flat' | 'tab' | 'slot'. Tabs deviate outward by `t`. Slots
 * are emitted as separate inside-cut rectangles (returned alongside the
 * outline) so kerf compensation in Plan mode works without re-thinking
 * the path.
 */
function buildPanelGeometry(
  W: number,
  H: number,
  t: number,
  edges: PanelEdges,
  fingerWidth: number,
): { outline: PathPoint[]; slots: { x: number; y: number; w: number; h: number }[] } {
  const halfW = W / 2;
  const halfH = H / 2;
  const tl = { x: -halfW, y: -halfH };
  const tr = { x: halfW, y: -halfH };
  const br = { x: halfW, y: halfH };
  const bl = { x: -halfW, y: halfH };
  // Walk clockwise: top → right → bottom → left.
  const outline: PathPoint[] = [{ x: tl.x, y: tl.y }];
  const slots: { x: number; y: number; w: number; h: number }[] = [];

  const walk = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    style: EdgeStyle,
  ) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const L = Math.hypot(dx, dy);
    if (L < 1e-6) {
      outline.push({ x: end.x, y: end.y });
      return;
    }
    const ux = dx / L;
    const uy = dy / L;
    // Outward (CW polygon → outward = perpendicular-left of motion)
    const ox = uy;
    const oy = -ux;

    if (style === "tab" && L >= 2 * fingerWidth) {
      const N = Math.floor(L / (2 * fingerWidth));
      const corner = (L - (2 * N - 1) * fingerWidth) / 2;
      let cx = start.x + ux * corner;
      let cy = start.y + uy * corner;
      outline.push({ x: cx, y: cy });
      for (let i = 0; i < N; i++) {
        // Out
        cx += ox * t;
        cy += oy * t;
        outline.push({ x: cx, y: cy });
        // Forward (tab top)
        cx += ux * fingerWidth;
        cy += uy * fingerWidth;
        outline.push({ x: cx, y: cy });
        // In
        cx -= ox * t;
        cy -= oy * t;
        outline.push({ x: cx, y: cy });
        if (i < N - 1) {
          // Forward (gap)
          cx += ux * fingerWidth;
          cy += uy * fingerWidth;
          outline.push({ x: cx, y: cy });
        }
      }
      // Final corner flat
      cx += ux * corner;
      cy += uy * corner;
      outline.push({ x: cx, y: cy });
    } else if (style === "slot" && L >= 2 * fingerWidth) {
      // Outline is the straight edge; slots become inside-cut rectangles.
      // Slots match the mating tab positions: the gaps between tabs.
      const N = Math.floor(L / (2 * fingerWidth));
      const corner = (L - (2 * N - 1) * fingerWidth) / 2;
      // Slot positions (same parametric layout as tabs but the slot sits
      // on top of the edge, depth=t, recessed inward).
      // Slot center = corner + (fingerWidth/2) + i*2*fingerWidth
      // Slot's perpendicular position = edge midline shifted inward by t/2
      for (let i = 0; i < N; i++) {
        const along = corner + fingerWidth / 2 + i * 2 * fingerWidth;
        const cxAlong = start.x + ux * along;
        const cyAlong = start.y + uy * along;
        // Inset slot center inward by t/2.
        const slotCenterX = cxAlong - ox * (t / 2);
        const slotCenterY = cyAlong - oy * (t / 2);
        // Slot dimensions: width along edge = fingerWidth, height
        // perpendicular = t. The slot needs to be axis-aligned in the
        // panel's frame (which is the same as our local frame), so we
        // size by (along, across) and remap.
        const w = Math.abs(ux) * fingerWidth + Math.abs(ox) * t;
        const h = Math.abs(uy) * fingerWidth + Math.abs(oy) * t;
        slots.push({ x: slotCenterX, y: slotCenterY, w, h });
      }
      outline.push({ x: end.x, y: end.y });
    } else {
      // Flat: just a straight line to the end.
      outline.push({ x: end.x, y: end.y });
    }
  };

  walk(tl, tr, edges.top);
  walk(tr, br, edges.right);
  walk(br, bl, edges.bottom);
  walk(bl, tl, edges.left);

  return { outline, slots };
}

interface PanelSpec {
  name: string;
  W: number;
  H: number;
  edges: PanelEdges;
}

function panelToShapes(spec: PanelSpec, t: number, fingerWidth: number): Shape[] {
  if (
    spec.edges.top === "flat" &&
    spec.edges.right === "flat" &&
    spec.edges.bottom === "flat" &&
    spec.edges.left === "flat"
  ) {
    const rect = createRectangle({
      x: 0,
      y: 0,
      width: spec.W,
      height: spec.H,
    });
    rect.cutType = "outside";
    return [rect];
  }
  const { outline, slots } = buildPanelGeometry(
    spec.W,
    spec.H,
    t,
    spec.edges,
    fingerWidth,
  );
  const path = createPath({ points: outline, closed: true });
  path.cutType = "outside";
  const slotShapes: Shape[] = slots.map((s) => {
    const r = createRectangle({ x: s.x, y: s.y, width: s.w, height: s.h });
    r.cutType = "inside";
    return r;
  });
  return [path, ...slotShapes];
}

export const generateBox: GeneratorFn<BoxParams> = (params, ctx) => {
  const W = Math.max(10, params.width);
  const D = Math.max(10, params.depth);
  const H = Math.max(10, params.height);
  const t = Math.max(0.1, params.materialThickness ?? ctx.materialThickness);
  const jointType = params.jointType ?? "finger";
  const fingerWidth = Math.max(0.1, params.fingerWidth ?? t);
  const openTop = params.openTop === true;
  const openBottom = params.openBottom === true;

  const finger = jointType === "finger";

  // Edge-style decisions per panel.
  const allTabs: PanelEdges = {
    top: finger ? "tab" : "flat",
    right: finger ? "tab" : "flat",
    bottom: finger ? "tab" : "flat",
    left: finger ? "tab" : "flat",
  };
  const frontBackEdges: PanelEdges = {
    top: finger ? "slot" : "flat",
    right: finger ? "tab" : "flat",
    bottom: finger ? "slot" : "flat",
    left: finger ? "tab" : "flat",
  };
  const leftRightEdges: PanelEdges = {
    top: finger ? "slot" : "flat",
    right: finger ? "slot" : "flat",
    bottom: finger ? "slot" : "flat",
    left: finger ? "slot" : "flat",
  };

  const groups: Shape[][] = [];
  // Top/Bottom: width × depth
  if (!openTop) {
    groups.push(
      panelToShapes(
        { name: "top", W, H: D, edges: allTabs },
        t,
        fingerWidth,
      ),
    );
  }
  if (!openBottom) {
    groups.push(
      panelToShapes(
        { name: "bottom", W, H: D, edges: allTabs },
        t,
        fingerWidth,
      ),
    );
  }
  // Front/Back: width × (H - 2t)
  const sideHeight = Math.max(2 * fingerWidth, H - 2 * t);
  groups.push(
    panelToShapes(
      { name: "front", W, H: sideHeight, edges: frontBackEdges },
      t,
      fingerWidth,
    ),
  );
  groups.push(
    panelToShapes(
      { name: "back", W, H: sideHeight, edges: frontBackEdges },
      t,
      fingerWidth,
    ),
  );
  // Left/Right: depth × (H - 2t)
  groups.push(
    panelToShapes(
      { name: "left", W: D, H: sideHeight, edges: leftRightEdges },
      t,
      fingerWidth,
    ),
  );
  groups.push(
    panelToShapes(
      { name: "right", W: D, H: sideHeight, edges: leftRightEdges },
      t,
      fingerWidth,
    ),
  );

  // Internal dividers — simple flat panels parallel to the front/back.
  const dividers = Math.max(0, params.dividers ?? 0);
  for (let i = 0; i < dividers; i++) {
    const innerH = sideHeight;
    const innerD = Math.max(2 * fingerWidth, D - 2 * t);
    const r = createRectangle({ x: 0, y: 0, width: innerD, height: innerH });
    r.cutType = "outside";
    groups.push([r]);
  }

  // Lay out as a row with 15mm spacing.
  const placed = rowLayout(groups, 15);

  // Assign fresh ids — the reused createPath/createRectangle pattern
  // already generates unique ids, but rowLayout-translated copies share
  // ids if the same source was reused.
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
