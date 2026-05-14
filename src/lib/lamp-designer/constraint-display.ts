import type {
  ShapeParameters,
  ConstraintId,
  ConstraintSeverity,
  LampConstraint,
} from "./types";

/** Which constraints are affected by each shape parameter */
export const SLIDER_CONSTRAINTS: Record<keyof ShapeParameters, ConstraintId[]> = {
  height: ["shieldingAngle", "proportionCheck", "overhangAngle"],
  topDiameter: ["shieldingAngle", "bulbFit", "thermalClearance", "proportionCheck", "overhangAngle", "openingRatio"],
  bottomDiameter: ["shieldingAngle", "bulbFit", "thermalClearance", "proportionCheck", "overhangAngle", "openingRatio"],
  curveTension: [],
  wallThickness: ["thermalClearance", "wallThickness"],
};

/** Returns the worst severity from a list of constraints */
export function worstSeverity(
  constraints: LampConstraint[]
): ConstraintSeverity | null {
  if (constraints.length === 0) return null;
  if (constraints.some((c) => c.severity === "error")) return "error";
  if (constraints.some((c) => c.severity === "warn")) return "warn";
  return "info";
}
