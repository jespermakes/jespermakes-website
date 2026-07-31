import type {
  ShapeParameters,
  LampConstraint,
  ConstraintId,
  ConstraintResults,
  FixtureSpec,
  TemplateId,
} from "./types";
import { getFixtureModule, getMountInterface, maxLedWatt, cappedWatt } from "./fixtures";
import { buildLampAssemblyProfile } from "./templates";
import { interpolateProfile, offsetProfile } from "./geometry";

/** What fixture-aware constraints need beyond the shape sliders. */
export interface ConstraintContext {
  fixture: FixtureSpec;
  templateId: TemplateId;
}

export const DEFAULT_CONSTRAINT_CONTEXT: ConstraintContext = {
  fixture: { moduleId: "e27-clamp" },
  templateId: "cone",
};

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
 * Crown fit: the shade's top opening must reach past the mount's crown land
 * so the fixture has a flat ring to clamp. Fixture-aware (DR-160).
 */
export function bulbFit(
  shape: ShapeParameters,
  ctx: ConstraintContext = DEFAULT_CONSTRAINT_CONTEXT
): LampConstraint {
  const mount = getMountInterface(ctx.fixture.moduleId);
  const fixtureModule = getFixtureModule(ctx.fixture.moduleId);
  const minTop = Math.ceil(mount.crownMinRadius * 2);

  if (shape.topDiameter >= minTop) {
    const spare = Math.round(shape.topDiameter - minTop);
    return {
      ok: true,
      value: shape.topDiameter,
      message: `Top opening hosts the ${fixtureModule.name} (${spare} mm spare)`,
      severity: "info",
    };
  }
  return {
    ok: false,
    value: shape.topDiameter,
    message: `Top opening ${shape.topDiameter} mm too small — the ${fixtureModule.name} needs ≥ ${minTop} mm`,
    severity: "error",
  };
}

/**
 * Thermal clearance, fixture-aware: minimum radial gap between the bulb
 * envelope of the chosen fixture and the shade's inner wall, sampled along
 * the real assembly profile. The gap maps to a max LED wattage per material
 * (RESEARCH-FIXTURE-STANDARDS.md section 5.4).
 */
export function thermalClearance(
  shape: ShapeParameters,
  ctx: ConstraintContext = DEFAULT_CONSTRAINT_CONTEXT
): LampConstraint {
  const mount = getMountInterface(ctx.fixture.moduleId);
  const env = mount.bulbEnvelope;
  const bulbRadius = env.diameter / 2;

  const profile = buildLampAssemblyProfile({
    templateId: ctx.templateId,
    shape,
    fixture: ctx.fixture,
  });
  const inner = offsetProfile(interpolateProfile(profile, 64), shape.wallThickness);

  const bandTop = env.topOffset;
  const bandBottom = env.topOffset + env.length;
  const samples = inner.filter((p) => p.y >= bandTop && p.y <= bandBottom);

  if (samples.length === 0) {
    return {
      ok: true,
      value: Number.POSITIVE_INFINITY,
      message: `Shade ends above the bulb zone — the ${env.bulbName} hangs free, any LED is fine`,
      severity: "info",
    };
  }

  const minInnerRadius = Math.min(...samples.map((p) => p.x));
  const gap = minInnerRadius - bulbRadius;

  if (gap < 5) {
    return {
      ok: false,
      value: gap,
      message: `Wall enters the bulb zone (${Math.round(gap)} mm) — widen the shade or shorten it`,
      severity: "error",
    };
  }

  const wPla = cappedWatt(maxLedWatt(gap, "pla"), ctx.fixture.moduleId);
  const wPetg = cappedWatt(maxLedWatt(gap, "petg"), ctx.fixture.moduleId);

  if (wPla === 0) {
    return {
      ok: true,
      value: gap,
      message: `${Math.round(gap)} mm to the ${env.bulbName} — PETG only, up to ${wPetg} W LED`,
      severity: "warn",
    };
  }
  return {
    ok: true,
    value: gap,
    message: `${Math.round(gap)} mm to the ${env.bulbName} — PLA up to ${wPla} W, PETG up to ${wPetg} W LED`,
    severity: "info",
  };
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

const CONSTRAINT_FNS: Record<
  ConstraintId,
  (shape: ShapeParameters, ctx: ConstraintContext) => LampConstraint
> = {
  shieldingAngle,
  bulbFit,
  thermalClearance,
  proportionCheck,
  wallThickness,
  overhangAngle,
  openingRatio,
};

export function runAllConstraints(
  shape: ShapeParameters,
  ctx: ConstraintContext = DEFAULT_CONSTRAINT_CONTEXT
): ConstraintResults {
  const results = {} as ConstraintResults;
  for (const [id, fn] of Object.entries(CONSTRAINT_FNS)) {
    results[id as ConstraintId] = fn(shape, ctx);
  }
  return results;
}
