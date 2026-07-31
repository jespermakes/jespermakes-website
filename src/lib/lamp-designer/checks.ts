import type {
  ArchetypeId,
  ShapeParameters,
  LightParameters,
  PatternId,
  PatternParams,
  FixtureSpec,
  TemplateId,
  ConstraintSeverity,
} from "./types";
import { bulbFit, thermalClearance } from "./constraints";
import { recommendLampPlan } from "./materials";

// ---------------------------------------------------------------------------
// Check result types
// ---------------------------------------------------------------------------

export interface CheckItem {
  label: string;
  value: string;
  ok: boolean;
  severity: ConstraintSeverity;
  hint?: string;
}

export interface CheckSection {
  title: string;
  items: CheckItem[];
}

// ---------------------------------------------------------------------------
// Print settings
// ---------------------------------------------------------------------------

export interface PrintSettings {
  layerHeight: string;
  infill: string;
  wallLoops: number;
  supports: boolean;
  estimatedTime: string;
}

export function getPrintSettings(
  shape: ShapeParameters,
  patternId: PatternId
): PrintSettings {
  const needsSupports =
    shape.curveTension > 0.6 ||
    Math.abs(shape.topDiameter - shape.bottomDiameter) / shape.height > 0.8;

  const volume =
    Math.PI *
    ((shape.topDiameter / 2 + shape.bottomDiameter / 2) / 2) ** 2 *
    shape.height *
    (shape.wallThickness / 10);

  const hours = Math.max(1, Math.round(volume / 15000));

  const layerHeight = patternId === "smooth" ? "0.16 mm" : "0.20 mm";

  // Any infill in a lit region projects as a shadow web when the lamp is
  // on, so shades are walls-only regardless of pattern.
  const infill = "0% (walls only — infill would shadow the light)";

  return {
    layerHeight,
    infill,
    wallLoops: Math.max(2, Math.round(shape.wallThickness / 0.4)),
    supports: needsSupports,
    estimatedTime: `${hours}–${hours + 2} hours`,
  };
}

// ---------------------------------------------------------------------------
// Legacy bulb compatibility (superseded by fixture-aware constraints; kept
// only until the last caller dies)
// ---------------------------------------------------------------------------

export interface BulbCheck {
  fits: boolean;
  minOpeningNeeded: number;
  actualOpening: number;
  clearance: number;
  message: string;
}

const BULB_E27_DIMS = {
  maxDiameter: 60,
  socketDiameter: 27,
  totalHeight: 120,
  minClearance: 20,
  fitDiameter: 70,
} as const;

export function checkBulbFit(shape: ShapeParameters): BulbCheck {
  const opening = Math.max(shape.topDiameter, shape.bottomDiameter);
  const fits = opening >= BULB_E27_DIMS.fitDiameter;
  const clearance = opening - BULB_E27_DIMS.maxDiameter;

  return {
    fits,
    minOpeningNeeded: BULB_E27_DIMS.fitDiameter,
    actualOpening: opening,
    clearance,
    message: fits
      ? `E27 bulb fits with ${clearance} mm clearance`
      : `Opening too small — need ${BULB_E27_DIMS.fitDiameter} mm, have ${opening} mm`,
  };
}

// ---------------------------------------------------------------------------
// Dimension summary
// ---------------------------------------------------------------------------

export interface DimensionSummary {
  height: string;
  topDiameter: string;
  bottomDiameter: string;
  wallThickness: string;
  maxOverhangAngle: number;
  overhangOk: boolean;
}

export function getDimensionSummary(
  shape: ShapeParameters
): DimensionSummary {
  const radiusDiff = Math.abs(shape.topDiameter - shape.bottomDiameter) / 2;
  const maxOverhangAngle = Math.round(
    (Math.atan2(radiusDiff, shape.height) * 180) / Math.PI
  );

  return {
    height: `${shape.height} mm`,
    topDiameter: `${shape.topDiameter} mm`,
    bottomDiameter: `${shape.bottomDiameter} mm`,
    wallThickness: `${shape.wallThickness} mm`,
    maxOverhangAngle,
    overhangOk: maxOverhangAngle <= 45,
  };
}

// ---------------------------------------------------------------------------
// Aggregate all checks into sections
// ---------------------------------------------------------------------------

export interface CheckInput {
  shape: ShapeParameters;
  light: LightParameters;
  pattern: PatternParams;
  fixture: FixtureSpec;
  templateId: TemplateId;
  archetype?: ArchetypeId;
}

export function runAllChecks(input: CheckInput): CheckSection[] {
  const { shape, pattern, fixture, templateId } = input;
  const archetype = input.archetype ?? "vase";
  const ctx = { fixture, templateId, archetype };
  const dims = getDimensionSummary(shape);
  const mountFit = bulbFit(shape, ctx);
  const heat = thermalClearance(shape, ctx);
  const print = getPrintSettings(shape, pattern.presetId);
  if (archetype === "moon") {
    print.layerHeight = "0.12 mm";
    print.infill = "solid walls — the thickness is the image";
    print.supports = false;
  }
  const plan = recommendLampPlan(input);

  return [
    {
      title: "Dimensions",
      items: [
        { label: "Height", value: dims.height, ok: true, severity: "info" },
        { label: "Top diameter", value: dims.topDiameter, ok: true, severity: "info" },
        { label: "Bottom diameter", value: dims.bottomDiameter, ok: true, severity: "info" },
        { label: "Wall thickness", value: dims.wallThickness, ok: true, severity: "info" },
        {
          label: "Max overhang",
          value: `${dims.maxOverhangAngle}°`,
          ok: dims.overhangOk,
          severity: dims.overhangOk ? "info" : "warn",
          hint: dims.overhangOk
            ? undefined
            : "Overhang exceeds 45° — supports will be needed",
        },
      ],
    },
    {
      title: "Fit and heat",
      items: [
        {
          label: "Mount fit",
          value: mountFit.message,
          ok: mountFit.ok,
          severity: mountFit.severity,
          hint: mountFit.ok ? undefined : "Widen the top opening",
        },
        {
          label: "Bulb heat gap",
          value: heat.message,
          ok: heat.ok,
          severity: heat.severity,
          hint: heat.ok ? undefined : "Widen or shorten the shade",
        },
      ],
    },
    {
      title: "Print settings",
      items: [
        { label: "Layer height", value: print.layerHeight, ok: true, severity: "info" },
        { label: "Infill", value: print.infill, ok: true, severity: "info" },
        { label: "Wall loops", value: `${print.wallLoops}`, ok: true, severity: "info" },
        {
          label: "Supports",
          value: print.supports ? "Required" : "Not needed",
          ok: !print.supports,
          severity: print.supports ? "warn" : "info",
        },
        { label: "Estimated time", value: print.estimatedTime, ok: true, severity: "info" },
      ],
    },
    {
      title: "Material plan",
      items: [
        {
          label: "Filament",
          value: plan.filamentName,
          ok: true,
          severity: plan.petgRequired ? ("warn" as ConstraintSeverity) : ("info" as ConstraintSeverity),
          hint: plan.filamentWhy,
        },
        {
          label: "Wall glow",
          value: `${shape.wallThickness} mm`,
          ok: true,
          severity: "info",
          hint: plan.wallAdvice,
        },
        {
          label: "Bulb",
          value: plan.bulbSpec,
          ok: true,
          severity: "info",
          hint: plan.bulbWhy,
        },
      ],
    },
  ];
}
