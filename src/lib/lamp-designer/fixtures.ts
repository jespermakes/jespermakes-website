// Fixture module registry (DR-160 Phase A). Every lamp begins here: the
// module describes the real socket hardware and the verified printed
// interface for it. Dimensions come from docs/lamp-designer/
// RESEARCH-FIXTURE-STANDARDS.md; change them only with a measured reason.

import type {
  BulbEnvelope,
  FixtureModuleId,
  FixtureMode,
  MountInterface,
} from "./types";

export interface FixtureModule {
  id: FixtureModuleId;
  name: string;
  /** One-line pitch shown on the picker card. */
  description: string;
  /** "The part you buy": concrete hardware this mounts to. */
  hardware: string;
  mode: FixtureMode;
  apertureDiameter: number;
  landWidth: number;
  bulbEnvelope: BulbEnvelope;
  hardCapWatt: number | null;
  /** Fit caveat surfaced in the UI, if any. */
  fitNote?: string;
  /** Assembly steps for the export guide, in order. */
  assembly: string[];
}

const A60_LED: BulbEnvelope = {
  diameter: 60,
  length: 110,
  topOffset: 40,
  bulbName: "A60 LED (E27)",
};

const C35_LED: BulbEnvelope = {
  diameter: 35,
  length: 100,
  topOffset: 35,
  bulbName: "C35 candle LED (E14)",
};

export const FIXTURE_MODULES: readonly FixtureModule[] = [
  {
    id: "e27-clamp",
    name: "E27 ring mount",
    description: "The European standard. Clamps between the shade rings of any E27 lamp holder.",
    hardware: "Any E27 pendant cord set or lamp holder with shade rings (EN 60238), from any hardware store.",
    mode: "pendant",
    apertureDiameter: 41.0,
    landWidth: 8,
    bulbEnvelope: A60_LED,
    hardCapWatt: null,
    assembly: [
      "Unscrew one shade ring from the E27 lamp holder",
      "Drop the socket through the crown hole from above",
      "Screw the ring back on from below so the crown clamps between the rings",
      "Screw in a frosted LED bulb within the wattage on your export card",
    ],
  },
  {
    id: "ikea-slip",
    name: "IKEA cord set",
    description: "Slips over the socket of the IKEA pendant cord family and rests on the stock ring.",
    hardware: "IKEA SUNNEBY, HEMMA, SKAFTET, STRALA, HAVSDJUP or JALLBY cord set.",
    mode: "pendant",
    apertureDiameter: 45.0,
    landWidth: 8,
    bulbEnvelope: A60_LED,
    hardCapWatt: 22,
    fitNote: "IKEA marks these cord sets max 22 W. LED bulbs stay far below that.",
    assembly: [
      "Unscrew the ring from the cord set socket",
      "Slip the crown over the socket from below and rest it on the ring",
      "Screw the ring snug",
      "LED bulb in, hang it, plug it in",
    ],
  },
  {
    id: "e14-clamp",
    name: "E14 ring mount",
    description: "The small-socket version, for bedside and accent lamps. Also fits B22 bayonet holders.",
    hardware: "Any E14 lamp holder with shade rings; candle-size LED bulbs.",
    mode: "pendant",
    apertureDiameter: 29.0,
    landWidth: 7,
    bulbEnvelope: C35_LED,
    hardCapWatt: null,
    assembly: [
      "Unscrew one shade ring from the E14 holder",
      "Drop the socket through the crown hole from above",
      "Screw the ring back on from below",
      "Use a C35 candle LED within the wattage on your export card",
    ],
  },
  {
    id: "stem-m10",
    name: "Table stem flange",
    description: "Bolts onto the M10 threaded stem of a table or floor lamp, clamped by two lamp nuts.",
    hardware: "M10x1 lamp stem (the EU standard threaded tube) plus two M10 lamp nuts and an E27 holder.",
    mode: "table",
    apertureDiameter: 10.4,
    landWidth: 12,
    bulbEnvelope: { ...A60_LED, topOffset: 55 },
    hardCapWatt: null,
    assembly: [
      "Slide the flange over the M10 stem",
      "Clamp it between two M10 lamp nuts",
      "Mount the E27 holder on the stem above the flange",
      "LED bulb in",
    ],
  },
  {
    id: "kit001-seat",
    name: "Bambu LED Kit 001",
    description: "Seat for the MakerWorld LED lamp kit. Runs cool (5 V), so every material is safe.",
    hardware: "Bambu Lab / Maker's Supply LED Lamp Kit 001 (USB, 3 W or 5 W).",
    mode: "accent",
    apertureDiameter: 70.0,
    landWidth: 6,
    bulbEnvelope: {
      diameter: 70,
      length: 25,
      topOffset: 0,
      bulbName: "Kit 001 LED puck",
    },
    hardCapWatt: 5,
    fitNote: "Seat diameter is provisional until verified against the physical kit; print the fit coupon first.",
    assembly: [
      "Seat the Kit 001 LED puck in the crown opening",
      "Route the USB cable out through the aperture",
      "Power it from any USB port or charger",
    ],
  },
];

export function getFixtureModule(id: FixtureModuleId): FixtureModule {
  const match = FIXTURE_MODULES.find((m) => m.id === id);
  if (!match) throw new Error(`Unknown fixture module: ${id}`);
  return match;
}

export function getMountInterface(id: FixtureModuleId): MountInterface {
  const m = getFixtureModule(id);
  return {
    moduleId: m.id,
    apertureDiameter: m.apertureDiameter,
    landWidth: m.landWidth,
    crownMinRadius: m.apertureDiameter / 2 + m.landWidth,
    bulbEnvelope: m.bulbEnvelope,
    mode: m.mode,
    hardCapWatt: m.hardCapWatt,
  };
}

// -- Heat gating -------------------------------------------------------------
// Radial clearance (bulb glass to inner wall, mm) to supported LED wattage,
// from the measured-data table in RESEARCH-FIXTURE-STANDARDS.md section 5.4.
// Steps are [minClearanceMm, maxLedWatt], evaluated largest first.

const PLA_STEPS: Array<[number, number]> = [
  [50, 13],
  [35, 10],
  [25, 7],
  [15, 4],
];

const PETG_STEPS: Array<[number, number]> = [
  [30, 13],
  [20, 10],
  [15, 7],
  [10, 4],
];

export type ShadeMaterial = "pla" | "petg";

/**
 * Max continuous LED wattage for a given radial clearance and material.
 * Returns 0 when the clearance is below the smallest safe step.
 */
export function maxLedWatt(clearanceMm: number, material: ShadeMaterial): number {
  const steps = material === "pla" ? PLA_STEPS : PETG_STEPS;
  for (const [minClearance, watt] of steps) {
    if (clearanceMm >= minClearance) return watt;
  }
  return 0;
}

/** Apply the module's own hardware cap on top of the clearance-derived watt. */
export function cappedWatt(watt: number, id: FixtureModuleId): number {
  const cap = getFixtureModule(id).hardCapWatt;
  return cap === null ? watt : Math.min(watt, cap);
}
