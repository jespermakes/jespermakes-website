import type { PatternId, PatternDefinition } from "./types";

export const PATTERNS: PatternDefinition[] = [
  { id: "smooth", name: "Smooth" },
  { id: "vertical-lines", name: "Vertical lines" },
  { id: "horizontal-rings", name: "Horizontal rings" },
  { id: "diamond-grid", name: "Diamond grid" },
  { id: "hexagonal", name: "Hexagonal" },
  { id: "organic", name: "Organic" },
];

export function getPattern(id: PatternId): PatternDefinition {
  const pattern = PATTERNS.find((p) => p.id === id);
  if (!pattern) throw new Error(`Unknown pattern: ${id}`);
  return pattern;
}
