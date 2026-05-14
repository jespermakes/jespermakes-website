import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const source = readFileSync(
  resolve(__dirname, "../mobile-step-nav.tsx"),
  "utf-8",
);

describe("MobileStepNav", () => {
  it("exports the MobileStepNav component", () => {
    expect(source).toContain("export function MobileStepNav");
  });

  it("exports the Step type", () => {
    expect(source).toContain('export type Step = "design" | "parts" | "export"');
  });

  it("defines all three step labels", () => {
    expect(source).toContain('"Design"');
    expect(source).toContain('"Parts"');
    expect(source).toContain('"Export"');
  });

  it("is hidden on md+ screens", () => {
    expect(source).toContain("md:hidden");
  });

  it("has navigation landmark with aria-label", () => {
    expect(source).toContain('aria-label="Design steps"');
  });

  it("marks the active step with aria-current", () => {
    expect(source).toContain('aria-current={isActive ? "step" : undefined}');
  });

  it("shows a checkmark icon for completed steps", () => {
    expect(source).toContain("<svg");
    expect(source).toContain("isPast");
  });

  it("highlights active step with forest color", () => {
    expect(source).toContain("bg-forest/10 text-forest");
    expect(source).toContain("bg-forest text-cream");
  });

  it("accepts currentStep and onStepChange props", () => {
    expect(source).toContain("currentStep: Step");
    expect(source).toContain("onStepChange: (step: Step) => void");
  });
});
