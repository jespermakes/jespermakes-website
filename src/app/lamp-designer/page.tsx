"use client";

import { useCallback, useState } from "react";
import type { LampPreset } from "@/lib/lamp-designer/presets";
import type {
  StepId,
  ShapeParameters,
  LampDesignerState,
  LampParameters,
  LightParameters,
  PatternParams,
  FixtureSpec,
} from "@/lib/lamp-designer/types";
import { STEP_IDS } from "@/lib/lamp-designer/types";
import { getTemplate } from "@/lib/lamp-designer/templates";
import { StepNav } from "@/components/lamp-designer/step-nav";
import { LampSceneDynamic } from "@/components/lamp-designer/scene-dynamic";
import { StartStep } from "@/components/lamp-designer/steps/start-step";
import { FixtureStep } from "@/components/lamp-designer/steps/fixture-step";
import { ShapeStep } from "@/components/lamp-designer/steps/shape-step";
import { LightStep } from "@/components/lamp-designer/steps/light-step";
import { PatternStep } from "@/components/lamp-designer/steps/pattern-step";
import { CheckStep } from "@/components/lamp-designer/steps/check-step";
import { RevealStep } from "@/components/lamp-designer/steps/reveal-step";
import { ExportStep } from "@/components/lamp-designer/steps/export-step";

const DEFAULT_TEMPLATE = getTemplate("cone");

const DEFAULT_PARAMETERS: LampParameters = {
  context: "bedside",
  fixture: { moduleId: "e27-clamp" },
  archetype: "vase",
  templateId: "cone",
  shape: DEFAULT_TEMPLATE.defaultParameters,
  light: {
    colorTemperature: 2700,
    beamAngle: 120,
    direction: "down",
  },
  pattern: { presetId: "smooth", intensity: 1 },
};

const INITIAL_STATE: LampDesignerState = {
  currentStep: "start",
  completedSteps: [],
  parameters: DEFAULT_PARAMETERS,
};

export default function LampDesignerPage() {
  const [state, setState] = useState<LampDesignerState>(INITIAL_STATE);
  const [presetId, setPresetId] = useState<string | null>(null);

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

  const selectPreset = useCallback((preset: LampPreset) => {
    setPresetId(preset.id);
    setState({
      currentStep: "shape",
      completedSteps: ["start"],
      parameters: JSON.parse(JSON.stringify(preset.parameters)) as LampParameters,
    });
  }, []);

  const updateFixture = useCallback((fixture: FixtureSpec) => {
    setState((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, fixture },
    }));
  }, []);

  const updateShape = useCallback((shape: ShapeParameters) => {
    setState((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, shape },
    }));
  }, []);

  const updateLight = useCallback((light: LightParameters) => {
    setState((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, light },
    }));
  }, []);

  const updatePattern = useCallback((pattern: PatternParams) => {
    setState((prev) => ({
      ...prev,
      parameters: { ...prev.parameters, pattern },
    }));
  }, []);

  const currentStepIndex = STEP_IDS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEP_IDS.length - 1;

  function renderStep() {
    switch (currentStep) {
      case "shape":
        return (
          <ShapeStep
            shape={parameters.shape}
            fixture={parameters.fixture}
            templateId={parameters.templateId}
            archetype={parameters.archetype}
            onChange={updateShape}
          />
        );
      case "light":
        return <LightStep light={parameters.light} onChange={updateLight} />;
      case "pattern":
        return (
          <PatternStep
            pattern={parameters.pattern}
            archetype={parameters.archetype}
            onChange={updatePattern}
          />
        );
      case "fixture":
        return (
          <FixtureStep
            fixture={parameters.fixture}
            context={parameters.context}
            onChange={updateFixture}
          />
        );
      case "check":
        return (
          <CheckStep
            shape={parameters.shape}
            light={parameters.light}
            pattern={parameters.pattern}
            fixture={parameters.fixture}
            templateId={parameters.templateId}
            archetype={parameters.archetype}
          />
        );
      case "reveal":
        return (
          <RevealStep
            context={parameters.context}
            shape={parameters.shape}
            light={parameters.light}
            patternId={parameters.pattern.presetId}
          />
        );
      case "export":
        return (
          <ExportStep
            parameters={parameters}
            designName={`${parameters.templateId}-lamp`}
          />
        );
    }
  }

  // The start screen IS the gallery: the 3D workshop only makes sense
  // once a lamp exists to work on.
  if (currentStep === "start") {
    return (
      <div className="flex h-[calc(100vh-64px)] bg-parchment">
        <aside className="w-56 shrink-0 border-r border-wood/10 bg-cream/50 overflow-y-auto">
          <StepNav
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-10">
            <StartStep selectedId={presetId} onSelect={selectPreset} />
          </div>
        </main>
      </div>
    );
  }

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
        <LampSceneDynamic parameters={parameters} />
      </main>

      {/* Right: Controls Panel */}
      <aside className="w-80 shrink-0 border-l border-wood/10 bg-cream/50 overflow-y-auto flex flex-col">
        <div className="p-6 flex-1">{renderStep()}</div>

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
            className="px-4 py-2 text-sm rounded-lg bg-forest text-cream hover:bg-forest/90 transition-colors ml-auto disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </aside>
    </div>
  );
}
