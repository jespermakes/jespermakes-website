// Pattern presets for the vase-family archetype engine (DR-160 Phase B1).
// Every preset resolves to a SurfaceModulation, and resolveModulation clamps
// the depths against the actual shade so no pattern + shape combination can
// self-intersect or exceed printable overhangs. Limits come from
// docs/lamp-designer/RESEARCH-ARCHETYPES-IP.md section 5.

import type {
  PatternDefinition,
  PatternId,
  PatternParams,
  ShapeParameters,
  SurfaceModulation,
} from "./types";

const NO_MODULATION: SurfaceModulation = {
  waveCount: 0,
  waveDepth: 0,
  twistDeg: 0,
  bandCount: 0,
  bandDepth: 0,
};

export const PATTERNS: PatternDefinition[] = [
  {
    id: "smooth",
    name: "Smooth",
    description: "Clean surface, light diffuses evenly through the wall",
    modulation: NO_MODULATION,
  },
  {
    id: "fine-ribs",
    name: "Fine ribs",
    description: "Dense vertical ribs that hide layer lines and soften the glow",
    modulation: { waveCount: 36, waveDepth: 1.5, twistDeg: 0, bandCount: 0, bandDepth: 0 },
  },
  {
    id: "bold-waves",
    name: "Bold waves",
    description: "Deep flutes that throw strong light and shadow bands",
    modulation: { waveCount: 10, waveDepth: 5, twistDeg: 0, bandCount: 0, bandDepth: 0 },
  },
  {
    id: "spiral-twist",
    name: "Spiral twist",
    description: "Ribs that wind around the shade, the classic swirl lamp",
    modulation: { waveCount: 12, waveDepth: 3.5, twistDeg: 120, bandCount: 0, bandDepth: 0 },
  },
  {
    id: "wavy-bands",
    name: "Wavy bands",
    description: "Soft horizontal ripples, the organic ceramics look",
    modulation: { waveCount: 0, waveDepth: 0, twistDeg: 0, bandCount: 5, bandDepth: 6 },
  },
];

export function getPattern(id: PatternId): PatternDefinition {
  const pattern = PATTERNS.find((p) => p.id === id);
  if (!pattern) throw new Error(`Unknown pattern: ${id}`);
  return pattern;
}

export const MIN_PATTERN_INTENSITY = 0.25;
export const MAX_PATTERN_INTENSITY = 1.5;

/** Sustained printable overhang for band ripples, from research (50 deg). */
const MAX_BAND_SLOPE = Math.tan((50 * Math.PI) / 180);

/**
 * Resolve a pattern choice into a safety-clamped modulation for a given
 * shade. Clamps (correct by construction, not warnings):
 * - total radial depth <= 30 % of the smallest shade radius (no
 *   self-intersection, keeps r comfortably positive everywhere)
 * - wave depth <= PI * minRadius / (2 * waveCount) (wall slope between
 *   crests stays printable)
 * - band depth <= tan(50 deg) * height / (bandCount * PI) (band underside
 *   stays inside sustained-overhang limits)
 */
export function resolveModulation(
  pattern: PatternParams,
  shape: ShapeParameters
): SurfaceModulation {
  const preset = getPattern(pattern.presetId).modulation;
  const intensity = Math.min(
    MAX_PATTERN_INTENSITY,
    Math.max(MIN_PATTERN_INTENSITY, pattern.intensity)
  );

  const minRadius = Math.min(shape.topDiameter, shape.bottomDiameter) / 2;
  const depthBudget = 0.3 * minRadius;

  let waveDepth = preset.waveDepth * intensity;
  if (preset.waveCount > 0) {
    waveDepth = Math.min(
      waveDepth,
      (Math.PI * minRadius) / (2 * preset.waveCount)
    );
  }

  let bandDepth = preset.bandDepth * intensity;
  if (preset.bandCount > 0) {
    bandDepth = Math.min(
      bandDepth,
      (MAX_BAND_SLOPE * shape.height) / (preset.bandCount * Math.PI)
    );
  }

  const totalDepth = waveDepth + bandDepth;
  if (totalDepth > depthBudget && totalDepth > 0) {
    const scale = depthBudget / totalDepth;
    waveDepth *= scale;
    bandDepth *= scale;
  }

  return {
    waveCount: preset.waveCount,
    waveDepth,
    twistDeg: preset.twistDeg,
    bandCount: preset.bandCount,
    bandDepth,
  };
}

/** True when the modulation displaces nothing (smooth surface). */
export function isFlat(modulation: SurfaceModulation): boolean {
  return modulation.waveDepth === 0 && modulation.bandDepth === 0;
}
