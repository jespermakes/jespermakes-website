"use client";

import type { ShapeParameters } from "@/lib/lamp-designer/types";

export interface ShapeStepProps {
  shape: ShapeParameters;
  onChange: (shape: ShapeParameters) => void;
}

interface SliderConfig {
  key: keyof ShapeParameters;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const SLIDERS: SliderConfig[] = [
  { key: "height", label: "Height", min: 60, max: 400, step: 1, unit: "mm" },
  { key: "topDiameter", label: "Top diameter", min: 10, max: 300, step: 1, unit: "mm" },
  { key: "bottomDiameter", label: "Bottom diameter", min: 10, max: 300, step: 1, unit: "mm" },
  { key: "curveTension", label: "Curve tension", min: 0, max: 1, step: 0.01, unit: "" },
  { key: "wallThickness", label: "Wall thickness", min: 1, max: 6, step: 0.1, unit: "mm" },
];

function formatValue(value: number, unit: string): string {
  if (!unit) return value.toFixed(2);
  if (unit === "mm" && value % 1 !== 0) return `${value.toFixed(1)} ${unit}`;
  return `${value} ${unit}`;
}

export function ShapeStep({ shape, onChange }: ShapeStepProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">
        Adjust the shape
      </h2>
      <p className="text-sm text-wood/60 mb-5">
        Drag the sliders to fine-tune proportions. The 3D preview updates in
        real time.
      </p>

      <div className="flex flex-col gap-5">
        {SLIDERS.map(({ key, label, min, max, step, unit }) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className="flex justify-between text-sm text-wood">
              <span className="font-medium">{label}</span>
              <span className="tabular-nums text-wood/60">
                {formatValue(shape[key], unit)}
              </span>
            </span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={shape[key]}
              onChange={(e) =>
                onChange({ ...shape, [key]: parseFloat(e.target.value) })
              }
              className="w-full accent-forest"
              aria-label={label}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
