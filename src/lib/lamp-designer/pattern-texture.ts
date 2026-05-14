import type { PatternId } from "./types";

const TEXTURE_SIZE = 512;

type PatternDrawFn = (
  ctx: CanvasRenderingContext2D,
  size: number
) => void;

/**
 * Draw vertical line perforations.
 * White = opaque wall, black = transparent opening.
 */
function drawVerticalLines(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const lineWidth = size * 0.03;
  const spacing = size * 0.08;
  ctx.fillStyle = "#000000";

  for (let x = spacing; x < size; x += spacing) {
    ctx.fillRect(x - lineWidth / 2, 0, lineWidth, size);
  }
}

/**
 * Draw horizontal ring perforations.
 */
function drawHorizontalRings(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const lineHeight = size * 0.02;
  const spacing = size * 0.06;
  ctx.fillStyle = "#000000";

  for (let y = spacing; y < size; y += spacing) {
    ctx.fillRect(0, y - lineHeight / 2, size, lineHeight);
  }
}

/**
 * Draw diamond grid perforations.
 */
function drawDiamondGrid(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const spacing = size * 0.08;
  const lineWidth = size * 0.015;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = lineWidth;

  // Diagonal lines in both directions
  for (let offset = -size; offset < size * 2; offset += spacing) {
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset + size, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(offset + size, 0);
    ctx.lineTo(offset, size);
    ctx.stroke();
  }
}

/**
 * Draw hexagonal perforations.
 */
function drawHexagonal(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const radius = size * 0.03;
  const spacingX = radius * 3.5;
  const spacingY = radius * 3;
  ctx.fillStyle = "#000000";

  for (let row = 0; row < size / spacingY + 1; row++) {
    const offsetX = row % 2 === 0 ? 0 : spacingX / 2;
    for (let col = -1; col < size / spacingX + 1; col++) {
      const cx = col * spacingX + offsetX;
      const cy = row * spacingY;
      drawHexagon(ctx, cx, cy, radius);
    }
  }
}

function drawHexagon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw organic relief pattern using pseudo-random circles.
 * Uses a seeded approach for deterministic output.
 */
function drawOrganic(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Vary opacity for relief effect — darker areas = more translucent
  const count = 80;
  for (let i = 0; i < count; i++) {
    // Simple deterministic pseudo-random based on index
    const seed1 = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    const seed2 = Math.sin(i * 269.5 + 183.3) * 43758.5453;
    const seed3 = Math.sin(i * 419.2 + 371.9) * 43758.5453;

    const x = (seed1 - Math.floor(seed1)) * size;
    const y = (seed2 - Math.floor(seed2)) * size;
    const r = ((seed3 - Math.floor(seed3)) * 0.03 + 0.01) * size;

    ctx.fillStyle = `rgba(0, 0, 0, ${0.3 + (seed1 - Math.floor(seed1)) * 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

const PATTERN_DRAW_FNS: Record<string, PatternDrawFn> = {
  "vertical-lines": drawVerticalLines,
  "horizontal-rings": drawHorizontalRings,
  "diamond-grid": drawDiamondGrid,
  "hexagonal": drawHexagonal,
  "organic": drawOrganic,
};

/**
 * Get the draw function for a pattern, or null if none (e.g. "smooth").
 */
export function getPatternDrawFn(
  patternId: PatternId
): PatternDrawFn | null {
  if (patternId === "smooth") return null;
  return PATTERN_DRAW_FNS[patternId] ?? null;
}

/**
 * Generate an alpha-map canvas for a given pattern.
 * White pixels = fully opaque material, black pixels = fully transparent.
 * Returns null for "smooth" (no texture needed).
 */
export function generatePatternCanvas(
  patternId: PatternId,
  size: number = TEXTURE_SIZE
): HTMLCanvasElement | null {
  if (patternId === "smooth") return null;

  const drawFn = PATTERN_DRAW_FNS[patternId];
  if (!drawFn) return null;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  drawFn(ctx, size);
  return canvas;
}
