import type { PatternId, PatternDefinition, PatternGeometry } from "./types";

const SMOOTH_GEOMETRY: PatternGeometry = {
  type: "none",
  spacingMm: 0,
  sizeMm: 0,
  density: 0,
  needsFineLayer: true,
  createsStructure: false,
};

const VERTICAL_LINES_GEOMETRY: PatternGeometry = {
  type: "perforation",
  spacingMm: 8,
  sizeMm: 2,
  density: 0.25,
  needsFineLayer: false,
  createsStructure: true,
};

const HORIZONTAL_RINGS_GEOMETRY: PatternGeometry = {
  type: "perforation",
  spacingMm: 6,
  sizeMm: 1.5,
  density: 0.25,
  needsFineLayer: true,
  createsStructure: false,
};

const DIAMOND_GRID_GEOMETRY: PatternGeometry = {
  type: "perforation",
  spacingMm: 10,
  sizeMm: 4,
  density: 0.4,
  needsFineLayer: false,
  createsStructure: true,
};

const HEXAGONAL_GEOMETRY: PatternGeometry = {
  type: "perforation",
  spacingMm: 8,
  sizeMm: 5,
  density: 0.5,
  needsFineLayer: false,
  createsStructure: true,
};

const ORGANIC_GEOMETRY: PatternGeometry = {
  type: "relief",
  spacingMm: 12,
  sizeMm: 3,
  density: 0.3,
  needsFineLayer: false,
  createsStructure: true,
};

export const PATTERNS: PatternDefinition[] = [
  {
    id: "smooth",
    name: "Smooth",
    description: "Clean surface with no pattern — light diffuses evenly through the wall",
    geometry: SMOOTH_GEOMETRY,
  },
  {
    id: "vertical-lines",
    name: "Vertical lines",
    description: "Narrow vertical slits that cast striped shadows downward",
    geometry: VERTICAL_LINES_GEOMETRY,
  },
  {
    id: "horizontal-rings",
    name: "Horizontal rings",
    description: "Thin horizontal bands that create layered light rings",
    geometry: HORIZONTAL_RINGS_GEOMETRY,
  },
  {
    id: "diamond-grid",
    name: "Diamond grid",
    description: "Diagonal crosshatch forming diamond-shaped openings",
    geometry: DIAMOND_GRID_GEOMETRY,
  },
  {
    id: "hexagonal",
    name: "Hexagonal",
    description: "Honeycomb perforations for maximum light with structural strength",
    geometry: HEXAGONAL_GEOMETRY,
  },
  {
    id: "organic",
    name: "Organic",
    description: "Irregular, nature-inspired relief pattern with varied light play",
    geometry: ORGANIC_GEOMETRY,
  },
];

export function getPattern(id: PatternId): PatternDefinition {
  const pattern = PATTERNS.find((p) => p.id === id);
  if (!pattern) throw new Error(`Unknown pattern: ${id}`);
  return pattern;
}

export function getPerforationPatterns(): PatternDefinition[] {
  return PATTERNS.filter((p) => p.geometry.type === "perforation");
}

export function getPatternsNeedingFineLayer(): PatternDefinition[] {
  return PATTERNS.filter((p) => p.geometry.needsFineLayer);
}
