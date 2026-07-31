import {
  BufferGeometry,
  BufferAttribute,
  Vector2,
  Vector3,
} from "three";
import type { ProfilePoint, ShapeParameters, SurfaceModulation } from "./types";

const DEFAULT_RADIAL_SEGMENTS = 64;
const DEFAULT_PROFILE_SEGMENTS = 32;

/** Below this the fixture crown stays perfectly circular (mm of y). */
const CROWN_FLAT_MM = 3;
/** Modulation ramps in over this wall length past the flat zone (mm). */
const CROWN_RAMP_MM = 15;
/** Radius floor so modulation can never collapse a vertex onto the axis. */
const MIN_RADIUS_MM = 0.5;

interface GeometryOptions {
  radialSegments?: number;
  profileSegments?: number;
  modulation?: SurfaceModulation;
  /**
   * Per-vertex wall thickness in mm (lithophane engine). Called with the
   * circumferential coordinate u (0..1) and the row position rowNorm
   * (0..1 across the non-crown rows). Crown rows keep the constant wall.
   */
  thicknessMap?: (u: number, rowNorm: number) => number;
}

/**
 * Per-row unit interior normals with the hard-corner rule (no miter
 * scaling): the lithophane engine offsets each vertex along these.
 */
export function profileUnitNormals(
  profile: Vector2[],
  pairSegment?: number[]
): Vector2[] {
  const n = profile.length;
  const segmentNormals: Vector2[] = [];
  for (let i = 0; i < n - 1; i++) {
    const d = new Vector2().subVectors(profile[i + 1], profile[i]);
    const len = d.length() || 1;
    segmentNormals.push(new Vector2(-d.y / len, d.x / len));
  }
  return profile.map((_, i) => {
    if (i === 0) return segmentNormals[0].clone();
    if (i === n - 1) return segmentNormals[n - 2].clone();
    const atHardCorner =
      pairSegment !== undefined && pairSegment[i - 1] !== pairSegment[i];
    if (atHardCorner) return segmentNormals[i - 1].clone();
    const avg = new Vector2().addVectors(segmentNormals[i - 1], segmentNormals[i]);
    if (avg.lengthSq() < 1e-9) return segmentNormals[i].clone();
    return avg.normalize();
  });
}

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function hasModulation(m?: SurfaceModulation): m is SurfaceModulation {
  return !!m && (m.waveDepth > 0 || m.bandDepth > 0);
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

export interface InterpolatedProfile {
  points: Vector2[];
  /** For each consecutive point pair, the source profile segment index.
   *  Length = points.length - 1. Lets the offset pass know where hard
   *  corners are (segment boundaries) vs smooth curvature (within one). */
  pairSegment: number[];
}

/**
 * Interpolate the profile curve into evenly-spaced 2D points, keeping
 * track of which source segment each pair belongs to.
 * Each point is (radius, height) -- x = distance from axis, y = vertical.
 */
export function interpolateProfileWithSegments(
  profile: ProfilePoint[],
  segments: number
): InterpolatedProfile {
  if (profile.length < 2) {
    throw new Error("Profile must have at least 2 points");
  }

  const totalSegmentPairs = profile.length - 1;
  const pointsPerPair = Math.max(1, Math.floor(segments / totalSegmentPairs));
  const points: Vector2[] = [];
  const pairSegment: number[] = [];

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
      if (points.length > 1) pairSegment.push(i);
    }
  }

  return { points, pairSegment };
}

export function interpolateProfile(
  profile: ProfilePoint[],
  segments: number
): Vector2[] {
  return interpolateProfileWithSegments(profile, segments).points;
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
  const modulation = hasModulation(options.modulation)
    ? options.modulation
    : undefined;

  const radialSegments =
    options.radialSegments ??
    (modulation
      ? Math.min(256, Math.max(DEFAULT_RADIAL_SEGMENTS, modulation.waveCount * 12))
      : DEFAULT_RADIAL_SEGMENTS);
  const profileSegments =
    options.profileSegments ??
    (modulation
      ? Math.min(
          128,
          Math.max(
            DEFAULT_PROFILE_SEGMENTS,
            modulation.bandCount * 16,
            modulation.twistDeg > 0 ? 64 : 0
          )
        )
      : DEFAULT_PROFILE_SEGMENTS);

  const interpolated = interpolateProfileWithSegments(profile, profileSegments);
  const outerProfile = interpolated.points;
  const innerProfile = offsetProfile(
    outerProfile,
    shape.wallThickness,
    interpolated.pairSegment
  );
  // Keep the open-end rim planar: on sloped walls the normal offset would
  // push the inner edge past the outer one. The start point keeps its
  // offset (that is the crown plate thickness).
  innerProfile[innerProfile.length - 1].y =
    outerProfile[outerProfile.length - 1].y;

  const ys = outerProfile.map((p) => p.y);
  const yExtent = Math.max(...ys) - Math.min(...ys) || 1;

  const outerVerts = revolveProfile(outerProfile, radialSegments, modulation, yExtent);
  let innerVerts: Vector3[];

  if (options.thicknessMap) {
    // Lithophane path: offset every outer vertex individually along the
    // row's interior normal by the mapped thickness. Crown rows (source
    // segment 0, the fixture ring) keep the constant wall so the mount
    // stays flat and true.
    const normals = profileUnitNormals(outerProfile, interpolated.pairSegment);
    const ringCountLocal = radialSegments + 1;
    const rowSegment = (p: number) =>
      p === 0 ? interpolated.pairSegment[0] : interpolated.pairSegment[p - 1];
    const firstArcRow = outerProfile.findIndex((_, p) => rowSegment(p) > 0);
    const lastRow = outerProfile.length - 1;
    const arcSpan = Math.max(1, lastRow - Math.max(0, firstArcRow));

    innerVerts = new Array<Vector3>(outerVerts.length);
    for (let p = 0; p < outerProfile.length; p++) {
      const normal2d = normals[p];
      const inCrown = firstArcRow === -1 || rowSegment(p) === 0;
      const rowNorm = inCrown ? 0 : (p - firstArcRow) / arcSpan;
      for (let r = 0; r < ringCountLocal; r++) {
        const idx = p * ringCountLocal + r;
        const outer = outerVerts[idx];
        const u = (r % radialSegments) / radialSegments;
        const t = inCrown
          ? shape.wallThickness
          : options.thicknessMap(u, rowNorm);
        const theta = Math.atan2(outer.z, outer.x);
        innerVerts[idx] = new Vector3(
          outer.x + normal2d.x * Math.cos(theta) * t,
          outer.y + normal2d.y * t,
          outer.z + normal2d.x * Math.sin(theta) * t
        );
      }
    }
    // Keep the open-end rim planar, matching the constant-wall path.
    for (let r = 0; r < ringCountLocal; r++) {
      const idx = lastRow * ringCountLocal + r;
      innerVerts[idx].y = outerVerts[idx].y;
    }
  } else {
    innerVerts = revolveProfile(innerProfile, radialSegments, modulation, yExtent);
  }

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
 * Offset a 2D profile into the material interior by the wall thickness,
 * along the local curve normal. For near-vertical shade walls this matches
 * the old radial offset; for horizontal segments (the fixture crown ring)
 * it correctly offsets in y so the crown is a plate of true thickness.
 *
 * Interior side convention: profiles run from the crown aperture outward,
 * then down the shade, so the interior normal is (-dy, dx) per segment.
 * Within a smooth curve, corner points get an averaged, miter-compensated
 * normal. At hard corners (source-segment boundaries, when pairSegment is
 * provided) the point keeps the PREVIOUS segment's normal instead: a
 * mitered offset at a sharp corner travels tangentially and folds the
 * dense inner crown back over itself, which reads as self-intersecting
 * non-manifold geometry.
 */
export function offsetProfile(
  profile: Vector2[],
  thickness: number,
  pairSegment?: number[]
): Vector2[] {
  const n = profile.length;
  if (n < 2) return profile.map((p) => p.clone());

  const segmentNormals: Vector2[] = [];
  for (let i = 0; i < n - 1; i++) {
    const d = new Vector2().subVectors(profile[i + 1], profile[i]);
    const len = d.length() || 1;
    segmentNormals.push(new Vector2(-d.y / len, d.x / len));
  }

  return profile.map((p, i) => {
    let normal: Vector2;
    const atHardCorner =
      pairSegment !== undefined &&
      i > 0 &&
      i < n - 1 &&
      pairSegment[i - 1] !== pairSegment[i];

    if (i === 0) {
      normal = segmentNormals[0].clone();
    } else if (i === n - 1) {
      normal = segmentNormals[n - 2].clone();
    } else if (atHardCorner) {
      normal = segmentNormals[i - 1].clone();
    } else {
      normal = new Vector2().addVectors(segmentNormals[i - 1], segmentNormals[i]);
      if (normal.lengthSq() < 1e-9) {
        normal = segmentNormals[i].clone();
      } else {
        normal.normalize();
        // Miter compensation keeps the wall at full thickness through the
        // corner; clamp so a sharp corner cannot spike the offset.
        const cosHalf = Math.max(0.5, normal.dot(segmentNormals[i]));
        normal.multiplyScalar(1 / cosHalf);
      }
    }
    return new Vector2(
      Math.max(0, p.x + normal.x * thickness),
      p.y + normal.y * thickness
    );
  });
}

/**
 * Revolve a 2D profile around the Y axis to produce 3D vertices, applying
 * the optional surface modulation:
 *   r(theta, y) = R(y) + fade(y) * (waveDepth * sin(N*theta + twist*yNorm)
 *                                   + bandDepth * sin(bandCount*PI*yNorm))
 * fade() is 0 through the fixture crown zone and ramps in over the first
 * stretch of wall, so mount interfaces stay perfectly circular. The same
 * modulation applied to outer and inner profiles keeps wall thickness
 * effectively constant, and a modulated revolve is always one closed
 * connected surface: patterns cannot disconnect the mesh by construction.
 *
 * Returns an array of Vector3 with length = profilePoints * (radialSegments + 1).
 */
export function revolveProfile(
  profile: Vector2[],
  radialSegments: number,
  modulation?: SurfaceModulation,
  yExtent?: number
): Vector3[] {
  const vertices: Vector3[] = [];
  const ringCount = radialSegments + 1;
  const active = hasModulation(modulation);
  const extent = yExtent ?? 1;
  const twistRad = active ? (modulation.twistDeg * Math.PI) / 180 : 0;

  for (let p = 0; p < profile.length; p++) {
    const { x: baseRadius, y: height } = profile[p];
    let fade = 0;
    let yNorm = 0;
    if (active) {
      yNorm = height / extent;
      fade = smoothstep((height - CROWN_FLAT_MM) / CROWN_RAMP_MM);
    }
    for (let r = 0; r < ringCount; r++) {
      // The wrap-around column collapses to exactly theta 0 so seam
      // vertices are bit-identical and the shell is exactly watertight.
      const theta = ((r % radialSegments) / radialSegments) * Math.PI * 2;
      let radius = baseRadius;
      if (active && fade > 0) {
        const wave =
          modulation.waveCount > 0
            ? modulation.waveDepth *
              Math.sin(modulation.waveCount * theta + twistRad * yNorm)
            : 0;
        const band =
          modulation.bandCount > 0
            ? modulation.bandDepth *
              Math.sin(modulation.bandCount * Math.PI * yNorm)
            : 0;
        radius = Math.max(MIN_RADIUS_MM, baseRadius + fade * (wave + band));
      }
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
