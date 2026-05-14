"use client";

export type Step = "design" | "parts" | "export";

const STEPS: { key: Step; label: string }[] = [
  { key: "design", label: "Design" },
  { key: "parts", label: "Parts" },
  { key: "export", label: "Export" },
];

interface MobileStepNavProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
}

export function MobileStepNav({ currentStep, onStepChange }: MobileStepNavProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <nav className="md:hidden flex items-center bg-white border-b border-wood/[0.08] px-3 py-2 gap-1" aria-label="Design steps">
      {STEPS.map((step, i) => {
        const isActive = step.key === currentStep;
        const isPast = i < currentIndex;
        return (
          <button
            key={step.key}
            type="button"
            onClick={() => onStepChange(step.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold transition-colors ${
              isActive
                ? "bg-forest/10 text-forest"
                : isPast
                  ? "text-forest/60"
                  : "text-wood-light/40"
            }`}
            aria-current={isActive ? "step" : undefined}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                isActive
                  ? "bg-forest text-cream"
                  : isPast
                    ? "bg-forest/20 text-forest"
                    : "bg-wood/[0.06] text-wood-light/40"
              }`}
            >
              {isPast ? (
                <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden>
                  <path d="M2 6l3 3 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}
