import type { PatternId, ShapeParameters } from "./types";
import { getPatternDrawFn } from "./pattern-texture";

const PROJECTION_SIZE = 512;

/** Number of pattern repeats around circumference (must match lamp-mesh) */
const REPEATS_U = 4;
/** Number of pattern repeats along the height axis */
const REPEATS_V = 2;

/**
 * Compute the inner fraction of the projection ring based on lamp shape.
 * Wider lamps push the inner boundary further out; taller lamps shrink it.
 */
export function computeInnerFraction(shape: ShapeParameters): number {
  const avgR = (shape.bottomDiameter + shape.topDiameter) / 4;
  return Math.min(0.15, (avgR / (avgR + shape.height)) * 0.5);
}

/**
 * Compute projected pixel intensity for a single point on the ground plane.
 *
 * @param normDist - normalised distance from centre (0 = centre, 1 = edge)
 * @param angle - angle in radians from atan2
 * @param wallOpacity - source pattern sample (0 = opening, 255 = wall)
 * @param innerFrac - inner radius fraction from computeInnerFraction
 * @returns intensity in [0, 1], or 0 if outside projection area
 */
export function computeProjectionIntensity(
  normDist: number,
  angle: number,
  wallOpacity: number,
  innerFrac: number
): number {
  if (normDist > 1 || normDist < innerFrac) return 0;

  const lightThrough = 1 - wallOpacity / 255;
  const falloff = 1 - normDist * normDist;
  const innerFade = Math.min(1, (normDist - innerFrac) / 0.1);

  return lightThrough * falloff * innerFade;
}

/**
 * Map a point on the ground plane to source pattern coordinates.
 *
 * @param angle - angle in radians
 * @param normDist - normalised distance (0-1)
 * @param innerFrac - inner radius fraction
 * @param size - source texture size in pixels
 * @returns [srcX, srcY] pixel coordinates in the source pattern
 */
export function mapToPatternCoords(
  angle: number,
  normDist: number,
  innerFrac: number,
  size: number
): [number, number] {
  const u = ((angle / (2 * Math.PI)) + 1) % 1;
  const projV = (normDist - innerFrac) / (1 - innerFrac);

  const srcX = Math.floor(((u * REPEATS_U) % 1) * size) % size;
  const srcY = Math.floor(((projV * REPEATS_V) % 1) * size) % size;
  return [srcX, srcY];
}

/**
 * Generate a radial shadow-projection texture for the ground plane.
 *
 * Simulates light from a central point source passing through pattern
 * perforations in a cylindrical lamp shade and projecting onto a flat
 * surface beneath. The pattern is mapped radially: the horizontal axis
 * of the pattern wraps around the circumference, and intensity falls
 * off with distance from the lamp centre.
 *
 * Returns null for "smooth" patterns (no perforations to project).
 */
export function generateShadowProjectionCanvas(
  patternId: PatternId,
  shape: ShapeParameters,
  size: number = PROJECTION_SIZE
): HTMLCanvasElement | null {
  const drawFn = getPatternDrawFn(patternId);
  if (!drawFn) return null;

  // 1. Render the pattern into a source canvas
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = size;
  srcCanvas.height = size;
  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) return null;
  drawFn(srcCtx, size);
  const srcData = srcCtx.getImageData(0, 0, size, size);

  // 2. Create the projection canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const imageData = ctx.createImageData(size, size);
  const pixels = imageData.data;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2;
  const innerFrac = computeInnerFraction(shape);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normDist = dist / maxR;
      const idx = (py * size + px) * 4;

      if (normDist > 1 || normDist < innerFrac) {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }

      const angle = Math.atan2(dy, dx);
      const [srcX, srcY] = mapToPatternCoords(angle, normDist, innerFrac, size);
      const srcIdx = (srcY * size + srcX) * 4;
      const wallOpacity = srcData.data[srcIdx];

      const intensity = computeProjectionIntensity(
        normDist,
        angle,
        wallOpacity,
        innerFrac
      );

      // Warm amber light colour matching the point light (#ffb347)
      pixels[idx] = Math.round(255 * intensity);
      pixels[idx + 1] = Math.round(179 * intensity);
      pixels[idx + 2] = Math.round(71 * intensity);
      pixels[idx + 3] = Math.round(255 * Math.min(1, intensity * 1.5));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
