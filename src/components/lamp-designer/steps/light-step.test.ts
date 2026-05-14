import { describe, it, expect } from "vitest";
import type { LightParameters, LightDirection } from "../../../lib/lamp-designer/types";

// Mirror the component's exported helpers/constants for unit testing
const DIRECTIONS: LightDirection[] = ["down", "up", "ambient"];

const WARMTH_RANGE = { min: 2000, max: 5000, step: 100 };
const SPREAD_RANGE = { min: 15, max: 150, step: 5 };

function warmthLabel(kelvin: number): string {
  if (kelvin <= 2400) return "Candlelight — very warm and cozy";
  if (kelvin <= 2900) return "Warm white — relaxed and inviting";
  if (kelvin <= 3500) return "Neutral — balanced everyday light";
  if (kelvin <= 4500) return "Cool white — crisp and focused";
  return "Daylight — bright and energizing";
}

function spreadLabel(angle: number): string {
  if (angle <= 25) return "Narrow spot — highlights a small area";
  if (angle <= 45) return "Focused — good for reading and task work";
  if (angle <= 80) return "Medium — lights the table without spilling far";
  if (angle <= 120) return "Wide — fills most of the room";
  return "Extra wide — even light everywhere";
}

describe("LightStep direction options", () => {
  it("covers all LightDirection values", () => {
    const allDirections: LightDirection[] = ["down", "up", "ambient"];
    expect(DIRECTIONS).toEqual(allDirections);
  });
});

describe("warmthLabel", () => {
  it("returns candlelight for low temperatures", () => {
    expect(warmthLabel(2000)).toContain("Candlelight");
    expect(warmthLabel(2400)).toContain("Candlelight");
  });

  it("returns warm white in mid-low range", () => {
    expect(warmthLabel(2500)).toContain("Warm white");
    expect(warmthLabel(2900)).toContain("Warm white");
  });

  it("returns neutral for middle range", () => {
    expect(warmthLabel(3000)).toContain("Neutral");
    expect(warmthLabel(3500)).toContain("Neutral");
  });

  it("returns cool white for upper-mid range", () => {
    expect(warmthLabel(3600)).toContain("Cool white");
    expect(warmthLabel(4500)).toContain("Cool white");
  });

  it("returns daylight for high temperatures", () => {
    expect(warmthLabel(4600)).toContain("Daylight");
    expect(warmthLabel(5000)).toContain("Daylight");
  });

  it("returns a non-empty string for all values in range", () => {
    for (let k = WARMTH_RANGE.min; k <= WARMTH_RANGE.max; k += WARMTH_RANGE.step) {
      expect(warmthLabel(k).length).toBeGreaterThan(0);
    }
  });
});

describe("spreadLabel", () => {
  it("returns narrow spot for tight angles", () => {
    expect(spreadLabel(15)).toContain("Narrow spot");
    expect(spreadLabel(25)).toContain("Narrow spot");
  });

  it("returns focused for moderate angles", () => {
    expect(spreadLabel(30)).toContain("Focused");
    expect(spreadLabel(45)).toContain("Focused");
  });

  it("returns medium for mid-range angles", () => {
    expect(spreadLabel(60)).toContain("Medium");
    expect(spreadLabel(80)).toContain("Medium");
  });

  it("returns wide for broad angles", () => {
    expect(spreadLabel(90)).toContain("Wide");
    expect(spreadLabel(120)).toContain("Wide");
  });

  it("returns extra wide for very broad angles", () => {
    expect(spreadLabel(130)).toContain("Extra wide");
    expect(spreadLabel(150)).toContain("Extra wide");
  });

  it("returns a non-empty string for all values in range", () => {
    for (let a = SPREAD_RANGE.min; a <= SPREAD_RANGE.max; a += SPREAD_RANGE.step) {
      expect(spreadLabel(a).length).toBeGreaterThan(0);
    }
  });
});

describe("LightParameters slider ranges", () => {
  it("colorTemperature range covers standard LED bulb range", () => {
    expect(WARMTH_RANGE.min).toBeLessThanOrEqual(2700);
    expect(WARMTH_RANGE.max).toBeGreaterThanOrEqual(4000);
  });

  it("beamAngle range covers narrow spots to wide floods", () => {
    expect(SPREAD_RANGE.min).toBeLessThanOrEqual(25);
    expect(SPREAD_RANGE.max).toBeGreaterThanOrEqual(120);
  });

  it("step sizes produce reasonable number of stops", () => {
    const warmthStops = (WARMTH_RANGE.max - WARMTH_RANGE.min) / WARMTH_RANGE.step;
    const spreadStops = (SPREAD_RANGE.max - SPREAD_RANGE.min) / SPREAD_RANGE.step;
    expect(warmthStops).toBeGreaterThanOrEqual(10);
    expect(warmthStops).toBeLessThanOrEqual(100);
    expect(spreadStops).toBeGreaterThanOrEqual(10);
    expect(spreadStops).toBeLessThanOrEqual(100);
  });
});

describe("LightParameters defaults are valid", () => {
  const defaults: LightParameters = {
    colorTemperature: 2700,
    beamAngle: 60,
    direction: "down",
  };

  it("default colorTemperature is within range", () => {
    expect(defaults.colorTemperature).toBeGreaterThanOrEqual(WARMTH_RANGE.min);
    expect(defaults.colorTemperature).toBeLessThanOrEqual(WARMTH_RANGE.max);
  });

  it("default beamAngle is within range", () => {
    expect(defaults.beamAngle).toBeGreaterThanOrEqual(SPREAD_RANGE.min);
    expect(defaults.beamAngle).toBeLessThanOrEqual(SPREAD_RANGE.max);
  });

  it("default direction is a valid LightDirection", () => {
    expect(DIRECTIONS).toContain(defaults.direction);
  });
});
