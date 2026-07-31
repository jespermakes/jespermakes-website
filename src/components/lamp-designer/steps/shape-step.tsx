"use client";

import { useMemo } from "react";
import type {
  ArchetypeId,
  ShapeParameters,
  ConstraintSeverity,
  FixtureSpec,
  TemplateId,
} from "@/lib/lamp-designer/types";
import { MOON_MIN_DIAMETER, MOON_MAX_DIAMETER } from "@/lib/lamp-designer/build";
import { runAllConstraints } from "@/lib/lamp-designer/constraints";
import type { ConstraintContext } from "@/lib/lamp-designer/constraints";
import { SLIDER_CONSTRAINTS, worstSeverity } from "@/lib/lamp-designer/constraint-display";
import { applySliderResistance } from "@/lib/lamp-designer/soft-resistance";
import { getMountInterface } from "@/lib/lamp-designer/fixtures";

export interface ShapeStepProps {
  shape: ShapeParameters;
  fixture: FixtureSpec;
  templateId: TemplateId;
  archetype: ArchetypeId;
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

const SEVERITY_STYLES: Record<ConstraintSeverity, { dot: string; text: string; bg: string }> = {
  info: { dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50" },
  warn: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  error: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
};

function formatValue(value: number, unit: string): string {
  if (!unit) return value.toFixed(2);
  if (unit === "mm" && value % 1 !== 0) return `${value.toFixed(1)} ${unit}`;
  return `${value} ${unit}`;
}

export function ShapeStep({ shape, fixture, templateId, archetype, onChange }: ShapeStepProps) {
  const ctx = useMemo<ConstraintContext>(
    () => ({ fixture, templateId, archetype }),
    [fixture, templateId, archetype]
  );
  const results = useMemo(() => runAllConstraints(shape, ctx), [shape, ctx]);
  // The chosen fixture sets the floor for the top opening: the crown land
  // must fit inside it.
  const minTopDiameter = useMemo(
    () => Math.ceil(getMountInterface(fixture.moduleId).crownMinRadius * 2),
    [fixture.moduleId]
  );

  const issues = useMemo(() => {
    return Object.values(results).filter(
      (c) => c.severity === "warn" || c.severity === "error"
    );
  }, [results]);

  if (archetype === "moon") {
    return (
      <div>
        <h2 className="text-lg font-semibold text-wood mb-1">Size the moon</h2>
        <p className="text-sm text-wood/60 mb-5">
          One decision here: how big. The surface itself is real lunar
          elevation data, and the crown is built to your fixture.
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="flex justify-between text-sm text-wood">
            <span className="font-medium">Diameter</span>
            <span className="tabular-nums text-wood/60">{Math.min(MOON_MAX_DIAMETER, Math.max(MOON_MIN_DIAMETER, shape.bottomDiameter))} mm</span>
          </span>
          <input
            type="range"
            min={MOON_MIN_DIAMETER}
            max={MOON_MAX_DIAMETER}
            step={1}
            value={Math.min(MOON_MAX_DIAMETER, Math.max(MOON_MIN_DIAMETER, shape.bottomDiameter))}
            onChange={(e) => onChange({ ...shape, bottomDiameter: parseFloat(e.target.value) })}
            className="w-full accent-forest"
            aria-label="Moon diameter"
          />
        </label>
        <p className="mt-4 text-xs text-wood/50 leading-snug">
          150 mm is the classic moon lamp size. Print time grows fast with
          diameter: the wall is solid and the layers are fine.
        </p>
      </div>
    );
  }

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
        {SLIDERS.map(({ key, label, min, max, step, unit }) => {
          const related = SLIDER_CONSTRAINTS[key]
            .map((id) => results[id])
            .filter(Boolean);
          const severity = worstSeverity(related);
          const effectiveMin = key === "topDiameter" ? Math.max(min, minTopDiameter) : min;

          return (
            <label key={key} className="flex flex-col gap-1.5">
              <span className="flex justify-between text-sm text-wood">
                <span className="font-medium flex items-center gap-1.5">
                  {label}
                  {severity && severity !== "info" && (
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${SEVERITY_STYLES[severity].dot}`}
                      role="img"
                      aria-label={`${severity} indicator`}
                    />
                  )}
                </span>
                <span className="tabular-nums text-wood/60">
                  {formatValue(shape[key], unit)}
                </span>
              </span>
              <input
                type="range"
                min={effectiveMin}
                max={max}
                step={step}
                value={Math.max(shape[key], effectiveMin)}
                onChange={(e) => {
                  const raw = Math.max(parseFloat(e.target.value), effectiveMin);
                  const adjusted = applySliderResistance(shape, key, raw, step, ctx);
                  onChange({ ...shape, [key]: Math.max(adjusted, effectiveMin) });
                }}
                className="w-full accent-forest"
                aria-label={label}
              />
            </label>
          );
        })}
      </div>

      {issues.length > 0 && (
        <div className="mt-5 flex flex-col gap-2" role="alert">
          {issues.map((issue, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${SEVERITY_STYLES[issue.severity].bg} ${SEVERITY_STYLES[issue.severity].text}`}
            >
              <span
                className={`mt-0.5 inline-block w-2 h-2 shrink-0 rounded-full ${SEVERITY_STYLES[issue.severity].dot}`}
              />
              {issue.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
