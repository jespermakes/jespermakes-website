"use client";

import { useState } from "react";
import type {
  LampParameters,
  ExportFormat,
} from "@/lib/lamp-designer/types";
import { getFixtureModule } from "@/lib/lamp-designer/fixtures";

export interface ExportStepProps {
  parameters: LampParameters;
  designName: string;
}

export type ExportStatus = "idle" | "preparing" | "ready" | "error";

const FORMAT_META: Record<
  ExportFormat,
  { label: string; description: string; available: boolean }
> = {
  "3mf": {
    label: "3MF",
    description: "Recommended — opens directly in Bambu Studio, watertight and welded",
    available: true,
  },
  stl: {
    label: "STL",
    description: "Universal mesh format — works with any slicer",
    available: true,
  },
};

const MAKERWORLD_URL = "https://makerworld.com/en/upload" as const;

export function fileNameForDesign(name: string, format: ExportFormat): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "lamp"}.${format}`;
}

export function ExportStep({ parameters, designName }: ExportStepProps) {
  const [exportStatus, setExportStatus] = useState<Record<ExportFormat, ExportStatus>>({
    stl: "idle",
    "3mf": "idle",
  });
  const fixtureModule = getFixtureModule(parameters.fixture.moduleId);

  async function handleDownload(format: ExportFormat) {
    if (!FORMAT_META[format].available) return;
    setExportStatus((prev) => ({ ...prev, [format]: "preparing" }));
    try {
      if (parameters.archetype === "moon") {
        const { loadMoonHeightField } = await import("@/lib/lamp-designer/moonfield");
        await loadMoonHeightField();
      }
      let blob: Blob;
      if (format === "3mf") {
        const { lampTo3mfBlob } = await import("@/lib/lamp-designer/export-3mf");
        blob = lampTo3mfBlob(parameters, designName);
      } else {
        const { lampToStlBlob } = await import("@/lib/lamp-designer/export");
        blob = lampToStlBlob(parameters);
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileNameForDesign(designName, format);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setExportStatus((prev) => ({ ...prev, [format]: "ready" }));
    } catch (err) {
      console.error("Lamp export failed:", err);
      setExportStatus((prev) => ({ ...prev, [format]: "error" }));
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">Export your lamp</h2>
      <p className="text-sm text-wood/60 mb-5">
        Download a print-ready file, then share your design with the community.
      </p>

      {/* Download section */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-wood">Download</h3>
        {(Object.keys(FORMAT_META) as ExportFormat[]).map((format) => {
          const meta = FORMAT_META[format];
          const status = exportStatus[format];
          return (
            <button
              key={format}
              type="button"
              disabled={status === "preparing" || !meta.available}
              onClick={() => handleDownload(format)}
              aria-label={`Download ${meta.label} file`}
              className={[
                "flex items-center justify-between w-full p-3 rounded-xl border-2 text-left transition-colors",
                !meta.available
                  ? "border-wood/10 bg-wood/[0.03] cursor-not-allowed opacity-60"
                  : status === "preparing"
                    ? "border-wood/20 bg-wood/5 cursor-wait"
                    : status === "ready"
                      ? "border-forest/30 bg-forest/5 hover:bg-forest/10"
                      : status === "error"
                        ? "border-red-300 bg-red-50 hover:bg-red-100"
                        : "border-wood/15 bg-white hover:border-forest/30 hover:bg-forest/5",
              ].join(" ")}
            >
              <div>
                <span className="text-sm font-medium text-wood">{meta.label}</span>
                <span className="block text-xs text-wood/50 mt-0.5">{meta.description}</span>
              </div>
              <span className="text-xs font-medium text-wood/60 shrink-0 ml-3">
                {!meta.available
                  ? "Soon"
                  : status === "preparing"
                    ? "Preparing…"
                    : status === "ready"
                      ? "✓ Downloaded"
                      : status === "error"
                        ? "Failed — try again"
                        : "Download"}
              </span>
            </button>
          );
        })}
        <p className="text-xs text-wood/40">
          Millimeters, ready to slice. The fixture mount crown and the
          surface pattern are part of the exported shell — what you see is
          what prints.
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

      {/* Share section */}
      <div className="mt-6 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-wood">Share</h3>
        <a
          href={MAKERWORLD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border-2 border-forest bg-forest text-sm font-medium text-white hover:bg-forest/90 transition-colors"
          aria-label="Upload to MakerWorld"
        >
          Upload to MakerWorld
          <span className="text-white/60" aria-hidden="true">{"↗"}</span>
        </a>
        <p className="text-xs text-wood/40">
          Opens MakerWorld&apos;s upload page. Attach the STL you just
          downloaded.
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
