// ---------------------------------------------------------------------------
// Lamp Designer - Core Types
// ---------------------------------------------------------------------------

// -- Step navigation --------------------------------------------------------

export type StepId =
  | "context"
  | "form"
  | "shape"
  | "light"
  | "pattern"
  | "check"
  | "reveal"
  | "export";

export const STEP_IDS: StepId[] = [
  "context",
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

// -- Templates (Step 1) ----------------------------------------------------

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
