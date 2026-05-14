import { describe, it, expect } from "vitest";
import {
  STEP_IDS,
  BULB_E27,
  type LampParameters,
  type LampDesignerState,
  type LampConstraint,
  type ProfilePoint,
  type SavedLampDesign,
  type ConstraintResults,
} from "./types";

describe("STEP_IDS", () => {
  it("contains all 8 steps in order", () => {
    expect(STEP_IDS).toEqual([
      "context",
      "form",
      "shape",
      "light",
      "pattern",
      "check",
      "reveal",
      "export",
    ]);
  });

  it("has exactly 8 entries", () => {
    expect(STEP_IDS).toHaveLength(8);
  });
});

describe("BULB_E27", () => {
  it("has correct reference dimensions", () => {
    expect(BULB_E27.maxDiameter).toBe(60);
    expect(BULB_E27.socketDiameter).toBe(27);
    expect(BULB_E27.totalHeight).toBe(120);
    expect(BULB_E27.minClearance).toBe(20);
    expect(BULB_E27.fitDiameter).toBe(70);
  });

  it("is readonly", () => {
    // fitDiameter should equal maxDiameter + 2 * 5mm clearance
    expect(BULB_E27.fitDiameter).toBe(BULB_E27.maxDiameter + 10);
  });
});

describe("type structure tests", () => {
  it("LampParameters holds all required fields", () => {
    const params: LampParameters = {
      context: "bedside",
      templateId: "cone",
      shape: {
        height: 200,
        topDiameter: 50,
        bottomDiameter: 300,
        curveTension: 0.5,
        wallThickness: 1.2,
      },
      light: {
        colorTemperature: 2700,
        beamAngle: 120,
        direction: "down",
      },
      patternId: "smooth",
    };
    expect(params.context).toBe("bedside");
    expect(params.templateId).toBe("cone");
    expect(params.shape.height).toBe(200);
    expect(params.light.colorTemperature).toBe(2700);
    expect(params.patternId).toBe("smooth");
  });

  it("LampDesignerState tracks current step and completed steps", () => {
    const state: LampDesignerState = {
      currentStep: "shape",
      completedSteps: ["context", "form"],
      parameters: {
        context: "dining",
        templateId: "dome",
        shape: {
          height: 150,
          topDiameter: 40,
          bottomDiameter: 250,
          curveTension: 0.3,
          wallThickness: 1.0,
        },
        light: {
          colorTemperature: 3000,
          beamAngle: 90,
          direction: "ambient",
        },
        patternId: "hexagonal",
      },
    };
    expect(state.currentStep).toBe("shape");
    expect(state.completedSteps).toContain("context");
    expect(state.completedSteps).toContain("form");
  });

  it("LampConstraint holds constraint check result", () => {
    const constraint: LampConstraint = {
      ok: false,
      value: 22,
      message: "Shielding angle too low, bulb visible from seated height",
      severity: "warn",
    };
    expect(constraint.ok).toBe(false);
    expect(constraint.severity).toBe("warn");
  });

  it("ConstraintResults maps all constraint IDs", () => {
    const base: LampConstraint = {
      ok: true,
      value: 0,
      message: "",
      severity: "info",
    };
    const results: ConstraintResults = {
      shieldingAngle: { ...base, value: 35 },
      bulbFit: { ...base, value: 75 },
      thermalClearance: { ...base, value: 25 },
      proportionCheck: { ...base, value: 1.5 },
      wallThickness: { ...base, value: 1.2 },
      overhangAngle: { ...base, value: 30 },
      openingRatio: { ...base, value: 0.8 },
    };
    expect(Object.keys(results)).toHaveLength(7);
  });

  it("ProfilePoint supports optional bezier handles", () => {
    const simple: ProfilePoint = { x: 0, y: 100 };
    const withHandles: ProfilePoint = {
      x: 50,
      y: 200,
      handleIn: { x: 40, y: 190 },
      handleOut: { x: 60, y: 210 },
    };
    expect(simple.handleIn).toBeUndefined();
    expect(withHandles.handleIn).toBeDefined();
  });

  it("SavedLampDesign includes nullable fields", () => {
    const design: SavedLampDesign = {
      id: "abc-123",
      userId: null,
      name: "My Lamp",
      parameters: {
        context: "desk",
        templateId: "cylinder",
        shape: {
          height: 180,
          topDiameter: 80,
          bottomDiameter: 80,
          curveTension: 0,
          wallThickness: 1.5,
        },
        light: {
          colorTemperature: 4000,
          beamAngle: 60,
          direction: "down",
        },
        patternId: "vertical-lines",
      },
      thumbnail: null,
      context: "desk",
      templateId: "cylinder",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(design.userId).toBeNull();
    expect(design.thumbnail).toBeNull();
  });
});
