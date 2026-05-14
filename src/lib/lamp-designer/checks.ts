import type {
  ShapeParameters,
  LightParameters,
  PatternId,
  ConstraintSeverity,
} from "./types";

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
// Material recommendation
// ---------------------------------------------------------------------------

export type MaterialId = "pla" | "petg" | "asa";

export interface MaterialRecommendation {
  id: MaterialId;
  name: string;
  reason: string;
  recommended: boolean;
}

export function getMaterialRecommendations(
  light: LightParameters
): MaterialRecommendation[] {
  const warm = light.colorTemperature <= 2700;
  const hot = light.colorTemperature >= 4000;

  return [
    {
      id: "pla",
      name: "PLA",
      reason: warm
        ? "Fine for low-heat warm bulbs"
        : "May soften near hot bulbs — consider PETG or ASA",
      recommended: warm,
    },
    {
      id: "petg",
      name: "PETG",
      reason: "Good heat resistance, slight translucency helps light diffuse",
      recommended: true,
    },
    {
      id: "asa",
      name: "ASA",
      reason: hot
        ? "Best choice for high-temperature bulbs"
        : "Excellent durability, but harder to print",
      recommended: hot,
    },
  ];
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

  const layerHeight =
    patternId === "smooth" || patternId === "horizontal-rings"
      ? "0.12 mm"
      : "0.20 mm";

  const infill =
    patternId === "smooth" ? "15%" : "0% (pattern creates structure)";

  return {
    layerHeight,
    infill,
    wallLoops: Math.max(2, Math.round(shape.wallThickness / 0.4)),
    supports: needsSupports,
    estimatedTime: `${hours}–${hours + 2} hours`,
  };
}

// ---------------------------------------------------------------------------
// Bulb compatibility
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

export function runAllChecks(
  shape: ShapeParameters,
  light: LightParameters,
  patternId: PatternId
): CheckSection[] {
  const dims = getDimensionSummary(shape);
  const bulb = checkBulbFit(shape);
  const print = getPrintSettings(shape, patternId);
  const materials = getMaterialRecommendations(light);

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
      title: "Bulb compatibility",
      items: [
        {
          label: "E27 bulb",
          value: bulb.message,
          ok: bulb.fits,
          severity: bulb.fits ? "info" : "error",
          hint: bulb.fits ? undefined : "Increase the top or bottom diameter",
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
      title: "Material",
      items: materials.map((m) => ({
        label: m.name,
        value: m.reason,
        ok: m.recommended,
        severity: m.recommended ? "info" as ConstraintSeverity : "warn" as ConstraintSeverity,
        hint: m.recommended ? "Recommended" : undefined,
      })),
    },
  ];
}
