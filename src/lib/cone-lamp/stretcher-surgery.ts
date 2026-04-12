import { ORIG_TAB_WIDTH_SVG } from "./constants";
import {
  parsePath,
  segmentsToPath,
  cleanAndRotate,
  type Segment,
} from "./path-utils";

// A length-18.14 L segment is a REAL slot bottom iff its before/after L
// segments are perpendicular to it and at least 5 units long.
function isRealSlot(segs: Segment[], idx: number): boolean {
  if (idx < 2 || idx >= segs.length - 1) return false;
  const cur = segs[idx];
  const before = segs[idx - 1];
  const after = segs[idx + 1];
  if (cur.cmd !== "L" || before.cmd !== "L" || after.cmd !== "L") return false;
  const beforeStart = segs[idx - 2].pts[segs[idx - 2].pts.length - 1];
  if (!beforeStart) return false;
  const beforeEnd = before.pts[0];
  const curEnd = cur.pts[0];
  const afterEnd = after.pts[0];
  const bx = curEnd.x - beforeEnd.x;
  const by = curEnd.y - beforeEnd.y;
  const blen = Math.hypot(bx, by);
  if (Math.abs(blen - ORIG_TAB_WIDTH_SVG) > 0.5) return false;
  const sx = beforeEnd.x - beforeStart.x;
  const sy = beforeEnd.y - beforeStart.y;
  const slen = Math.hypot(sx, sy);
  if (slen < 5) return false;
  const ox = afterEnd.x - curEnd.x;
  const oy = afterEnd.y - curEnd.y;
  const olen = Math.hypot(ox, oy);
  if (olen < 5) return false;
  const dotIn = (sx * bx + sy * by) / (slen * blen);
  const dotOut = (ox * bx + oy * by) / (olen * blen);
  return Math.abs(dotIn) < 0.15 && Math.abs(dotOut) < 0.15;
}

// Replace the 3 slot segments (side IN, bottom, side OUT) with 5 segments
// (bridge, side IN, bottom, side OUT, bridge). The bridges are short shifts
// along the bottom tangent so the new sides stay parallel to the originals
// with the same length — this handles symmetric slots, asymmetric slots
// (slanted body edge), and diagonal curve slots uniformly.
function modifySlot(
  segs: Segment[],
  slotBottomIdx: number,
  newWidth: number
): Segment[] | null {
  const before = segs[slotBottomIdx - 2];
  const sideIn = segs[slotBottomIdx - 1];
  const bottom = segs[slotBottomIdx];
  const sideOut = segs[slotBottomIdx + 1];
  if (!before || before.pts.length === 0) return null;
  const body_A = before.pts[before.pts.length - 1];
  const corner1 = sideIn.pts[0];
  const corner2 = bottom.pts[0];
  const body_B = sideOut.pts[0];
  const tx = corner2.x - corner1.x;
  const ty = corner2.y - corner1.y;
  const W = Math.hypot(tx, ty);
  if (Math.abs(W - ORIG_TAB_WIDTH_SVG) > 0.5) return null;
  const tangent = { x: tx / W, y: ty / W };
  const midX = (corner1.x + corner2.x) / 2;
  const midY = (corner1.y + corner2.y) / 2;
  const halfNew = newWidth / 2;
  const newCorner1 = {
    x: midX - halfNew * tangent.x,
    y: midY - halfNew * tangent.y,
  };
  const newCorner2 = {
    x: midX + halfNew * tangent.x,
    y: midY + halfNew * tangent.y,
  };
  const shift = (W - newWidth) / 2;
  const newBody_A = {
    x: body_A.x + shift * tangent.x,
    y: body_A.y + shift * tangent.y,
  };
  const newBody_B = {
    x: body_B.x - shift * tangent.x,
    y: body_B.y - shift * tangent.y,
  };
  return [
    { cmd: "L", pts: [{ x: newBody_A.x, y: newBody_A.y }] },
    { cmd: "L", pts: [{ x: newCorner1.x, y: newCorner1.y }] },
    { cmd: "L", pts: [{ x: newCorner2.x, y: newCorner2.y }] },
    { cmd: "L", pts: [{ x: newBody_B.x, y: newBody_B.y }] },
    { cmd: "L", pts: [{ x: body_B.x, y: body_B.y }] },
  ];
}

export function surgeStretcher(pathString: string, newWidth: number): string {
  const segs = cleanAndRotate(parsePath(pathString));
  const slotIndices: number[] = [];
  for (let i = 1; i < segs.length - 1; i++) {
    if (isRealSlot(segs, i)) slotIndices.push(i);
  }
  // Apply surgery in REVERSE order so earlier indices remain valid as we splice
  for (let i = slotIndices.length - 1; i >= 0; i--) {
    const idx = slotIndices[i];
    const replacement = modifySlot(segs, idx, newWidth);
    if (replacement) segs.splice(idx - 1, 3, ...replacement);
  }
  return segmentsToPath(segs);
}
