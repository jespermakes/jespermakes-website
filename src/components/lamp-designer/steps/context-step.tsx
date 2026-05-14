"use client";

import type { LampContext } from "@/lib/lamp-designer/types";
import { CONTEXT_META } from "@/lib/lamp-designer/context-constraints";

export { getContextConstraints } from "@/lib/lamp-designer/context-constraints";

export interface ContextStepProps {
  selected: LampContext | null;
  onSelect: (context: LampContext) => void;
}

const CONTEXT_ICONS: Record<LampContext, React.ReactNode> = {
  bedside: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="10" y="28" width="28" height="14" rx="2" />
      <path d="M18 28V18a6 6 0 0 1 12 0v10" />
      <path d="M24 8v-4" />
      <path d="M16 12l-2-2" />
      <path d="M32 12l2-2" />
    </svg>
  ),
  dining: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M14 8h20l-4 16H18L14 8z" />
      <line x1="24" y1="4" x2="24" y2="8" />
      <line x1="18" y1="24" x2="18" y2="28" />
      <line x1="30" y1="24" x2="30" y2="28" />
      <rect x="12" y="28" width="24" height="4" rx="1" />
    </svg>
  ),
  reading: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M14 38c0-6 4-10 10-10s10 4 10 10" />
      <path d="M18 28l-4-16h20l-4 16" />
      <circle cx="24" cy="16" r="2" />
    </svg>
  ),
  hallway: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="16" y="8" width="16" height="32" rx="2" />
      <circle cx="24" cy="24" r="4" />
      <path d="M20 24h-4" />
      <path d="M32 24h-4" />
      <path d="M24 20v-4" />
      <path d="M24 32v-4" />
    </svg>
  ),
  desk: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="10" y="34" width="28" height="4" rx="1" />
      <path d="M20 34V20" />
      <path d="M20 20l12-6" />
      <path d="M26 14l6 4v6" />
    </svg>
  ),
  shelf: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <line x1="8" y1="16" x2="40" y2="16" />
      <line x1="8" y1="32" x2="40" y2="32" />
      <path d="M20 32v-8l4-4 4 4v8" />
      <circle cx="24" cy="24" r="1" />
    </svg>
  ),
};

export function ContextStep({ selected, onSelect }: ContextStepProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">
        Where will this lamp live?
      </h2>
      <p className="text-sm text-wood/60 mb-5">
        Pick a setting so we can suggest the right proportions and light
        direction.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {CONTEXT_META.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              aria-pressed={isSelected}
              className={[
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                isSelected
                  ? "border-forest bg-forest/5 text-forest"
                  : "border-wood/15 bg-white hover:border-wood/30 text-wood/70 hover:text-wood",
              ].join(" ")}
            >
              <span className={isSelected ? "text-forest" : "text-wood/50"}>
                {CONTEXT_ICONS[option.id]}
              </span>
              <span className="text-sm font-medium leading-tight">
                {option.label}
              </span>
              <span className="text-xs leading-snug opacity-70">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
