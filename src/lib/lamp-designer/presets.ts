// The preset gallery (Jesper's product call, 2026-07-31): the journey
// starts with a wall of complete lamps. Every preset is a full, valid
// LampParameters: fixture, silhouette, pattern, light and setting are
// baked in and consistent, so the vignette matches the intent from the
// first click. All silhouettes are generic geometric families per the
// IP guardrails in the roadmap; top diameters respect each fixture's
// crown minimum so nothing gets clamped behind the user's back.

import type { LampParameters } from "./types";

export interface LampPreset {
  id: string;
  name: string;
  /** One line under the name: what it is and where it lives. */
  tagline: string;
  parameters: LampParameters;
}

const LIGHT_WARM = { colorTemperature: 2700, beamAngle: 120, direction: "down" as const };
const LIGHT_SOFT = { colorTemperature: 3000, beamAngle: 130, direction: "ambient" as const };
const LIGHT_NEUTRAL = { colorTemperature: 4000, beamAngle: 120, direction: "down" as const };

export const PRESETS: LampPreset[] = [
  {
    id: "ribbed-oval",
    name: "Ribbed Oval",
    tagline: "The Scandinavian dining pendant: full belly, fine ribs",
    parameters: {
      context: "dining",
      fixture: { moduleId: "e27-clamp" },
      archetype: "vase",
      templateId: "oval",
      shape: { height: 200, topDiameter: 58, bottomDiameter: 112, curveTension: 0.55, wallThickness: 1.8 },
      light: LIGHT_WARM,
      pattern: { presetId: "fine-ribs", intensity: 1 },
    },
  },
  {
    id: "swirl",
    name: "Swirl",
    tagline: "Twisted ribs on an oval body, hangs from an IKEA cord set",
    parameters: {
      context: "hallway",
      fixture: { moduleId: "ikea-slip" },
      archetype: "vase",
      templateId: "oval",
      shape: { height: 210, topDiameter: 62, bottomDiameter: 108, curveTension: 0.55, wallThickness: 1.8 },
      light: LIGHT_WARM,
      pattern: { presetId: "spiral-twist", intensity: 1.1 },
    },
  },
  {
    id: "globe",
    name: "Globe",
    tagline: "A round spiral pendant for the reading corner",
    parameters: {
      context: "reading",
      fixture: { moduleId: "e27-clamp" },
      archetype: "vase",
      templateId: "oval",
      shape: { height: 170, topDiameter: 58, bottomDiameter: 96, curveTension: 0.65, wallThickness: 1.8 },
      light: LIGHT_SOFT,
      pattern: { presetId: "spiral-twist", intensity: 0.8 },
    },
  },
  {
    id: "bell",
    name: "Bell",
    tagline: "Slim neck, flared rim: the classic shade over the counter",
    parameters: {
      context: "dining",
      fixture: { moduleId: "e14-clamp" },
      archetype: "vase",
      templateId: "bell",
      shape: { height: 170, topDiameter: 44, bottomDiameter: 168, curveTension: 0.5, wallThickness: 2 },
      light: LIGHT_WARM,
      pattern: { presetId: "fine-ribs", intensity: 0.9 },
    },
  },
  {
    id: "bedside-glow",
    name: "Bedside Glow",
    tagline: "A ribbed column on the LED kit: no wiring, just USB",
    parameters: {
      context: "bedside",
      fixture: { moduleId: "kit001-seat" },
      archetype: "vase",
      templateId: "cylinder",
      shape: { height: 150, topDiameter: 84, bottomDiameter: 96, curveTension: 0, wallThickness: 1.6 },
      light: LIGHT_WARM,
      pattern: { presetId: "fine-ribs", intensity: 1 },
    },
  },
  {
    id: "column",
    name: "Column",
    tagline: "A standing lamp on a stem: straight, calm, ribbed",
    parameters: {
      context: "reading",
      fixture: { moduleId: "stem-m10" },
      archetype: "vase",
      templateId: "cylinder",
      shape: { height: 220, topDiameter: 90, bottomDiameter: 90, curveTension: 0, wallThickness: 1.8 },
      light: LIGHT_SOFT,
      pattern: { presetId: "fine-ribs", intensity: 1 },
    },
  },
  {
    id: "wave",
    name: "Wave",
    tagline: "Soft horizontal ripples, the organic ceramics look",
    parameters: {
      context: "dining",
      fixture: { moduleId: "e27-clamp" },
      archetype: "vase",
      templateId: "dome",
      shape: { height: 160, topDiameter: 58, bottomDiameter: 190, curveTension: 0.6, wallThickness: 2 },
      light: LIGHT_WARM,
      pattern: { presetId: "wavy-bands", intensity: 1 },
    },
  },
  {
    id: "moon",
    name: "The Moon",
    tagline: "The real lunar surface, carved in light",
    parameters: {
      context: "bedside",
      fixture: { moduleId: "kit001-seat" },
      archetype: "moon",
      templateId: "cone",
      shape: { height: 150, topDiameter: 100, bottomDiameter: 150, curveTension: 0, wallThickness: 2 },
      light: LIGHT_SOFT,
      pattern: { presetId: "smooth", intensity: 1 },
    },
  },
  {
    id: "moon-pendant",
    name: "Moon Pendant",
    tagline: "The full moon on a cord, up to 300 mm across",
    parameters: {
      context: "dining",
      fixture: { moduleId: "e27-clamp" },
      archetype: "moon",
      templateId: "cone",
      shape: { height: 200, topDiameter: 100, bottomDiameter: 220, curveTension: 0, wallThickness: 2 },
      light: LIGHT_WARM,
      pattern: { presetId: "smooth", intensity: 1 },
    },
  },
  {
    id: "pure",
    name: "Pure",
    tagline: "A clean cone in crisp white, nothing extra",
    parameters: {
      context: "hallway",
      fixture: { moduleId: "e27-clamp" },
      archetype: "vase",
      templateId: "cone",
      shape: { height: 170, topDiameter: 58, bottomDiameter: 180, curveTension: 0, wallThickness: 2.2 },
      light: LIGHT_NEUTRAL,
      pattern: { presetId: "smooth", intensity: 1 },
    },
  },
  {
    id: "little-one",
    name: "Little One",
    tagline: "A small ribbed cone for shelves and corners",
    parameters: {
      context: "shelf",
      fixture: { moduleId: "e14-clamp" },
      archetype: "vase",
      templateId: "cone",
      shape: { height: 120, topDiameter: 44, bottomDiameter: 92, curveTension: 0, wallThickness: 1.6 },
      light: LIGHT_WARM,
      pattern: { presetId: "fine-ribs", intensity: 0.8 },
    },
  },
];

export function getPreset(id: string): LampPreset {
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) throw new Error(`Unknown preset: ${id}`);
  return preset;
}
