import type { ShapeParameters, ConstraintSeverity } from "./types";
import { runAllConstraints } from "./constraints";
import { SLIDER_CONSTRAINTS, worstSeverity } from "./constraint-display";

/** How much of the original delta to keep at each severity level */
const DAMPING: Record<ConstraintSeverity, number> = {
  info: 1, // no resistance
  warn: 0.6, // keep 60% of movement
  error: 0.3, // keep 30% of movement
};

const SEVERITY_RANK: Record<ConstraintSeverity, number> = {
  info: 0,
  warn: 1,
  error: 2,
};

/**
 * Applies soft resistance when a slider value change would push constraints
 * toward warn or error territory. Returns the dampened value.
 *
 * - No resistance when constraints are healthy or improving
 * - Mild resistance (40% reduction) entering warn zone
 * - Strong resistance (70% reduction) entering error zone
 */
export function applySliderResistance(
  currentShape: ShapeParameters,
  key: keyof ShapeParameters,
  rawValue: number,
  sliderStep: number,
): number {
  const currentValue = currentShape[key];
  const delta = rawValue - currentValue;
  if (Math.abs(delta) < 0.001) return rawValue;

  const relevantIds = SLIDER_CONSTRAINTS[key];
  if (relevantIds.length === 0) return rawValue;

  // Evaluate constraints at proposed value
  const proposedShape = { ...currentShape, [key]: rawValue };
  const proposedResults = runAllConstraints(proposedShape);
  const proposedConstraints = relevantIds.map((id) => proposedResults[id]);
  const proposedSeverity = worstSeverity(proposedConstraints);

  // No issues at proposed value → no resistance
  if (!proposedSeverity || proposedSeverity === "info") return rawValue;

  // Evaluate constraints at current value
  const currentResults = runAllConstraints(currentShape);
  const currentConstraints = relevantIds.map((id) => currentResults[id]);
  const currentSeverity = worstSeverity(currentConstraints);

  const currentRank = currentSeverity ? SEVERITY_RANK[currentSeverity] : -1;
  const proposedRank = SEVERITY_RANK[proposedSeverity];

  // Moving toward safety → no resistance
  if (proposedRank < currentRank) return rawValue;

  // Apply damping based on the proposed severity
  const dampingFactor = DAMPING[proposedSeverity];
  const dampedValue = currentValue + delta * dampingFactor;

  // Round to nearest slider step to keep values clean
  return roundToStep(dampedValue, sliderStep);
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}
