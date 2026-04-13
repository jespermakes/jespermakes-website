import { ORIG_TAB_WIDTH_SVG } from "./constants";
import {
  parsePath,
  segmentsToPath,
  stripZeroLengthL,
  type Segment,
} from "./path-utils";

function findTabIndex(segments: Segment[]): number {
  for (let i = 1; i < segments.length; i++) {
    const s = segments[i];
    if (s.cmd !== "L") continue;
    const prev = segments[i - 1];
    const prevEnd = prev.pts[prev.pts.length - 1];
    const cur = s.pts[0];
    const dy = Math.abs(cur.y - prevEnd.y);
    const dx = Math.abs(cur.x - prevEnd.x);
    if (dy < 0.5 && Math.abs(dx - ORIG_TAB_WIDTH_SVG) < 0.5) return i;
  }
  return -1;
}

function adjustTabPattern2(segments: Segment[], newWidth: number): Segment[] {
  const start = segments[0].pts[0];
  const afterH = segments[1].pts[0];
  const afterV = segments[2].pts[0];

  let closingIdx = -1;
  for (let i = segments.length - 1; i >= 3; i--) {
    if (
      segments[i].cmd === "L" &&
      Math.abs(segments[i].pts[0].y - start.y) < 0.5
    ) {
      closingIdx = i;
      break;
    }
  }
  if (closingIdx < 0) return segments;
  const bodyLastSeg = segments[closingIdx - 1];
  const bodyEnd = bodyLastSeg.pts[bodyLastSeg.pts.length - 1];

  const tabBottomY = start.y;
  const tabTopY = afterV.y;
  const tabCenterX = (start.x + afterH.x) / 2;
  const horizDir = Math.sign(afterH.x - start.x);
  const newOuter_x = tabCenterX - horizDir * (newWidth / 2);
  const newInner_x = tabCenterX + horizDir * (newWidth / 2);

  const newSegments: Segment[] = [
    { cmd: "M", pts: [{ x: newOuter_x, y: tabBottomY }] },
    { cmd: "L", pts: [{ x: newInner_x, y: tabBottomY }] },
    { cmd: "L", pts: [{ x: newInner_x, y: tabTopY }] },
  ];
  if (Math.abs(newInner_x - afterV.x) > 0.01) {
    newSegments.push({ cmd: "L", pts: [{ x: afterV.x, y: tabTopY }] });
  }
  for (let i = 3; i < closingIdx; i++) newSegments.push(segments[i]);
  if (Math.abs(bodyEnd.x - newOuter_x) > 0.01) {
    newSegments.push({ cmd: "L", pts: [{ x: newOuter_x, y: tabTopY }] });
  }
  newSegments.push({ cmd: "L", pts: [{ x: newOuter_x, y: tabBottomY }] });
  newSegments.push({ cmd: "Z", pts: [] });
  return newSegments;
}

function adjustTabPattern1(segments: Segment[], newWidth: number): Segment[] {
  const tabIdx = findTabIndex(segments);
  if (tabIdx < 2) return segments;
  const beforeSeg = segments[tabIdx - 2];
  const bodyRightEnd = beforeSeg.pts[beforeSeg.pts.length - 1];
  const tabIn = segments[tabIdx - 1];
  const tabHoriz = segments[tabIdx];
  const tabOut = segments[tabIdx + 1];
  const tabIn_end = tabIn.pts[0];
  const tabHoriz_end = tabHoriz.pts[0];
  const tabOut_end = tabOut.pts[0];
  const bodyLeftStart = tabOut_end;
  const tabTopY = bodyRightEnd.y;
  const tabBottomY = tabIn_end.y;
  const horizDir = Math.sign(tabHoriz_end.x - tabIn_end.x);
  const tabCenterX = (tabIn_end.x + tabHoriz_end.x) / 2;
  const newTabIn_x = tabCenterX - horizDir * (newWidth / 2);
  const newTabHoriz_end_x = tabCenterX + horizDir * (newWidth / 2);

  const newSegments: Segment[] = [];
  for (let i = 0; i < tabIdx - 1; i++) newSegments.push(segments[i]);
  if (Math.abs(newTabIn_x - bodyRightEnd.x) > 0.01) {
    newSegments.push({ cmd: "L", pts: [{ x: newTabIn_x, y: tabTopY }] });
  }
  newSegments.push({ cmd: "L", pts: [{ x: newTabIn_x, y: tabBottomY }] });
  newSegments.push({ cmd: "L", pts: [{ x: newTabHoriz_end_x, y: tabBottomY }] });
  newSegments.push({ cmd: "L", pts: [{ x: newTabHoriz_end_x, y: tabTopY }] });
  if (Math.abs(newTabHoriz_end_x - bodyLeftStart.x) > 0.01) {
    newSegments.push({ cmd: "L", pts: [{ x: bodyLeftStart.x, y: bodyLeftStart.y }] });
  }
  for (let i = tabIdx + 2; i < segments.length; i++) newSegments.push(segments[i]);
  return newSegments;
}

export function surgeLeaf(pathString: string, newWidth: number): string {
  // Strip the trailing `h0` artifact before surgery — without this, the
  // closingIdx search in adjustTabPattern2 lands on the zero-length segment
  // instead of the real closing vertical, causing a zig-zag on the M, L,
  // and XL leaves at every thickness other than 6.4mm. See Gotcha #14.
  const segs = stripZeroLengthL(parsePath(pathString));
  const tabIdx = findTabIndex(segs);
  if (tabIdx === -1) return pathString;
  const result =
    tabIdx === 1
      ? adjustTabPattern2(segs, newWidth)
      : adjustTabPattern1(segs, newWidth);
  return segmentsToPath(result);
}
