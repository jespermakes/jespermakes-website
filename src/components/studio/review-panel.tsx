"use client";

import type { ReviewSummary } from "@/lib/studio/review-checks";
import type { CuttingTool, MaterialSettings, StudioMode } from "@/lib/studio/types";

interface ReviewPanelProps {
  summary: ReviewSummary;
  material: MaterialSettings;
  activeTool: CuttingTool | null;
  unit: "mm" | "in";
  onHighlightShape: (id: string) => void;
  onModeChange: (mode: StudioMode) => void;
  onExport: () => void;
}

const SECTION_LABEL =
  "text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/40";

export function ReviewPanel({
  summary,
  material,
  activeTool,
  unit,
  onHighlightShape,
  onModeChange,
  onExport,
}: ReviewPanelProps) {
  const errorCount = summary.warnings.filter((w) => w.level === "error").length;
  const warnCount = summary.warnings.filter((w) => w.level === "warn").length;

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-l border-wood/[0.08] bg-white">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <span className={SECTION_LABEL}>Review</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 text-sm">
            <Stat
              ok={summary.assigned > 0}
              text={`${summary.assigned} of ${summary.total} shapes have cut types`}
            />
            <Stat
              ok={summary.unassigned === 0}
              warn={summary.unassigned > 0}
              text={
                summary.unassigned > 0
                  ? `${summary.unassigned} shape${summary.unassigned === 1 ? "" : "s"} unassigned`
                  : "No unassigned shapes"
              }
            />
            <Stat
              ok
              text={
                unit === "in"
                  ? `Material: ${(material.width / 25.4).toFixed(2)} × ${(material.height / 25.4).toFixed(2)} in`
                  : `Material: ${material.width} × ${material.height} mm`
              }
            />
            <Stat
              ok={!!activeTool}
              text={
                activeTool
                  ? `Tool: ${activeTool.name} (${activeTool.diameter.toFixed(2)}mm)`
                  : "No tool selected"
              }
            />
            <Stat
              ok={errorCount === 0}
              warn={errorCount === 0 && warnCount > 0}
              error={errorCount > 0}
              text={
                errorCount > 0
                  ? `${errorCount} error${errorCount === 1 ? "" : "s"}, ${warnCount} warning${warnCount === 1 ? "" : "s"}`
                  : warnCount > 0
                    ? `${warnCount} warning${warnCount === 1 ? "" : "s"}`
                    : "Clean"
              }
            />
          </div>
          {summary.warnings.length > 0 ? (
            <div>
              <div className={SECTION_LABEL}>Issues</div>
              <ul className="mt-2 flex flex-col gap-1.5">
                {summary.warnings.map((w, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() =>
                        w.shapeId && onHighlightShape(w.shapeId)
                      }
                      className={`flex w-full items-start gap-2 rounded-md px-2 py-1 text-left text-[12px] transition-colors hover:bg-wood/[0.04] ${
                        w.level === "error"
                          ? "text-red-700"
                          : "text-amber-700"
                      }`}
                    >
                      <span aria-hidden>
                        {w.level === "error" ? "✕" : "⚠"}
                      </span>
                      <span>{w.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onModeChange("plan")}
              className="flex-1 rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-sm text-wood hover:border-forest/40"
            >
              Back to Plan
            </button>
            <button
              type="button"
              onClick={onExport}
              className="flex-1 rounded-xl bg-wood px-3 py-1.5 text-sm font-medium text-cream hover:bg-wood-light"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Stat({
  ok,
  warn,
  error,
  text,
}: {
  ok?: boolean;
  warn?: boolean;
  error?: boolean;
  text: string;
}) {
  const symbol = error ? "✕" : ok ? "✓" : warn ? "⚠" : "·";
  const cls = error
    ? "text-red-700"
    : ok
      ? "text-forest"
      : warn
        ? "text-amber-700"
        : "text-wood-light/60";
  return (
    <div className={`flex items-start gap-2 ${cls}`}>
      <span aria-hidden>{symbol}</span>
      <span className="flex-1 text-wood">{text}</span>
    </div>
  );
}
