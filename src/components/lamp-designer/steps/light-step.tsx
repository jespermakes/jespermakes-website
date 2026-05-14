"use client";

import type { LightParameters, LightDirection } from "@/lib/lamp-designer/types";

export interface LightStepProps {
  light: LightParameters;
  onChange: (light: LightParameters) => void;
}

interface DirectionOption {
  value: LightDirection;
  label: string;
  description: string;
}

const DIRECTIONS: DirectionOption[] = [
  {
    value: "down",
    label: "Downward",
    description: "Focuses light on the surface below — best for tasks and dining",
  },
  {
    value: "up",
    label: "Upward",
    description: "Bounces light off the ceiling for a soft, indirect glow",
  },
  {
    value: "ambient",
    label: "Ambient",
    description: "Spreads light evenly in all directions through the shade walls",
  },
];

function warmthLabel(kelvin: number): string {
  if (kelvin <= 2400) return "Candlelight — very warm and cozy";
  if (kelvin <= 2900) return "Warm white — relaxed and inviting";
  if (kelvin <= 3500) return "Neutral — balanced everyday light";
  if (kelvin <= 4500) return "Cool white — crisp and focused";
  return "Daylight — bright and energizing";
}

function spreadLabel(angle: number): string {
  if (angle <= 25) return "Narrow spot — highlights a small area";
  if (angle <= 45) return "Focused — good for reading and task work";
  if (angle <= 80) return "Medium — lights the table without spilling far";
  if (angle <= 120) return "Wide — fills most of the room";
  return "Extra wide — even light everywhere";
}

export function LightStep({ light, onChange }: LightStepProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">
        Set the light character
      </h2>
      <p className="text-sm text-wood/60 mb-5">
        Choose how warm, how wide, and which way the light goes. The preview
        updates as you adjust.
      </p>

      <div className="flex flex-col gap-6">
        {/* Direction */}
        <fieldset>
          <legend className="text-sm font-medium text-wood mb-2">
            Direction
          </legend>
          <div className="flex flex-col gap-2">
            {DIRECTIONS.map((opt) => {
              const isSelected = light.direction === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    onChange({ ...light, direction: opt.value })
                  }
                  aria-pressed={isSelected}
                  className={[
                    "text-left px-4 py-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-forest bg-forest/5 text-forest"
                      : "border-wood/15 bg-white hover:border-wood/30 text-wood/70 hover:text-wood",
                  ].join(" ")}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="block text-xs mt-0.5 opacity-70">
                    {opt.description}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Warmth (color temperature) */}
        <label className="flex flex-col gap-1.5">
          <span className="flex justify-between text-sm text-wood">
            <span className="font-medium">Warmth</span>
            <span className="tabular-nums text-wood/60">
              {light.colorTemperature} K
            </span>
          </span>
          <input
            type="range"
            min={2000}
            max={5000}
            step={100}
            value={light.colorTemperature}
            onChange={(e) =>
              onChange({
                ...light,
                colorTemperature: parseInt(e.target.value, 10),
              })
            }
            className="w-full accent-forest"
            aria-label="Warmth"
          />
          <span className="text-xs text-wood/50">
            {warmthLabel(light.colorTemperature)}
          </span>
        </label>

        {/* Spread (beam angle) */}
        <label className="flex flex-col gap-1.5">
          <span className="flex justify-between text-sm text-wood">
            <span className="font-medium">Spread</span>
            <span className="tabular-nums text-wood/60">
              {light.beamAngle}&deg;
            </span>
          </span>
          <input
            type="range"
            min={15}
            max={150}
            step={5}
            value={light.beamAngle}
            onChange={(e) =>
              onChange({
                ...light,
                beamAngle: parseInt(e.target.value, 10),
              })
            }
            className="w-full accent-forest"
            aria-label="Spread"
          />
          <span className="text-xs text-wood/50">
            {spreadLabel(light.beamAngle)}
          </span>
        </label>
      </div>
    </div>
  );
}
