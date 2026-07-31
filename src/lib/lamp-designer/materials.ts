// Material intelligence (DR-160 Phase C): maps the design (pattern, light
// mood, fixture, real thermal gap) to a named Bambu filament, wall
// guidance and a bulb spec, each with the reason in one plain sentence.
// The knowledge comes from docs/lamp-designer/RESEARCH-FILAMENT-LIGHT.md
// and RESEARCH-FIXTURE-STANDARDS.md; change values only with a sourced or
// measured reason.

import type {
  FixtureSpec,
  LightParameters,
  PatternParams,
  ShapeParameters,
  TemplateId,
} from "./types";
import { getFixtureModule, maxLedWatt, cappedWatt } from "./fixtures";
import { thermalClearance } from "./constraints";

export interface LampPlan {
  filamentName: string;
  filamentWhy: string;
  /** Gate for print-profile generation. */
  material: "pla" | "petg" | "any";
  /** True when the geometry forces PETG (PLA wattage would be 0). */
  petgRequired: boolean;
  wallAdvice: string;
  bulbSpec: string;
  bulbWhy: string;
  maxWattPla: number;
  maxWattPetg: number;
  /** Min radial bulb gap in mm; Infinity when the bulb hangs free. */
  gapMm: number;
}

export interface LampPlanInput {
  shape: ShapeParameters;
  light: LightParameters;
  pattern: PatternParams;
  fixture: FixtureSpec;
  templateId: TemplateId;
}

function nearestKelvin(k: number): number {
  const options = [2700, 3000, 4000];
  return options.reduce((best, o) =>
    Math.abs(o - k) < Math.abs(best - k) ? o : best
  );
}

function wallAdviceFor(wallThickness: number): string {
  if (wallThickness <= 1.2) {
    return "Very thin wall: brightest glow, but the bulb may show as a hotspot. Use a frosted bulb.";
  }
  if (wallThickness <= 2) {
    return "In the glow sweet spot (1.2-2 mm): even, warm light through the wall.";
  }
  if (wallThickness <= 2.5) {
    return "Solid and still glowing; drop toward 2 mm if you want more light through the wall.";
  }
  return "Above 2.5 mm the wall goes mostly opaque; light will exit the openings, not the surface.";
}

export function recommendLampPlan(input: LampPlanInput): LampPlan {
  const { shape, light, pattern, fixture, templateId } = input;
  const fixtureModule = getFixtureModule(fixture.moduleId);
  const warm = light.colorTemperature <= 3200;
  const kelvin = nearestKelvin(light.colorTemperature);

  const thermal = thermalClearance(shape, { fixture, templateId });
  const gapMm = thermal.value;
  const finiteGap = Number.isFinite(gapMm) ? gapMm : 99;
  const maxWattPla = cappedWatt(maxLedWatt(finiteGap, "pla"), fixture.moduleId);
  const maxWattPetg = cappedWatt(maxLedWatt(finiteGap, "petg"), fixture.moduleId);

  // The Kit 001 runs on 5 V at 3-5 W and stays cool: material is free.
  if (fixture.moduleId === "kit001-seat") {
    return {
      filamentName: warm
        ? "Bambu PLA Translucent (Clear)"
        : "Bambu PLA Basic (Jade White)",
      filamentWhy: warm
        ? "Frosted-glass diffusion for a warm glow, and the cool-running kit makes any PLA safe"
        : "White PLA diffuses evenly into a clean neutral light; the kit runs cool, so PLA is safe",
      material: "any",
      petgRequired: false,
      wallAdvice: wallAdviceFor(shape.wallThickness),
      bulbSpec: `LED Lamp Kit 001 puck, ${kelvin === 4000 ? "4000 K" : "3000 K"} setting, 3-5 W`,
      bulbWhy: "The kit's LED puck is the light source; no bulb needed",
      maxWattPla: 5,
      maxWattPetg: 5,
      gapMm,
    };
  }

  const bulbBase = fixtureModule.bulbEnvelope.bulbName;
  const petgRequired = maxWattPla === 0;

  let filamentName: string;
  let filamentWhy: string;
  let material: LampPlan["material"];

  if (petgRequired) {
    material = "petg";
    if (warm) {
      filamentName = "Bambu PETG Translucent (Clear)";
      filamentWhy = `Walls sit ${Math.round(finiteGap)} mm from the bulb, inside PLA's heat margin; PETG takes it, and clear PETG glows like glass`;
    } else {
      filamentName = "Bambu PETG Basic (White)";
      filamentWhy = `Walls sit ${Math.round(finiteGap)} mm from the bulb, inside PLA's heat margin; white PETG keeps the light clean with heat headroom`;
    }
  } else if (warm) {
    if (pattern.presetId === "smooth") {
      material = "pla";
      filamentName = "Bambu PLA Translucent (Clear)";
      filamentWhy = "Frosted-glass finish diffuses a warm bulb into an even glow and hides the bulb outline";
    } else {
      material = "pla";
      filamentName = "Bambu PLA Basic (Jade White)";
      filamentWhy = "White PLA at 2 walls glows evenly, and the pattern relief reads as soft light-and-shadow";
    }
  } else {
    material = "pla";
    filamentName = "Bambu PLA Matte (Ivory White)";
    filamentWhy = "Matte hides layer lines under neutral light for a clean architectural look";
  }

  const usableWatt = material === "petg" ? maxWattPetg : maxWattPla;
  const bulbSpec = Number.isFinite(gapMm)
    ? `${bulbBase}, frosted, ${kelvin} K, up to ${usableWatt} W`
    : `${bulbBase}, frosted, ${kelvin} K, any household LED wattage`;

  return {
    filamentName,
    filamentWhy,
    material,
    petgRequired,
    wallAdvice: wallAdviceFor(shape.wallThickness),
    bulbSpec,
    bulbWhy: Number.isFinite(gapMm)
      ? "Frosted LED spreads the light so no point source shows through the wall; the wattage cap keeps the wall below its softening range"
      : "The shade ends above the bulb, so heat never reaches the walls",
    maxWattPla,
    maxWattPetg,
    gapMm,
  };
}
