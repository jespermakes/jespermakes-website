"use client";

import type {
  LampParameters,
  ExportFormat,
} from "@/lib/lamp-designer/types";
import { getFixtureModule } from "@/lib/lamp-designer/fixtures";

export interface ExportStepProps {
  parameters: LampParameters;
  designName: string;
}

export const EXPORT_OFF_NOTE =
  "Downloads are switched off for now. I ran 210 lamps from this designer through the slicer and only 3 of them came out clean, and that isn't good enough to hand you as a print file. I'm rebuilding it from the lamps I've actually printed on my H2D. You can still play with shapes and light here in the meantime.";

export function fileNameForDesign(name: string, format: ExportFormat): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "lamp"}.${format}`;
}

export function ExportStep({ parameters, designName }: ExportStepProps) {
  const fixtureModule = getFixtureModule(parameters.fixture.moduleId);

  // Downloads are off (DR-301): 3 of 210 exports sliced clean in the 9 Oct
  // audit. The printed-lamps page replaces them; the old exporters stay in
  // src/lib/lamp-designer for the audit tools.
  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">Your lamp</h2>
      <div className="mt-3 p-3 rounded-xl border-2 border-wood/15 bg-wood/[0.03]">
        <p className="text-sm text-wood/80 leading-relaxed">
          {EXPORT_OFF_NOTE}
        </p>
      </div>

      {/* Hardware guide */}
      <div className="mt-6 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-wood">Make it real</h3>
        <p className="text-xs text-wood/50">
          You buy: {fixtureModule.hardware}
        </p>
        <ol className="flex flex-col gap-1.5 list-decimal list-inside">
          {fixtureModule.assembly.map((step) => (
            <li key={step} className="text-xs text-wood/70 leading-snug">
              {step}
            </li>
          ))}
        </ol>
        <p className="text-xs font-medium text-amber-700/90">
          LED bulbs only. Never incandescent or halogen in a printed shade.
        </p>
      </div>

      {/* Design summary */}
      <div className="mt-6 p-3 rounded-xl bg-wood/5">
        <h3 className="text-xs font-semibold text-wood/50 uppercase tracking-wide mb-2">
          Design summary
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-wood/60">Name</span>
          <span className="text-wood font-medium">{designName}</span>
          <span className="text-wood/60">Context</span>
          <span className="text-wood font-medium">{parameters.context}</span>
          <span className="text-wood/60">Fixture</span>
          <span className="text-wood font-medium">
            {getFixtureModule(parameters.fixture.moduleId).name}
          </span>
          <span className="text-wood/60">Form</span>
          <span className="text-wood font-medium">
            {parameters.archetype === "moon" ? "moon" : parameters.templateId}
          </span>
          <span className="text-wood/60">Pattern</span>
          <span className="text-wood font-medium">{parameters.pattern.presetId.replace("-", " ")}</span>
          <span className="text-wood/60">Height</span>
          <span className="text-wood font-medium tabular-nums">{parameters.shape.height} mm</span>
        </div>
      </div>
    </div>
  );
}
