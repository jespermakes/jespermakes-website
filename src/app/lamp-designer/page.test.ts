import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { STEP_IDS } from "../../lib/lamp-designer/types";
import type { LampDesignerState, LampParameters } from "../../lib/lamp-designer/types";
import { getTemplate } from "../../lib/lamp-designer/templates";

const source = readFileSync(resolve(__dirname, "page.tsx"), "utf-8");

describe("lamp-designer page structure", () => {
  it("is a client component", () => {
    expect(source).toContain('"use client"');
  });

  it("exports a default page function", () => {
    expect(source).toMatch(/export default function \w+Page/);
  });

  it("renders StepNav component", () => {
    expect(source).toContain("<StepNav");
  });

  it("renders LampSceneDynamic for 3D preview", () => {
    expect(source).toContain("<LampSceneDynamic");
  });

  it("has a three-panel layout with aside-main-aside", () => {
    const asideCount = (source.match(/<aside/g) || []).length;
    const mainCount = (source.match(/<main/g) || []).length;
    expect(asideCount).toBe(2);
    expect(mainCount).toBe(1);
  });

  it("has Back and Next navigation buttons", () => {
    expect(source).toContain("Back");
    expect(source).toContain("Next");
  });
});

describe("lamp-designer step state logic", () => {
  function createState(overrides: Partial<LampDesignerState> = {}): LampDesignerState {
    const template = getTemplate("cone");
    return {
      currentStep: "context",
      completedSteps: [],
      parameters: {
        context: "bedside",
        templateId: "cone",
        shape: template.defaultParameters,
        light: { colorTemperature: 2700, beamAngle: 120, direction: "down" },
        patternId: "smooth",
      },
      ...overrides,
    };
  }

  function completeAndAdvance(state: LampDesignerState): LampDesignerState {
    const idx = STEP_IDS.indexOf(state.currentStep);
    const isLast = idx === STEP_IDS.length - 1;
    const alreadyCompleted = state.completedSteps.includes(state.currentStep);
    return {
      ...state,
      completedSteps: alreadyCompleted
        ? state.completedSteps
        : [...state.completedSteps, state.currentStep],
      currentStep: isLast ? state.currentStep : STEP_IDS[idx + 1],
    };
  }

  function goBack(state: LampDesignerState): LampDesignerState {
    const idx = STEP_IDS.indexOf(state.currentStep);
    if (idx === 0) return state;
    return { ...state, currentStep: STEP_IDS[idx - 1] };
  }

  it("starts on the context step", () => {
    const state = createState();
    expect(state.currentStep).toBe("context");
    expect(state.completedSteps).toHaveLength(0);
  });

  it("advances to the next step and marks current as completed", () => {
    const state = createState();
    const next = completeAndAdvance(state);
    expect(next.currentStep).toBe("form");
    expect(next.completedSteps).toContain("context");
  });

  it("does not duplicate completed steps when advancing from an already-completed step", () => {
    const state = createState({
      currentStep: "context",
      completedSteps: ["context"],
    });
    const next = completeAndAdvance(state);
    expect(next.completedSteps.filter((s) => s === "context")).toHaveLength(1);
    expect(next.currentStep).toBe("form");
  });

  it("stays on the last step when completing it", () => {
    const state = createState({
      currentStep: "export",
      completedSteps: STEP_IDS.slice(0, -1),
    });
    const next = completeAndAdvance(state);
    expect(next.currentStep).toBe("export");
    expect(next.completedSteps).toContain("export");
  });

  it("goes back to the previous step", () => {
    const state = createState({ currentStep: "shape" });
    const prev = goBack(state);
    expect(prev.currentStep).toBe("form");
  });

  it("does not go back before the first step", () => {
    const state = createState({ currentStep: "context" });
    const prev = goBack(state);
    expect(prev.currentStep).toBe("context");
  });

  it("can walk through all steps sequentially", () => {
    let state = createState();
    for (let i = 0; i < STEP_IDS.length; i++) {
      expect(state.currentStep).toBe(STEP_IDS[i]);
      state = completeAndAdvance(state);
    }
    expect(state.completedSteps).toHaveLength(STEP_IDS.length);
    expect(state.currentStep).toBe("export");
  });

  it("goToStep changes current step without affecting completed", () => {
    const state = createState({
      currentStep: "shape",
      completedSteps: ["context", "form"],
    });
    const jumped: LampDesignerState = { ...state, currentStep: "context" };
    expect(jumped.currentStep).toBe("context");
    expect(jumped.completedSteps).toEqual(["context", "form"]);
  });
});

describe("lamp-designer default parameters", () => {
  it("cone template provides valid default shape parameters", () => {
    const template = getTemplate("cone");
    const shape = template.defaultParameters;
    expect(shape.height).toBeGreaterThan(0);
    expect(shape.wallThickness).toBeGreaterThan(0);
    expect(shape.bottomDiameter).toBeGreaterThan(0);
  });

  it("default parameters match expected initial values", () => {
    const template = getTemplate("cone");
    const params: LampParameters = {
      context: "bedside",
      templateId: "cone",
      shape: template.defaultParameters,
      light: { colorTemperature: 2700, beamAngle: 120, direction: "down" },
      patternId: "smooth",
    };
    expect(params.context).toBe("bedside");
    expect(params.templateId).toBe("cone");
    expect(params.patternId).toBe("smooth");
    expect(params.light.direction).toBe("down");
  });
});
