import type {
  ShapeParameters,
  LampConstraint,
  ConstraintId,
  ConstraintResults,
} from "./types";
import { BULB_E27 } from "./types";

// ---------------------------------------------------------------------------
// Individual constraint functions
// ---------------------------------------------------------------------------

/**
 * Shielding angle: angle from bulb center to shade lip.
 * Must be >= 25°. Warn at 25–30°, good at 30+.
 *
 * The bulb center sits roughly at the midpoint of the shade height.
 * The shielding angle is measured from horizontal to the line from
 * bulb center to the nearest shade lip (smallest opening).
 */
export function shieldingAngle(shape: ShapeParameters): LampConstraint {
  const smallerOpening = Math.min(shape.topDiameter, shape.bottomDiameter);
  const radius = smallerOpening / 2;
  const halfHeight = shape.height / 2;

  // Angle from bulb center to the lip edge, measured from horizontal
  const angleDeg = Math.atan2(halfHeight, radius) * (180 / Math.PI);

  if (angleDeg >= 30) {
    return { ok: true, value: angleDeg, message: `Shielding angle ${Math.round(angleDeg)}° — bulb well hidden`, severity: "info" };
  }
  if (angleDeg >= 25) {
    return { ok: true, value: angleDeg, message: `Shielding angle ${Math.round(angleDeg)}° — bulb barely hidden`, severity: "warn" };
  }
  return { ok: false, value: angleDeg, message: `Shielding angle ${Math.round(angleDeg)}° — bulb visible (need ≥ 25°)`, severity: "error" };
}

/**
 * Bulb fit: the larger opening must be >= 70 mm for an E27 bulb to fit through.
 */
export function bulbFit(shape: ShapeParameters): LampConstraint {
  const opening = Math.max(shape.topDiameter, shape.bottomDiameter);
  const needed = BULB_E27.fitDiameter;

  if (opening >= needed) {
    const clearance = opening - BULB_E27.maxDiameter;
    return { ok: true, value: opening, message: `E27 bulb fits with ${clearance} mm clearance`, severity: "info" };
  }
  return { ok: false, value: opening, message: `Opening ${opening} mm too small — need ≥ ${needed} mm for E27 bulb`, severity: "error" };
}

/**
 * Thermal clearance: gap from bulb to shade inner wall >= 20 mm.
 * The inner wall radius is (larger opening / 2 - wallThickness).
 * The bulb radius is BULB_E27.maxDiameter / 2.
 */
export function thermalClearance(shape: ShapeParameters): LampConstraint {
  const largerOpening = Math.max(shape.topDiameter, shape.bottomDiameter);
  const innerRadius = largerOpening / 2 - shape.wallThickness;
  const bulbRadius = BULB_E27.maxDiameter / 2;
  const gap = innerRadius - bulbRadius;

  if (gap >= BULB_E27.minClearance) {
    return { ok: true, value: gap, message: `${Math.round(gap)} mm thermal clearance — safe`, severity: "info" };
  }
  return { ok: false, value: gap, message: `Only ${Math.round(gap)} mm clearance — need ≥ ${BULB_E27.minClearance} mm`, severity: gap >= 10 ? "warn" : "error" };
}

/**
 * Proportion check: height / average diameter ratio between 0.5 and 2.5.
 */
export function proportionCheck(shape: ShapeParameters): LampConstraint {
  const avgDiameter = (shape.topDiameter + shape.bottomDiameter) / 2;
  const ratio = shape.height / avgDiameter;

  if (ratio >= 0.5 && ratio <= 2.5) {
    return { ok: true, value: ratio, message: `Proportion ratio ${ratio.toFixed(2)} — balanced`, severity: "info" };
  }
  const desc = ratio < 0.5 ? "too flat" : "too tall";
  return { ok: false, value: ratio, message: `Proportion ratio ${ratio.toFixed(2)} — ${desc} (need 0.5–2.5)`, severity: "warn" };
}

/**
 * Wall thickness: minimum 0.8 mm for structural integrity.
 */
export function wallThickness(shape: ShapeParameters): LampConstraint {
  const t = shape.wallThickness;

  if (t >= 0.8) {
    return { ok: true, value: t, message: `Wall thickness ${t} mm — printable`, severity: "info" };
  }
  return { ok: false, value: t, message: `Wall thickness ${t} mm too thin — need ≥ 0.8 mm`, severity: "error" };
}

/**
 * Overhang angle: the angle of the shade wall from vertical.
 * Must be ≤ 45° for vase-mode printability without supports.
 */
export function overhangAngle(shape: ShapeParameters): LampConstraint {
  const radiusDiff = Math.abs(shape.topDiameter - shape.bottomDiameter) / 2;
  const angleDeg = Math.atan2(radiusDiff, shape.height) * (180 / Math.PI);

  if (angleDeg <= 45) {
    return { ok: true, value: angleDeg, message: `Overhang ${Math.round(angleDeg)}° — no supports needed`, severity: "info" };
  }
  return { ok: false, value: angleDeg, message: `Overhang ${Math.round(angleDeg)}° — supports needed (max 45°)`, severity: "warn" };
}

/**
 * Opening ratio: top diameter / bottom diameter, must be between 0.2 and 1.5.
 */
export function openingRatio(shape: ShapeParameters): LampConstraint {
  const ratio = shape.topDiameter / shape.bottomDiameter;

  if (ratio >= 0.2 && ratio <= 1.5) {
    return { ok: true, value: ratio, message: `Opening ratio ${ratio.toFixed(2)} — within range`, severity: "info" };
  }
  const desc = ratio < 0.2 ? "top too narrow" : "top too wide";
  return { ok: false, value: ratio, message: `Opening ratio ${ratio.toFixed(2)} — ${desc} (need 0.2–1.5)`, severity: "warn" };
}

// ---------------------------------------------------------------------------
// Run all constraints
// ---------------------------------------------------------------------------

const CONSTRAINT_FNS: Record<ConstraintId, (shape: ShapeParameters) => LampConstraint> = {
  shieldingAngle,
  bulbFit,
  thermalClearance,
  proportionCheck,
  wallThickness,
  overhangAngle,
  openingRatio,
};

export function runAllConstraints(shape: ShapeParameters): ConstraintResults {
  const results = {} as ConstraintResults;
  for (const [id, fn] of Object.entries(CONSTRAINT_FNS)) {
    results[id as ConstraintId] = fn(shape);
  }
  return results;
}
