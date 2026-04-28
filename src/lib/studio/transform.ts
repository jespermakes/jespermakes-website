import {
  docToLocal,
  handleSign,
  localToDoc,
  type LineEndpointHandle,
  type ResizeHandle,
} from "./geometry";
import { transformPathD, type Matrix2D } from "./path-ops";
import type { PathPoint, Shape } from "./types";

const MIN_DIM = 0.0001;

export function resizeRectLikeShape(
  orig: Shape,
  handle: ResizeHandle,
  cursorDocX: number,
  cursorDocY: number,
  preserveAspect: boolean,
): Shape {
  const { sx, sy } = handleSign(handle);
  const halfW = orig.width / 2;
  const halfH = orig.height / 2;

  // Anchor in local frame is the opposite corner; for an edge handle the
  // anchor is the opposite edge midpoint and the perpendicular axis is
  // unchanged.
  const anchorLocal = {
    x: sx === 0 ? 0 : -sx * halfW,
    y: sy === 0 ? 0 : -sy * halfH,
  };

  const cursorLocal = docToLocal(orig, cursorDocX, cursorDocY);

  // The dragged endpoint in local; perpendicular axis stays at original.
  const draggedLocal = {
    x: sx === 0 ? halfW : cursorLocal.x,
    y: sy === 0 ? halfH : cursorLocal.y,
  };
  // For midpoint handles the "perpendicular" extent stays at +halfW or +halfH
  // (the un-anchored side), so the box width along that axis is halfW*2.
  if (sx === 0) {
    draggedLocal.x = halfW; // anchorLocal.x is 0; dragged spans halfW each side
  }
  if (sy === 0) {
    draggedLocal.y = halfH;
  }

  let newWidth: number;
  let newHeight: number;

  if (sx === 0) {
    newWidth = orig.width;
  } else {
    newWidth = Math.abs(cursorLocal.x - anchorLocal.x);
  }
  if (sy === 0) {
    newHeight = orig.height;
  } else {
    newHeight = Math.abs(cursorLocal.y - anchorLocal.y);
  }

  if (preserveAspect && orig.width > 0 && orig.height > 0) {
    const ratio = orig.width / orig.height;
    if (sx !== 0 && sy !== 0) {
      // Corner: keep ratio by using the larger relative drag.
      if (newWidth / newHeight > ratio) {
        newHeight = newWidth / ratio;
      } else {
        newWidth = newHeight * ratio;
      }
    } else if (sx !== 0) {
      newHeight = newWidth / ratio;
    } else if (sy !== 0) {
      newWidth = newHeight * ratio;
    }
  }

  newWidth = Math.max(MIN_DIM, newWidth);
  newHeight = Math.max(MIN_DIM, newHeight);

  // New center in local frame: midpoint between anchorLocal and the
  // dragged-corner (taking direction from sx/sy).
  const newCenterLocalX =
    sx === 0 ? 0 : anchorLocal.x + (sx * newWidth) / 2;
  const newCenterLocalY =
    sy === 0 ? 0 : anchorLocal.y + (sy * newHeight) / 2;

  const newCenterDoc = localToDoc(orig, newCenterLocalX, newCenterLocalY);
  return {
    ...orig,
    x: newCenterDoc.x,
    y: newCenterDoc.y,
    width: newWidth,
    height: newHeight,
  };
}

export function resizeLineEndpoint(
  orig: Shape,
  handle: LineEndpointHandle,
  cursorDocX: number,
  cursorDocY: number,
): Shape {
  // Line endpoints are stored relative to the shape center.
  const ax = orig.x + (orig.x1 ?? 0);
  const ay = orig.y + (orig.y1 ?? 0);
  const bx = orig.x + (orig.x2 ?? 0);
  const by = orig.y + (orig.y2 ?? 0);
  const e1 = handle === "endpoint-1" ? { x: cursorDocX, y: cursorDocY } : { x: ax, y: ay };
  const e2 = handle === "endpoint-2" ? { x: cursorDocX, y: cursorDocY } : { x: bx, y: by };
  const cx = (e1.x + e2.x) / 2;
  const cy = (e1.y + e2.y) / 2;
  return {
    ...orig,
    x: cx,
    y: cy,
    width: Math.abs(e2.x - e1.x),
    height: Math.abs(e2.y - e1.y),
    x1: e1.x - cx,
    y1: e1.y - cy,
    x2: e2.x - cx,
    y2: e2.y - cy,
  };
}

/** Translate a shape; for paths this also moves points/pathData. */
export function translateShape(
  s: Shape,
  newX: number,
  newY: number,
): Shape {
  const dx = newX - s.x;
  const dy = newY - s.y;
  if (dx === 0 && dy === 0) return { ...s, x: newX, y: newY };
  const next: Shape = { ...s, x: newX, y: newY };
  if (s.type === "path") {
    if (s.points && s.points.length > 0) {
      next.points = s.points.map((p) => ({
        x: p.x + dx,
        y: p.y + dy,
        handleIn: p.handleIn
          ? { x: p.handleIn.x + dx, y: p.handleIn.y + dy }
          : undefined,
        handleOut: p.handleOut
          ? { x: p.handleOut.x + dx, y: p.handleOut.y + dy }
          : undefined,
      }));
    }
    if (s.pathData) {
      next.pathData = transformPathD(s.pathData, [1, 0, 0, 1, dx, dy]);
    }
  }
  return next;
}

function pathBoundsMatrix(orig: Shape, next: Shape): Matrix2D {
  const sx = orig.width === 0 ? 1 : next.width / orig.width;
  const sy = orig.height === 0 ? 1 : next.height / orig.height;
  const angle = (orig.rotation * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // M = T(next) · R(angle) · S(sx,sy) · R(-angle) · T(-orig)
  // Build via matrix multiplication.
  const t1: Matrix2D = [1, 0, 0, 1, -orig.x, -orig.y];
  const r1: Matrix2D = [cos, -sin, sin, cos, 0, 0];
  const s: Matrix2D = [sx, 0, 0, sy, 0, 0];
  const r2: Matrix2D = [cos, sin, -sin, cos, 0, 0];
  const t2: Matrix2D = [1, 0, 0, 1, next.x, next.y];
  return mul(t2, mul(r2, mul(s, mul(r1, t1))));
}

function mul(a: Matrix2D, b: Matrix2D): Matrix2D {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

/** Rescale compound-path d data when its bounding box resizes. */
export function rescalePathDataToBounds(
  orig: Shape,
  next: Shape,
  pathData: string,
): string {
  const m = pathBoundsMatrix(orig, next);
  return transformPathD(pathData, m);
}

/**
 * Re-position a path's points so the path scales with its bounding-box
 * resize. Operates in the shape's local frame so rotation is preserved.
 */
export function rescalePathToBounds(
  orig: Shape,
  next: Shape,
  points: PathPoint[],
): PathPoint[] {
  const sx = orig.width === 0 ? 1 : next.width / orig.width;
  const sy = orig.height === 0 ? 1 : next.height / orig.height;
  const angle = (orig.rotation * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const transform = (px: number, py: number) => {
    const dx = px - orig.x;
    const dy = py - orig.y;
    // Rotate into local frame.
    const lx = dx * cos + dy * sin;
    const ly = -dx * sin + dy * cos;
    // Scale.
    const lxs = lx * sx;
    const lys = ly * sy;
    // Rotate back and translate to the new center.
    return {
      x: next.x + lxs * cos - lys * sin,
      y: next.y + lxs * sin + lys * cos,
    };
  };

  return points.map((p) => ({
    ...transform(p.x, p.y),
    handleIn: p.handleIn ? transform(p.handleIn.x, p.handleIn.y) : undefined,
    handleOut: p.handleOut ? transform(p.handleOut.x, p.handleOut.y) : undefined,
  }));
}

export function rotateShape(
  orig: Shape,
  cursorDocX: number,
  cursorDocY: number,
  initialPointerAngleDeg: number,
  snap15: boolean,
): Shape {
  const dx = cursorDocX - orig.x;
  const dy = cursorDocY - orig.y;
  const currentAngleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  let next = orig.rotation + (currentAngleDeg - initialPointerAngleDeg);
  if (snap15) {
    next = Math.round(next / 15) * 15;
  }
  // Normalize to [-180, 180].
  next = ((((next + 180) % 360) + 360) % 360) - 180;
  return { ...orig, rotation: next };
}
