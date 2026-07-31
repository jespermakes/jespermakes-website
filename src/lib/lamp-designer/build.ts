// The single geometry entry point (DR-160 P3: one pipeline). The preview
// mesh and every exporter build through this function, so what renders is
// what prints, always.

import type { BufferGeometry } from "three";
import type { LampParameters } from "./types";
import { buildLampAssemblyProfile, clampShapeToFixture } from "./templates";
import { generateLampGeometry } from "./geometry";
import { resolveModulation } from "./patterns";

export type LampBuildInput = Pick<
  LampParameters,
  "templateId" | "shape" | "fixture" | "pattern"
>;

/**
 * Full lamp geometry in designer space (Y-up, mm): fixture crown + shade
 * with the pattern applied as real surface modulation.
 */
export function buildLampGeometryYUp(input: LampBuildInput): BufferGeometry {
  const shape = clampShapeToFixture(input.shape, input.fixture.moduleId);
  const profile = buildLampAssemblyProfile({
    templateId: input.templateId,
    shape,
    fixture: input.fixture,
  });
  const modulation = resolveModulation(input.pattern, shape);
  return generateLampGeometry(profile, shape, { modulation });
}
