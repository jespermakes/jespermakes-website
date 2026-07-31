// ---------------------------------------------------------------------------
// Lamp Designer - Core Types
// ---------------------------------------------------------------------------

// -- Step navigation --------------------------------------------------------

export type StepId =
  | "context"
  | "fixture"
  | "form"
  | "shape"
  | "light"
  | "pattern"
  | "check"
  | "reveal"
  | "export";

export const STEP_IDS: StepId[] = [
  "context",
  "fixture",
  "form",
  "shape",
  "light",
  "pattern",
  "check",
  "reveal",
  "export",
];

export interface StepDefinition {
  id: StepId;
  label: string;
  icon: string;
}

// -- Context (Step 0) ------------------------------------------------------

export type LampContext =
  | "bedside"
  | "dining"
  | "reading"
  | "hallway"
  | "desk"
  | "shelf";

export interface ContextConstraints {
  eyeHeightMin: number;
  eyeHeightMax: number;
  suggestedProportionRatio: number;
  suggestedLightDirection: LightDirection;
}

// -- Fixture (Step 1) ------------------------------------------------------
// Every lamp begins at the fixture (DR-160). The module is the verified
// mounting interface for real socket hardware; the shade is generated
// around its mount interface.

export type FixtureModuleId =
  | "e27-clamp"
  | "ikea-slip"
  | "e14-clamp"
  | "stem-m10"
  | "kit001-seat";

export interface FixtureSpec {
  moduleId: FixtureModuleId;
}

export type FixtureMode = "pendant" | "table" | "accent";

/** Exclusion zone the bulb occupies inside the shade, in profile space:
 *  y measured from the crown plane (y=0) into the shade interior. */
export interface BulbEnvelope {
  /** Bulb glass max diameter in mm (A60 = 60). */
  diameter: number;
  /** Bulb glass length in mm. */
  length: number;
  /** Distance from crown plane to where the glass starts, in mm
   *  (socket and holder body sit in this gap). */
  topOffset: number;
  /** Human name for the reference bulb, e.g. "A60 LED". */
  bulbName: string;
}

/** What the shade generator needs to know about the chosen fixture. */
export interface MountInterface {
  moduleId: FixtureModuleId;
  /** Hole diameter printed in the shade crown, mm. */
  apertureDiameter: number;
  /** Flat annulus width around the hole that the hardware clamps, mm. */
  landWidth: number;
  /** apertureDiameter/2 + landWidth: the shade's top opening radius must
   *  be at least this. */
  crownMinRadius: number;
  bulbEnvelope: BulbEnvelope;
  mode: FixtureMode;
  /** Hard LED wattage cap from the hardware itself (e.g. IKEA max 22 W),
   *  null when only the material/clearance gate applies. */
  hardCapWatt: number | null;
}

// -- Templates (Step 2) ----------------------------------------------------

export type TemplateId = "cone" | "dome" | "cylinder";

export interface ProfilePoint {
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

export interface LampTemplate {
  id: TemplateId;
  name: string;
  description: string;
  defaultParameters: ShapeParameters;
  profile: ProfilePoint[];
}

// -- Shape parameters (Step 2) ---------------------------------------------

export interface ShapeParameters {
  height: number;
  topDiameter: number;
  bottomDiameter: number;
  curveTension: number;
  wallThickness: number;
}

// -- Light parameters (Step 3) ---------------------------------------------

export type LightDirection = "down" | "up" | "ambient";

export interface LightParameters {
  colorTemperature: number;
  beamAngle: number;
  direction: LightDirection;
}

// -- Pattern (Step 4) ------------------------------------------------------

export type PatternId =
  | "smooth"
  | "vertical-lines"
  | "horizontal-rings"
  | "diamond-grid"
  | "hexagonal"
  | "organic";

export type PatternType = "none" | "perforation" | "relief";

export interface PatternGeometry {
  type: PatternType;
  spacingMm: number;
  sizeMm: number;
  density: number;
  needsFineLayer: boolean;
  createsStructure: boolean;
}

export interface PatternDefinition {
  id: PatternId;
  name: string;
  description: string;
  geometry: PatternGeometry;
}

// -- Constraints (Phase 4) -------------------------------------------------

export type ConstraintSeverity = "info" | "warn" | "error";

export interface LampConstraint {
  ok: boolean;
  value: number;
  message: string;
  severity: ConstraintSeverity;
}

export type ConstraintId =
  | "shieldingAngle"
  | "bulbFit"
  | "thermalClearance"
  | "proportionCheck"
  | "wallThickness"
  | "overhangAngle"
  | "openingRatio";

export type ConstraintResults = Record<ConstraintId, LampConstraint>;

// -- Full lamp state -------------------------------------------------------

export interface LampParameters {
  context: LampContext;
  fixture: FixtureSpec;
  templateId: TemplateId;
  shape: ShapeParameters;
  light: LightParameters;
  patternId: PatternId;
}

export interface LampDesignerState {
  currentStep: StepId;
  completedSteps: StepId[];
  parameters: LampParameters;
}

// -- Saved design (database) -----------------------------------------------

export interface SavedLampDesign {
  id: string;
  userId: string | null;
  name: string;
  parameters: LampParameters;
  thumbnail: string | null;
  context: LampContext;
  templateId: TemplateId;
  createdAt: Date;
  updatedAt: Date;
}

// -- Export -----------------------------------------------------------------

export type ExportFormat = "stl" | "3mf";

// -- Bulb reference dimensions (mm) ----------------------------------------

export const BULB_E27 = {
  maxDiameter: 60,
  socketDiameter: 27,
  totalHeight: 120,
  minClearance: 20,
  fitDiameter: 70,
} as const;
