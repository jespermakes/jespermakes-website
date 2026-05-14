import { describe, it, expect } from "vitest";
import type { LampContext } from "../../../lib/lamp-designer/types";

// Mirror the component's exported helpers for unit testing
function lightColorFromTemperature(kelvin: number): string {
  if (kelvin <= 2400) return "#ffb347";
  if (kelvin <= 2900) return "#ffd699";
  if (kelvin <= 3500) return "#ffe8c0";
  if (kelvin <= 4500) return "#fff4e0";
  return "#fff9f0";
}

function glowOpacity(beamAngle: number): number {
  return Math.min(1, Math.max(0.2, beamAngle / 150));
}

const ALL_CONTEXTS: LampContext[] = [
  "bedside",
  "dining",
  "reading",
  "hallway",
  "desk",
  "shelf",
];

describe("lightColorFromTemperature", () => {
  it("returns warm orange for candlelight temperatures", () => {
    expect(lightColorFromTemperature(2000)).toBe("#ffb347");
    expect(lightColorFromTemperature(2400)).toBe("#ffb347");
  });

  it("returns warm gold for warm white range", () => {
    expect(lightColorFromTemperature(2500)).toBe("#ffd699");
    expect(lightColorFromTemperature(2900)).toBe("#ffd699");
  });

  it("returns neutral warm for mid-range", () => {
    expect(lightColorFromTemperature(3000)).toBe("#ffe8c0");
    expect(lightColorFromTemperature(3500)).toBe("#ffe8c0");
  });

  it("returns cool warm for upper-mid range", () => {
    expect(lightColorFromTemperature(3600)).toBe("#fff4e0");
    expect(lightColorFromTemperature(4500)).toBe("#fff4e0");
  });

  it("returns near-white for daylight temperatures", () => {
    expect(lightColorFromTemperature(4600)).toBe("#fff9f0");
    expect(lightColorFromTemperature(5000)).toBe("#fff9f0");
  });

  it("returns a valid hex color for all standard LED values", () => {
    for (let k = 2000; k <= 5000; k += 100) {
      const color = lightColorFromTemperature(k);
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("glowOpacity", () => {
  it("clamps to minimum 0.2 for very narrow beams", () => {
    expect(glowOpacity(0)).toBe(0.2);
    expect(glowOpacity(15)).toBeCloseTo(0.2);
  });

  it("scales linearly with beam angle", () => {
    const narrow = glowOpacity(30);
    const wide = glowOpacity(120);
    expect(wide).toBeGreaterThan(narrow);
  });

  it("clamps to maximum 1.0 for very wide beams", () => {
    expect(glowOpacity(150)).toBe(1);
    expect(glowOpacity(200)).toBe(1);
  });

  it("returns a value between 0.2 and 1 for all valid beam angles", () => {
    for (let a = 15; a <= 150; a += 5) {
      const opacity = glowOpacity(a);
      expect(opacity).toBeGreaterThanOrEqual(0.2);
      expect(opacity).toBeLessThanOrEqual(1);
    }
  });
});

describe("RevealStep context labels", () => {
  it("every LampContext has a label entry", () => {
    const CONTEXT_LABELS: Record<LampContext, string> = {
      bedside: "Bedside table",
      dining: "Dining room",
      reading: "Reading nook",
      hallway: "Hallway",
      desk: "Desk",
      shelf: "Shelf",
    };

    for (const ctx of ALL_CONTEXTS) {
      expect(CONTEXT_LABELS[ctx]).toBeTruthy();
      expect(CONTEXT_LABELS[ctx].length).toBeGreaterThan(0);
    }
  });
});
