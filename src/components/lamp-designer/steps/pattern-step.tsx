"use client";

import type { PatternId, PatternParams } from "@/lib/lamp-designer/types";
import {
  PATTERNS,
  MIN_PATTERN_INTENSITY,
  MAX_PATTERN_INTENSITY,
} from "@/lib/lamp-designer/patterns";

export interface PatternStepProps {
  pattern: PatternParams;
  onChange: (pattern: PatternParams) => void;
}

const PATTERN_ICONS: Record<PatternId, React.ReactNode> = {
  smooth: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <circle cx="24" cy="24" r="14" />
    </svg>
  ),
  "fine-ribs": (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <line x1="12" y1="10" x2="12" y2="38" />
      <line x1="18" y1="10" x2="18" y2="38" />
      <line x1="24" y1="10" x2="24" y2="38" />
      <line x1="30" y1="10" x2="30" y2="38" />
      <line x1="36" y1="10" x2="36" y2="38" />
    </svg>
  ),
  "bold-waves": (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M10 10c4 0 4 4 8 4s4-4 8-4 4 4 8 4" />
      <path d="M10 24c4 0 4 4 8 4s4-4 8-4 4 4 8 4" />
      <path d="M10 38c4 0 4-4 8-4s4 4 8 4 4-4 8-4" />
    </svg>
  ),
  "spiral-twist": (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M14 8c8 8 -4 16 4 24s12 0 16 8" />
      <path d="M24 8c8 8 -4 16 4 24" />
    </svg>
  ),
  "wavy-bands": (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M12 14h24" />
      <path d="M10 22c6 4 22 4 28 0" />
      <path d="M10 30c6 -4 22 -4 28 0" />
      <path d="M12 38h24" />
    </svg>
  ),
};

export function PatternStep({ pattern, onChange }: PatternStepProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">
        Choose a surface pattern
      </h2>
      <p className="text-sm text-wood/60 mb-5">
        The pattern is real geometry: what you see here is exactly what
        prints. Depths self-limit to stay printable.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {PATTERNS.map((preset) => {
          const isSelected = pattern.presetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange({ ...pattern, presetId: preset.id })}
              aria-pressed={isSelected}
              title={preset.description}
              className={[
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                isSelected
                  ? "border-forest bg-forest/5 text-forest"
                  : "border-wood/15 bg-white hover:border-wood/30 text-wood/70 hover:text-wood",
              ].join(" ")}
            >
              <span className={isSelected ? "text-forest" : "text-wood/50"}>
                {PATTERN_ICONS[preset.id]}
              </span>
              <span className="text-sm font-medium leading-tight">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>

      {pattern.presetId !== "smooth" && (
        <label className="mt-5 flex flex-col gap-1.5">
          <span className="flex justify-between text-sm text-wood">
            <span className="font-medium">Depth</span>
            <span className="tabular-nums text-wood/60">
              {Math.round(pattern.intensity * 100)} %
            </span>
          </span>
          <input
            type="range"
            min={MIN_PATTERN_INTENSITY}
            max={MAX_PATTERN_INTENSITY}
            step={0.05}
            value={pattern.intensity}
            onChange={(e) =>
              onChange({ ...pattern, intensity: parseFloat(e.target.value) })
            }
            className="w-full accent-forest"
            aria-label="Pattern depth"
          />
        </label>
      )}
    </div>
  );
}
