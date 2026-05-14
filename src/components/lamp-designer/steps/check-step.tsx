"use client";

import type { ShapeParameters, LightParameters, PatternId } from "@/lib/lamp-designer/types";
import { runAllChecks } from "@/lib/lamp-designer/checks";
import type { CheckSection, CheckItem } from "@/lib/lamp-designer/checks";

export interface CheckStepProps {
  shape: ShapeParameters;
  light: LightParameters;
  patternId: PatternId;
}

function severityColor(item: CheckItem): string {
  if (!item.ok && item.severity === "error") return "text-red-600";
  if (!item.ok && item.severity === "warn") return "text-amber-600";
  return "text-wood/70";
}

function severityIcon(item: CheckItem): string {
  if (!item.ok && item.severity === "error") return "\u2718";
  if (!item.ok && item.severity === "warn") return "\u26A0";
  if (item.hint === "Recommended") return "\u2605";
  return "\u2714";
}

function Section({ section }: { section: CheckSection }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-wood mb-2">{section.title}</h3>
      <div className="flex flex-col gap-1.5">
        {section.items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-2 text-sm"
          >
            <span className={`shrink-0 w-5 text-center ${severityColor(item)}`}>
              {severityIcon(item)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2">
                <span className="font-medium text-wood">{item.label}</span>
                <span className="text-wood/60 text-right shrink-0 tabular-nums">
                  {item.value}
                </span>
              </div>
              {item.hint && (
                <p className={`text-xs mt-0.5 ${severityColor(item)}`}>
                  {item.hint}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CheckStep({ shape, light, patternId }: CheckStepProps) {
  const sections = runAllChecks(shape, light, patternId);
  const hasErrors = sections.some((s) =>
    s.items.some((i) => !i.ok && i.severity === "error")
  );

  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">
        Pre-flight check
      </h2>
      <p className="text-sm text-wood/60 mb-5">
        Review dimensions, bulb fit, print settings, and material before
        exporting.
      </p>

      <div className="flex flex-col gap-5">
        {sections.map((section) => (
          <Section key={section.title} section={section} />
        ))}
      </div>

      {hasErrors && (
        <div className="mt-5 p-3 rounded-xl border-2 border-red-200 bg-red-50 text-sm text-red-700">
          Some checks failed — go back and adjust your design before exporting.
        </div>
      )}
    </div>
  );
}
