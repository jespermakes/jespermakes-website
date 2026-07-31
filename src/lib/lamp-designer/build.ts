// The single geometry entry point (DR-160 P3: one pipeline). The preview
// mesh and every exporter build through this function, so what renders is
// what prints, always. Archetypes: "vase" (revolve silhouettes + surface
// patterns) and "moon" (lithophane sphere on the same revolve engine with
// a per-vertex thickness map from the NASA LDEM height field).

import type { BufferGeometry } from "three";
import type { LampParameters, ProfilePoint, ShapeParameters } from "./types";
import { buildLampAssemblyProfile, clampShapeToFixture } from "./templates";
import { getMountInterface } from "./fixtures";
import { generateLampGeometry } from "./geometry";
import { resolveModulation } from "./patterns";
import { getLoadedMoonField, sampleField } from "./moonfield";
import type { HeightField } from "./moonfield";

export type LampBuildInput = Pick<
  LampParameters,
  "archetype" | "templateId" | "shape" | "fixture" | "pattern"
>;

// Lithophane band from RESEARCH-ARCHETYPES-IP.md section 2.1: the image
// only reads between ~0.8 and ~3.0 mm in white PLA.
export const MOON_T_MIN = 0.8;
export const MOON_T_MAX = 3.0;
/** Top vent hole radius: skips the unprintable pole and vents heat. */
export const MOON_VENT_RADIUS = 8;
export const MOON_MIN_DIAMETER = 80;
export const MOON_MAX_DIAMETER = 220;

export interface MoonGeometryInfo {
  radius: number;
  alpha0: number;
  alpha1: number;
}

/** Sphere cut so the crown ring lands exactly on the mount interface. */
export function moonInfo(shape: ShapeParameters, crownMinRadius: number): MoonGeometryInfo {
  const diameter = Math.min(
    MOON_MAX_DIAMETER,
    Math.max(MOON_MIN_DIAMETER, shape.bottomDiameter)
  );
  const radius = Math.max(diameter / 2, crownMinRadius + 10);
  const alpha0 = Math.asin(Math.min(0.9, crownMinRadius / radius));
  const alpha1 = Math.PI - Math.asin(Math.min(0.9, MOON_VENT_RADIUS / radius));
  return { radius, alpha0, alpha1 };
}

function moonArcProfile(info: MoonGeometryInfo): ProfilePoint[] {
  const { radius, alpha0, alpha1 } = info;
  const points: ProfilePoint[] = [];
  const N = 48;
  for (let i = 0; i <= N; i++) {
    const a = alpha0 + ((alpha1 - alpha0) * i) / N;
    points.push({
      x: radius * Math.sin(a),
      y: radius * (Math.cos(alpha0) - Math.cos(a)),
    });
  }
  return points;
}

/**
 * The archetype-aware assembly profile (crown first, always). Constraints
 * sample this too, so fit and heat math always match the real geometry.
 */
export function buildProfileForParameters(
  input: Pick<LampBuildInput, "archetype" | "templateId" | "shape" | "fixture">
): ProfilePoint[] {
  if (input.archetype === "moon") {
    const mount = getMountInterface(input.fixture.moduleId);
    const info = moonInfo(input.shape, mount.crownMinRadius);
    return [
      { x: mount.apertureDiameter / 2, y: 0 },
      ...moonArcProfile(info),
    ];
  }
  return buildLampAssemblyProfile({
    templateId: input.templateId,
    shape: clampShapeToFixture(input.shape, input.fixture.moduleId),
    fixture: input.fixture,
  });
}

/**
 * Full lamp geometry in designer space (Y-up, mm). For the moon, the wall
 * thickness carries the lunar surface: bright terrain prints thin (more
 * light), dark maria print thick. Before the height field has loaded the
 * moon builds as a smooth sphere; the mesh rebuilds when it arrives.
 */
export function buildLampGeometryYUp(
  input: LampBuildInput,
  heightField?: HeightField | null
): BufferGeometry {
  if (input.archetype === "moon") {
    const mount = getMountInterface(input.fixture.moduleId);
    const info = moonInfo(input.shape, mount.crownMinRadius);
    const profile = buildProfileForParameters(input);
    const field = heightField === undefined ? getLoadedMoonField() : heightField;
    const midThickness = (MOON_T_MIN + MOON_T_MAX) / 2;
    const thicknessMap = (u: number, rowNorm: number): number => {
      if (!field) return midThickness;
      const a = info.alpha0 + rowNorm * (info.alpha1 - info.alpha0);
      // Equirect v runs north (0) to south (1); alpha runs from the
      // bottom (south) pole, so flip.
      const v = 1 - a / Math.PI;
      const brightness = sampleField(field, u, v);
      return MOON_T_MIN + (1 - brightness) * (MOON_T_MAX - MOON_T_MIN);
    };
    return generateLampGeometry(profile, input.shape, {
      radialSegments: 192,
      profileSegments: 96,
      thicknessMap,
    });
  }

  const shape = clampShapeToFixture(input.shape, input.fixture.moduleId);
  const profile = buildProfileForParameters(input);
  const modulation = resolveModulation(input.pattern, shape);
  return generateLampGeometry(profile, shape, { modulation });
}
