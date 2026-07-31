// Printability validation backstop (DR-160 P4). Generators are correct by
// construction; these checks are the safety net and the trust signal. If
// one ever fires in normal use, that is a generator bug, not a user error.

import type { BufferGeometry } from "three";

/** Quantize a position so duplicated seam/rim vertices unify. The +0
 *  normalizes negative zero, which toFixed would render as "-0.000". */
function quantize(v: number): number {
  return Math.round(v * 1000) / 1000 + 0;
}

function positionKey(x: number, y: number, z: number): string {
  return `${quantize(x)},${quantize(y)},${quantize(z)}`;
}

interface TopologyIndex {
  /** Per original vertex index, the unified position id. */
  unified: Int32Array;
  triangleCount: number;
  readTriangle: (t: number, out: [number, number, number]) => void;
}

function indexTopology(geometry: BufferGeometry): TopologyIndex {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const unified = new Int32Array(position.count);
  const idByKey = new Map<string, number>();

  for (let i = 0; i < position.count; i++) {
    const key = positionKey(position.getX(i), position.getY(i), position.getZ(i));
    let id = idByKey.get(key);
    if (id === undefined) {
      id = idByKey.size;
      idByKey.set(key, id);
    }
    unified[i] = id;
  }

  const triangleCount = index ? index.count / 3 : position.count / 3;
  const readTriangle = (t: number, out: [number, number, number]) => {
    const a = index ? index.getX(t * 3) : t * 3;
    const b = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const c = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    out[0] = unified[a];
    out[1] = unified[b];
    out[2] = unified[c];
  };

  return { unified, triangleCount, readTriangle };
}

/**
 * Number of connected components of the triangle mesh, with vertices
 * unified by position. A printable lamp is exactly 1; anything else means
 * floating geometry (the v1 horizontal-rings failure class).
 */
export function countConnectedComponents(geometry: BufferGeometry): number {
  const topo = indexTopology(geometry);
  const parent = new Map<number, number>();

  const find = (a: number): number => {
    let root = a;
    while (parent.get(root) !== undefined && parent.get(root) !== root) {
      root = parent.get(root)!;
    }
    if (parent.get(root) === undefined) parent.set(root, root);
    // Path compression
    let node = a;
    while (node !== root) {
      const next = parent.get(node) ?? root;
      parent.set(node, root);
      node = next;
    }
    return root;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  const tri: [number, number, number] = [0, 0, 0];
  for (let t = 0; t < topo.triangleCount; t++) {
    topo.readTriangle(t, tri);
    union(tri[0], tri[1]);
    union(tri[1], tri[2]);
  }

  const roots = new Set<number>();
  for (const key of Array.from(parent.keys())) roots.add(find(key));
  return roots.size;
}

/**
 * Count edges not shared by exactly two triangles (position-unified).
 * A watertight closed shell has zero. Degenerate triangles (two corners
 * on the same unified position, e.g. at a radius-zero pole) are skipped.
 */
export function countNonManifoldEdges(geometry: BufferGeometry): number {
  const topo = indexTopology(geometry);
  const edgeUse = new Map<string, number>();
  const tri: [number, number, number] = [0, 0, 0];

  for (let t = 0; t < topo.triangleCount; t++) {
    topo.readTriangle(t, tri);
    const [a, b, c] = tri;
    if (a === b || b === c || a === c) continue;
    for (const [u, v] of [
      [a, b],
      [b, c],
      [c, a],
    ] as const) {
      const key = u < v ? `${u}_${v}` : `${v}_${u}`;
      edgeUse.set(key, (edgeUse.get(key) ?? 0) + 1);
    }
  }

  let bad = 0;
  for (const count of Array.from(edgeUse.values())) {
    if (count !== 2) bad++;
  }
  return bad;
}

export interface ValidationResult {
  connectedComponents: number;
  nonManifoldEdges: number;
  ok: boolean;
}

export function validateLampGeometry(geometry: BufferGeometry): ValidationResult {
  const connectedComponents = countConnectedComponents(geometry);
  const nonManifoldEdges = countNonManifoldEdges(geometry);
  return {
    connectedComponents,
    nonManifoldEdges,
    ok: connectedComponents === 1 && nonManifoldEdges === 0,
  };
}
