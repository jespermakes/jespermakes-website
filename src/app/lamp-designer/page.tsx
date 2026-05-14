"use client";

import { useCallback, useState } from "react";
import type {
  StepId,
  LampDesignerState,
  LampParameters,
} from "@/lib/lamp-designer/types";
import { STEP_IDS } from "@/lib/lamp-designer/types";
import { getTemplate } from "@/lib/lamp-designer/templates";
import { StepNav } from "@/components/lamp-designer/step-nav";
import { LampSceneDynamic } from "@/components/lamp-designer/scene-dynamic";

const DEFAULT_TEMPLATE = getTemplate("cone");

const DEFAULT_PARAMETERS: LampParameters = {
  context: "bedside",
  templateId: "cone",
  shape: DEFAULT_TEMPLATE.defaultParameters,
  light: {
    colorTemperature: 2700,
    beamAngle: 120,
    direction: "down",
  },
  patternId: "smooth",
};

const INITIAL_STATE: LampDesignerState = {
  currentStep: "context",
  completedSteps: [],
  parameters: DEFAULT_PARAMETERS,
};

export default function LampDesignerPage() {
  const [state, setState] = useState<LampDesignerState>(INITIAL_STATE);

  const { currentStep, completedSteps, parameters } = state;

  const goToStep = useCallback((step: StepId) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const completeCurrentAndAdvance = useCallback(() => {
    setState((prev) => {
      const idx = STEP_IDS.indexOf(prev.currentStep);
      const isLast = idx === STEP_IDS.length - 1;
      const alreadyCompleted = prev.completedSteps.includes(prev.currentStep);
      return {
        ...prev,
        completedSteps: alreadyCompleted
          ? prev.completedSteps
          : [...prev.completedSteps, prev.currentStep],
        currentStep: isLast ? prev.currentStep : STEP_IDS[idx + 1],
      };
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      const idx = STEP_IDS.indexOf(prev.currentStep);
      if (idx === 0) return prev;
      return { ...prev, currentStep: STEP_IDS[idx - 1] };
    });
  }, []);

  const currentStepIndex = STEP_IDS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEP_IDS.length - 1;

  const template = getTemplate(parameters.templateId);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-parchment">
      {/* Left: Step Navigation */}
      <aside className="w-56 shrink-0 border-r border-wood/10 bg-cream/50 overflow-y-auto">
        <StepNav
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
      </aside>

      {/* Center: 3D Preview */}
      <main className="flex-1 relative min-w-0">
        <LampSceneDynamic
          profile={template.profile}
          shape={parameters.shape}
        />
      </main>

      {/* Right: Controls Panel */}
      <aside className="w-80 shrink-0 border-l border-wood/10 bg-cream/50 overflow-y-auto flex flex-col">
        <div className="p-6 flex-1">
          <h2 className="text-lg font-semibold text-wood mb-4 capitalize">
            {currentStep}
          </h2>
          <p className="text-sm text-wood/60">
            Step controls will appear here.
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="p-4 border-t border-wood/10 flex gap-3">
          {!isFirstStep && (
            <button
              type="button"
              onClick={goBack}
              className="px-4 py-2 text-sm rounded-lg border border-wood/20 text-wood hover:bg-cream transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={completeCurrentAndAdvance}
            className="px-4 py-2 text-sm rounded-lg bg-forest text-cream hover:bg-forest/90 transition-colors ml-auto"
          >
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </aside>
    </div>
  );
}
