"use client";

import type { PatternId } from "@/lib/lamp-designer/types";
import { PATTERNS } from "@/lib/lamp-designer/patterns";

export interface PatternStepProps {
  selected: PatternId | null;
  onSelect: (patternId: PatternId) => void;
}

const PATTERN_ICONS: Record<PatternId, React.ReactNode> = {
  smooth: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <circle cx="24" cy="24" r="14" />
    </svg>
  ),
  "vertical-lines": (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <line x1="16" y1="10" x2="16" y2="38" />
      <line x1="24" y1="10" x2="24" y2="38" />
      <line x1="32" y1="10" x2="32" y2="38" />
    </svg>
  ),
  "horizontal-rings": (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <line x1="10" y1="16" x2="38" y2="16" />
      <line x1="10" y1="24" x2="38" y2="24" />
      <line x1="10" y1="32" x2="38" y2="32" />
    </svg>
  ),
  "diamond-grid": (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M24 10l10 14-10 14-10-14z" />
      <line x1="14" y1="24" x2="34" y2="24" />
      <line x1="24" y1="10" x2="24" y2="38" />
    </svg>
  ),
  hexagonal: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M24 10l12 7v14l-12 7-12-7V17z" />
    </svg>
  ),
  organic: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M16 14c4 2 8-2 12 0s4 8 2 12-8 4-12 2-4-8-2-12z" />
    </svg>
  ),
};

export function PatternStep({ selected, onSelect }: PatternStepProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">
        Choose a surface pattern
      </h2>
      <p className="text-sm text-wood/60 mb-5">
        Select a texture for the lamp shade. This affects both the look and how
        light filters through.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {PATTERNS.map((pattern) => {
          const isSelected = selected === pattern.id;
          return (
            <button
              key={pattern.id}
              type="button"
              onClick={() => onSelect(pattern.id)}
              aria-pressed={isSelected}
              className={[
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                isSelected
                  ? "border-forest bg-forest/5 text-forest"
                  : "border-wood/15 bg-white hover:border-wood/30 text-wood/70 hover:text-wood",
              ].join(" ")}
            >
              <span className={isSelected ? "text-forest" : "text-wood/50"}>
                {PATTERN_ICONS[pattern.id]}
              </span>
              <span className="text-sm font-medium leading-tight">
                {pattern.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
