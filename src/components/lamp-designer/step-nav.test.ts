import { describe, it, expect } from "vitest";
import { STEP_IDS } from "../../lib/lamp-designer/types";
import type { StepId } from "../../lib/lamp-designer/types";

describe("StepNav step definitions", () => {
  it("covers all 8 step IDs", () => {
    expect(STEP_IDS).toHaveLength(8);
  });

  it("step IDs are in the expected order", () => {
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
});

describe("StepNav step state logic", () => {
  function getStepState(
    stepId: StepId,
    currentStep: StepId,
    completedSteps: StepId[]
  ) {
    const isCurrent = stepId === currentStep;
    const isCompleted = completedSteps.includes(stepId);
    const isClickable = isCompleted || isCurrent;
    return { isCurrent, isCompleted, isClickable };
  }

  it("marks the current step as current and clickable", () => {
    const state = getStepState("shape", "shape", ["context", "form"]);
    expect(state.isCurrent).toBe(true);
    expect(state.isCompleted).toBe(false);
    expect(state.isClickable).toBe(true);
  });

  it("marks completed steps as clickable", () => {
    const state = getStepState("context", "shape", ["context", "form"]);
    expect(state.isCurrent).toBe(false);
    expect(state.isCompleted).toBe(true);
    expect(state.isClickable).toBe(true);
  });

  it("marks future steps as not clickable", () => {
    const state = getStepState("light", "shape", ["context", "form"]);
    expect(state.isCurrent).toBe(false);
    expect(state.isCompleted).toBe(false);
    expect(state.isClickable).toBe(false);
  });

  it("first step starts as current with no completed steps", () => {
    const state = getStepState("context", "context", []);
    expect(state.isCurrent).toBe(true);
    expect(state.isClickable).toBe(true);
  });

  it("all steps are clickable when all are completed", () => {
    const allCompleted = STEP_IDS.slice();
    for (const stepId of STEP_IDS) {
      const state = getStepState(stepId, "export", allCompleted);
      expect(state.isClickable).toBe(true);
    }
  });

  it("completed step that is also current shows as both", () => {
    const state = getStepState("form", "form", ["context", "form"]);
    expect(state.isCurrent).toBe(true);
    expect(state.isCompleted).toBe(true);
    expect(state.isClickable).toBe(true);
  });
});
