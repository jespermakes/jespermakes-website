"use client";

import { useState, useCallback } from "react";
import type { BufferGeometry } from "three";
import { downloadSTL } from "@/lib/lamp-designer/export-stl";
import { download3MF } from "@/lib/lamp-designer/export-3mf";
import { downloadPrintSettings } from "@/lib/lamp-designer/print-settings-card";

interface ExportStepProps {
  geometry: BufferGeometry | null;
  designName?: string;
}

export default function ExportStep({ geometry, designName = "lamp" }: ExportStepProps) {
  const [exporting, setExporting] = useState<"stl" | "3mf" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sanitizedName = designName.replace(/[^a-zA-Z0-9_-]/g, "_") || "lamp";

  const handleDownloadSTL = useCallback(() => {
    if (!geometry) return;
    setError(null);
    setExporting("stl");
    try {
      downloadSTL(geometry, `${sanitizedName}.stl`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export STL");
    } finally {
      setExporting(null);
    }
  }, [geometry, sanitizedName]);

  const handleDownload3MF = useCallback(() => {
    if (!geometry) return;
    setError(null);
    setExporting("3mf");
    try {
      download3MF(geometry, `${sanitizedName}.3mf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export 3MF");
    } finally {
      setExporting(null);
    }
  }, [geometry, sanitizedName]);

  const handleDownloadSettings = useCallback(() => {
    downloadPrintSettings(
      { designName: sanitizedName },
      `${sanitizedName}-print-settings.txt`,
    );
  }, [sanitizedName]);

  const disabled = !geometry;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-2">
          Export your lamp
        </div>
        <p className="text-[14px] text-wood-light/70 leading-relaxed m-0">
          Download your design as a 3D file ready for slicing and printing.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleDownloadSTL}
          disabled={disabled || exporting === "stl"}
          className="bg-wood text-cream rounded-2xl py-4 px-5 text-[15px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting === "stl" ? "Exporting..." : "Download STL"}
        </button>
        <button
          onClick={handleDownload3MF}
          disabled={disabled || exporting === "3mf"}
          className="bg-transparent text-wood-light border border-wood/[0.18] rounded-2xl py-3.5 px-5 text-[13px] font-medium cursor-pointer hover:border-wood/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting === "3mf" ? "Exporting..." : "Download 3MF"}
        </button>
      </div>

      {disabled && (
        <p className="text-[12px] text-wood-light/50 m-0">
          Complete your design to enable downloads.
        </p>
      )}

      {error && (
        <p className="text-[12px] text-red-600 m-0">{error}</p>
      )}

      <div className="bg-forest/[0.08] border border-forest/[0.18] rounded-2xl p-5 mt-1">
        <div className="text-[10px] font-bold tracking-[0.15em] text-forest uppercase mb-2">
          Print settings
        </div>
        <ul className="text-[13px] text-wood-light/70 leading-relaxed m-0 pl-4 flex flex-col gap-1">
          <li>Print in vase mode (spiralize outer contour)</li>
          <li>0.6mm nozzle recommended</li>
          <li>Translucent PETG for best light diffusion</li>
          <li>Fits standard E27 LED bulb</li>
        </ul>
        <button
          onClick={handleDownloadSettings}
          className="mt-3 bg-transparent text-forest border border-forest/[0.25] rounded-xl py-2 px-4 text-[12px] font-medium cursor-pointer hover:border-forest/40 hover:bg-forest/[0.05]"
        >
          Download print settings
        </button>
      </div>
    </div>
  );
}
