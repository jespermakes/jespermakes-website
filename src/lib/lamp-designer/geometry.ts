import {
  BufferGeometry,
  BufferAttribute,
  Vector2,
  Vector3,
} from "three";
import type { ProfilePoint, ShapeParameters } from "./types";

const DEFAULT_RADIAL_SEGMENTS = 64;
const DEFAULT_PROFILE_SEGMENTS = 32;

interface GeometryOptions {
  radialSegments?: number;
  profileSegments?: number;
}

/**
 * Evaluate a cubic bezier between two ProfilePoints at parameter t (0..1).
 */
function evaluateBezierSegment(
  p0: ProfilePoint,
  p1: ProfilePoint,
  t: number
): Vector2 {
  const c0 = new Vector2(p0.x, p0.y);
  const c3 = new Vector2(p1.x, p1.y);

  const c1 = p0.handleOut
    ? new Vector2(p0.x + p0.handleOut.x, p0.y + p0.handleOut.y)
    : c0.clone().lerp(c3, 1 / 3);

  const c2 = p1.handleIn
    ? new Vector2(p1.x + p1.handleIn.x, p1.y + p1.handleIn.y)
    : c0.clone().lerp(c3, 2 / 3);

  const u = 1 - t;
  return new Vector2(
    u * u * u * c0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * c3.x,
    u * u * u * c0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * c3.y
  );
}

/**
 * Interpolate the profile curve into evenly-spaced 2D points.
 * Each point is (radius, height) -- x = distance from axis, y = vertical.
 */
export function interpolateProfile(
  profile: ProfilePoint[],
  segments: number
): Vector2[] {
  if (profile.length < 2) {
    throw new Error("Profile must have at least 2 points");
  }

  const totalSegmentPairs = profile.length - 1;
  const pointsPerPair = Math.max(1, Math.floor(segments / totalSegmentPairs));
  const points: Vector2[] = [];

  for (let i = 0; i < totalSegmentPairs; i++) {
    const p0 = profile[i];
    const p1 = profile[i + 1];
    const count = i === totalSegmentPairs - 1
      ? segments - points.length
      : pointsPerPair;

    for (let j = 0; j <= count; j++) {
      if (i > 0 && j === 0) continue; // avoid duplicate at segment joins
      const t = j / count;
      points.push(evaluateBezierSegment(p0, p1, t));
    }
  }

  return points;
}

/**
 * Create a hollow BufferGeometry by revolving a profile curve around the Y axis.
 *
 * The resulting geometry has:
 * - Outer wall from the profile
 * - Inner wall offset inward by wallThickness
 * - Top and bottom rim faces connecting inner/outer walls
 */
export function generateLampGeometry(
  profile: ProfilePoint[],
  shape: ShapeParameters,
  options: GeometryOptions = {}
): BufferGeometry {
  const radialSegments = options.radialSegments ?? DEFAULT_RADIAL_SEGMENTS;
  const profileSegments = options.profileSegments ?? DEFAULT_PROFILE_SEGMENTS;

  const outerProfile = interpolateProfile(profile, profileSegments);
  const innerProfile = offsetProfile(outerProfile, shape.wallThickness);

  const outerVerts = revolveProfile(outerProfile, radialSegments);
  const innerVerts = revolveProfile(innerProfile, radialSegments);

  const profileLen = outerProfile.length;
  const ringCount = radialSegments + 1; // includes wrap-around duplicate

  // Total vertices: outer + inner walls + top rim + bottom rim
  const wallVertCount = profileLen * ringCount;
  const rimVertCount = ringCount; // per rim edge, 2 edges per rim
  const totalVerts = wallVertCount * 2 + rimVertCount * 4;

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const uvs = new Float32Array(totalVerts * 2);
  const indices: number[] = [];

  let vertOffset = 0;

  // Helper to write a vertex
  function addVertex(pos: Vector3, normal: Vector3, u = 0, v = 0): number {
    const idx = vertOffset;
    positions[idx * 3] = pos.x;
    positions[idx * 3 + 1] = pos.y;
    positions[idx * 3 + 2] = pos.z;
    normals[idx * 3] = normal.x;
    normals[idx * 3 + 1] = normal.y;
    normals[idx * 3 + 2] = normal.z;
    uvs[idx * 2] = u;
    uvs[idx * 2 + 1] = v;
    vertOffset++;
    return idx;
  }

  // Build a wall (outer or inner) and return the base vertex index
  function buildWall(
    verts: Vector3[],
    outward: boolean
  ): number {
    const base = vertOffset;
    const normalSign = outward ? 1 : -1;

    for (let p = 0; p < profileLen; p++) {
      const v_coord = p / (profileLen - 1); // 0 at top, 1 at bottom
      for (let r = 0; r < ringCount; r++) {
        const u_coord = r / radialSegments; // 0..1 around circumference
        const v = verts[p * ringCount + r];
        const nx = v.x * normalSign;
        const nz = v.z * normalSign;
        const len = Math.sqrt(nx * nx + nz * nz) || 1;
        addVertex(v, new Vector3(nx / len, 0, nz / len), u_coord, v_coord);
      }
    }

    // Generate indices for the wall quads
    for (let p = 0; p < profileLen - 1; p++) {
      for (let r = 0; r < radialSegments; r++) {
        const a = base + p * ringCount + r;
        const b = base + p * ringCount + r + 1;
        const c = base + (p + 1) * ringCount + r + 1;
        const d = base + (p + 1) * ringCount + r;

        if (outward) {
          indices.push(a, b, c, a, c, d);
        } else {
          // Reverse winding for inner wall
          indices.push(a, c, b, a, d, c);
        }
      }
    }

    return base;
  }

  // Build outer and inner walls
  buildWall(outerVerts, true);
  buildWall(innerVerts, false);

  // Build rims (top and bottom caps connecting outer and inner)
  buildRim(0, outerVerts, innerVerts, ringCount, true);
  buildRim(profileLen - 1, outerVerts, innerVerts, ringCount, false);

  function buildRim(
    profileIndex: number,
    outer: Vector3[],
    inner: Vector3[],
    ring: number,
    isTop: boolean
  ) {
    const base = vertOffset;
    // Normal direction: up for top rim, down for bottom rim
    const ny = isTop ? 1 : -1;
    const rimNormal = new Vector3(0, ny, 0);

    // Add outer edge vertices
    for (let r = 0; r < ring; r++) {
      const u_coord = r / radialSegments;
      addVertex(outer[profileIndex * ring + r], rimNormal, u_coord, isTop ? 0 : 1);
    }
    // Add inner edge vertices
    for (let r = 0; r < ring; r++) {
      const u_coord = r / radialSegments;
      addVertex(inner[profileIndex * ring + r], rimNormal, u_coord, isTop ? 0 : 1);
    }

    // Connect with quads
    for (let r = 0; r < radialSegments; r++) {
      const outerA = base + r;
      const outerB = base + r + 1;
      const innerA = base + ring + r;
      const innerB = base + ring + r + 1;

      if (isTop) {
        indices.push(outerA, innerA, innerB, outerA, innerB, outerB);
      } else {
        indices.push(outerA, innerB, innerA, outerA, outerB, innerB);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions.slice(0, vertOffset * 3), 3));
  geometry.setAttribute("normal", new BufferAttribute(normals.slice(0, vertOffset * 3), 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs.slice(0, vertOffset * 2), 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Offset a 2D profile inward by the wall thickness.
 * Each point's x (radius) is reduced by thickness, clamped to a minimum of 0.
 */
export function offsetProfile(
  profile: Vector2[],
  thickness: number
): Vector2[] {
  return profile.map((p) => new Vector2(Math.max(0, p.x - thickness), p.y));
}

/**
 * Revolve a 2D profile around the Y axis to produce 3D vertices.
 * Returns an array of Vector3 with length = profilePoints * (radialSegments + 1).
 */
export function revolveProfile(
  profile: Vector2[],
  radialSegments: number
): Vector3[] {
  const vertices: Vector3[] = [];
  const ringCount = radialSegments + 1;

  for (let p = 0; p < profile.length; p++) {
    const { x: radius, y: height } = profile[p];
    for (let r = 0; r < ringCount; r++) {
      const theta = (r / radialSegments) * Math.PI * 2;
      vertices.push(
        new Vector3(
          radius * Math.cos(theta),
          height,
          radius * Math.sin(theta)
        )
      );
    }
  }

  return vertices;
}
