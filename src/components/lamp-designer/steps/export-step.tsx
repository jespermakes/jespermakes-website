"use client";

import { useState } from "react";
import type {
  LampParameters,
  ExportFormat,
} from "@/lib/lamp-designer/types";

export interface ExportStepProps {
  parameters: LampParameters;
  designName: string;
}

export type ExportStatus = "idle" | "preparing" | "ready" | "error";

const FORMAT_META: Record<ExportFormat, { label: string; description: string }> = {
  stl: { label: "STL", description: "Universal mesh format — works with any slicer" },
  "3mf": { label: "3MF", description: "Rich format with color and metadata" },
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
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "published" | "error">("idle");

  function handleDownload(format: ExportFormat) {
    setExportStatus((prev) => ({ ...prev, [format]: "preparing" }));

    // Placeholder: in a real implementation this would call the geometry
    // pipeline to generate the mesh and trigger a browser download.
    setTimeout(() => {
      setExportStatus((prev) => ({ ...prev, [format]: "ready" }));
    }, 1200);
  }

  function handlePublish() {
    setPublishStatus("publishing");

    // Placeholder: would POST the design to the marketplace API.
    setTimeout(() => {
      setPublishStatus("published");
    }, 1500);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">Export your lamp</h2>
      <p className="text-sm text-wood/60 mb-5">
        Download print-ready files or share your design with the community.
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
              disabled={status === "preparing"}
              onClick={() => handleDownload(format)}
              aria-label={`Download ${meta.label} file`}
              className={[
                "flex items-center justify-between w-full p-3 rounded-xl border-2 text-left transition-colors",
                status === "preparing"
                  ? "border-wood/20 bg-wood/5 cursor-wait"
                  : status === "ready"
                    ? "border-forest/30 bg-forest/5 hover:bg-forest/10"
                    : "border-wood/15 bg-white hover:border-forest/30 hover:bg-forest/5",
              ].join(" ")}
            >
              <div>
                <span className="text-sm font-medium text-wood">{meta.label}</span>
                <span className="block text-xs text-wood/50 mt-0.5">{meta.description}</span>
              </div>
              <span className="text-xs font-medium text-wood/60 shrink-0 ml-3">
                {status === "preparing"
                  ? "Preparing\u2026"
                  : status === "ready"
                    ? "\u2713 Ready"
                    : "Download"}
              </span>
            </button>
          );
        })}
        <p className="text-xs text-wood/40">
          File: {fileNameForDesign(designName, "stl")}
        </p>
      </div>

      {/* Publish section */}
      <div className="mt-6 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-wood">Share</h3>
        <button
          type="button"
          disabled={publishStatus === "publishing" || publishStatus === "published"}
          onClick={handlePublish}
          aria-label="Publish to marketplace"
          className={[
            "w-full p-3 rounded-xl border-2 text-sm font-medium transition-colors",
            publishStatus === "published"
              ? "border-forest/30 bg-forest/10 text-forest cursor-default"
              : publishStatus === "publishing"
                ? "border-wood/20 bg-wood/5 text-wood/60 cursor-wait"
                : "border-forest bg-forest text-white hover:bg-forest/90",
          ].join(" ")}
        >
          {publishStatus === "publishing"
            ? "Publishing\u2026"
            : publishStatus === "published"
              ? "\u2713 Published to marketplace"
              : "Publish to marketplace"}
        </button>

        <a
          href={MAKERWORLD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border-2 border-wood/15 bg-white text-sm font-medium text-wood hover:border-forest/30 hover:bg-forest/5 transition-colors"
          aria-label="Upload to MakerWorld"
        >
          Upload to MakerWorld
          <span className="text-wood/40" aria-hidden="true">{"\u2197"}</span>
        </a>
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
          <span className="text-wood/60">Template</span>
          <span className="text-wood font-medium">{parameters.templateId}</span>
          <span className="text-wood/60">Pattern</span>
          <span className="text-wood font-medium">{parameters.patternId.replace("-", " ")}</span>
          <span className="text-wood/60">Height</span>
          <span className="text-wood font-medium tabular-nums">{parameters.shape.height} mm</span>
        </div>
      </div>
    </div>
  );
}
