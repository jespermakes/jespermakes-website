"use client";

import type { StepId } from "@/lib/lamp-designer/types";
import { STEP_IDS } from "@/lib/lamp-designer/types";

interface StepNavProps {
  currentStep: StepId;
  completedSteps: StepId[];
  onStepClick?: (step: StepId) => void;
}

const STEP_META: Record<StepId, { label: string; icon: React.ReactNode }> = {
  context: {
    label: "Context",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  form: {
    label: "Form",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  shape: {
    label: "Shape",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M12 3v18" />
        <path d="M5 8l7-5 7 5" />
        <path d="M5 16l7 5 7-5" />
      </svg>
    ),
  },
  light: {
    label: "Light",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        <circle cx="12" cy="12" r="5" />
      </svg>
    ),
  },
  pattern: {
    label: "Pattern",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  check: {
    label: "Check",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h11" />
      </svg>
    ),
  },
  reveal: {
    label: "Reveal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  export: {
    label: "Export",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
};

export function StepNav({ currentStep, completedSteps, onStepClick }: StepNavProps) {
  return (
    <nav aria-label="Design steps" className="flex flex-col gap-1 py-4">
      {STEP_IDS.map((stepId, index) => {
        const meta = STEP_META[stepId];
        const isCurrent = stepId === currentStep;
        const isCompleted = completedSteps.includes(stepId);
        const isClickable = isCompleted || isCurrent;

        return (
          <button
            key={stepId}
            type="button"
            onClick={() => isClickable && onStepClick?.(stepId)}
            disabled={!isClickable}
            aria-current={isCurrent ? "step" : undefined}
            className={[
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
              isCurrent
                ? "bg-forest/10 text-forest font-medium"
                : isCompleted
                  ? "text-wood hover:bg-cream/50 cursor-pointer"
                  : "text-wood/30 cursor-not-allowed",
            ].join(" ")}
          >
            <span
              className={[
                "flex items-center justify-center w-7 h-7 rounded-full shrink-0 border",
                isCurrent
                  ? "border-forest bg-forest text-cream"
                  : isCompleted
                    ? "border-forest/40 text-forest"
                    : "border-wood/20 text-wood/30",
              ].join(" ")}
            >
              {isCompleted && !isCurrent ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </span>
            <span className="leading-tight">{meta.label}</span>
            <span className="ml-auto opacity-60">{meta.icon}</span>
          </button>
        );
      })}
    </nav>
  );
}
