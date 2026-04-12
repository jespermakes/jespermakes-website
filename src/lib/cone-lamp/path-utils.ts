export interface Point {
  x: number;
  y: number;
}

export interface Segment {
  cmd: "M" | "L" | "C" | "Z";
  pts: Point[];
}

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

// Parse an SVG path string into a list of segments in ABSOLUTE coordinates.
// Each L/H/V becomes an L segment with a single end point. Each C becomes a
// C segment with [cp1, cp2, end]. M and Z are preserved as-is.
export function parsePath(d: string): Segment[] {
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:[eE][+-]?\d+)?/g) || [];
  const segments: Segment[] = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;
  let cmd: string | null = null;
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (/[a-zA-Z]/.test(t)) {
      cmd = t;
      i++;
      // Z has no numeric arguments — push immediately, not on the next number
      if (cmd === "Z" || cmd === "z") {
        cx = sx; cy = sy;
        segments.push({ cmd: "Z", pts: [] });
      }
      continue;
    }
    if (cmd === "M" || cmd === "m") {
      const x = parseFloat(t), y = parseFloat(tokens[i + 1]);
      if (cmd === "m") { cx += x; cy += y; } else { cx = x; cy = y; }
      sx = cx; sy = cy;
      segments.push({ cmd: "M", pts: [{ x: cx, y: cy }] });
      cmd = (cmd === "m") ? "l" : "L";
      i += 2;
    } else if (cmd === "L" || cmd === "l") {
      const x = parseFloat(t), y = parseFloat(tokens[i + 1]);
      if (cmd === "l") { cx += x; cy += y; } else { cx = x; cy = y; }
      segments.push({ cmd: "L", pts: [{ x: cx, y: cy }] });
      i += 2;
    } else if (cmd === "H" || cmd === "h") {
      const x = parseFloat(t);
      if (cmd === "h") cx += x; else cx = x;
      segments.push({ cmd: "L", pts: [{ x: cx, y: cy }] });
      i += 1;
    } else if (cmd === "V" || cmd === "v") {
      const y = parseFloat(t);
      if (cmd === "v") cy += y; else cy = y;
      segments.push({ cmd: "L", pts: [{ x: cx, y: cy }] });
      i += 1;
    } else if (cmd === "C" || cmd === "c") {
      const n = [0, 1, 2, 3, 4, 5].map((k) => parseFloat(tokens[i + k]));
      let cp1: Point, cp2: Point, end: Point;
      if (cmd === "c") {
        cp1 = { x: cx + n[0], y: cy + n[1] };
        cp2 = { x: cx + n[2], y: cy + n[3] };
        end = { x: cx + n[4], y: cy + n[5] };
      } else {
        cp1 = { x: n[0], y: n[1] };
        cp2 = { x: n[2], y: n[3] };
        end = { x: n[4], y: n[5] };
      }
      cx = end.x; cy = end.y;
      segments.push({ cmd: "C", pts: [cp1, cp2, end] });
      i += 6;
    } else {
      i += 1;
    }
  }
  return segments;
}

export function segmentsToPath(segments: Segment[]): string {
  return segments
    .map((seg) => {
      if (seg.cmd === "M") return `M${seg.pts[0].x.toFixed(2)},${seg.pts[0].y.toFixed(2)}`;
      if (seg.cmd === "L") return `L${seg.pts[0].x.toFixed(2)},${seg.pts[0].y.toFixed(2)}`;
      if (seg.cmd === "C") {
        const [a, b, c] = seg.pts;
        return `C${a.x.toFixed(2)},${a.y.toFixed(2)} ${b.x.toFixed(2)},${b.y.toFixed(2)} ${c.x.toFixed(2)},${c.y.toFixed(2)}`;
      }
      if (seg.cmd === "Z") return "Z";
      return "";
    })
    .join(" ");
}

export function getBBox(segments: Segment[]): BBox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const seg of segments) {
    for (const pt of seg.pts) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

// Clean (drop zero-length L segments) and rotate (move OLD segment [1] to
// before Z). The rotation matters because both stretcher paths have the M
// point sitting exactly at corner2 of one of the curve-leaf slots — that
// slot is split across the path closure seam. Moving OLD [1] to before Z
// puts the slot fully in the middle of the segment list with proper L-L-L
// neighbors so standard slot detection works on every slot uniformly.
export function cleanAndRotate(segments: Segment[]): Segment[] {
  // 1. Remove zero-length L segments (artifacts like h0)
  const cleaned: Segment[] = [];
  let pos: Point = segments[0].pts[0];
  cleaned.push(segments[0]);
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.cmd === "L") {
      const end = seg.pts[0];
      const len = Math.hypot(end.x - pos.x, end.y - pos.y);
      if (len < 0.5) continue;
      cleaned.push(seg);
      pos = end;
    } else if (seg.cmd === "C") {
      cleaned.push(seg);
      pos = seg.pts[seg.pts.length - 1];
    } else if (seg.cmd === "Z") {
      cleaned.push(seg);
    }
  }

  // 2. Rotate so OLD [1] (first L after M) goes to before Z
  if (
    cleaned.length < 4 ||
    cleaned[1].cmd !== "L" ||
    cleaned[cleaned.length - 1].cmd !== "Z"
  ) {
    return cleaned;
  }
  const oldFirstL = cleaned[1];
  const newMPos: Point = { x: oldFirstL.pts[0].x, y: oldFirstL.pts[0].y };
  const rotated: Segment[] = [];
  rotated.push({ cmd: "M", pts: [newMPos] });
  for (let i = 2; i < cleaned.length - 1; i++) rotated.push(cleaned[i]);
  rotated.push(oldFirstL);
  rotated.push(cleaned[cleaned.length - 1]); // Z
  return rotated;
}
