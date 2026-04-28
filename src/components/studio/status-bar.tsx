"use client";

import { useEffect, useState } from "react";
import { mmToDisplay } from "@/lib/studio/geometry";
import type { Shape } from "@/lib/studio/types";

interface StatusBarProps {
  cursorDocPos: { x: number; y: number } | null;
  unit: "mm" | "in";
  selectedShapes: Shape[];
  zoom: number;
  /** True until the user performs any action; controls the hint cycling. */
  showIdleHints: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitAll: () => void;
}

const IDLE_HINTS = [
  "Right-click for options",
  "Space + drag to pan the canvas",
  "Ctrl+D to duplicate selected shapes",
  "Double-click a shape to edit its nodes",
  "Ctrl+Z to undo",
];

const ZOOM_REFERENCE = 3.78;

function formatCoord(mm: number, unit: "mm" | "in"): string {
  const v = mmToDisplay(mm, unit);
  return v.toFixed(unit === "in" ? 3 : 1);
}

function formatDimension(mm: number, unit: "mm" | "in"): string {
  return formatCoord(mm, unit);
}

function selectionLabel(shapes: Shape[], unit: "mm" | "in"): string {
  if (shapes.length === 0) return "";
  if (shapes.length > 1) return `${shapes.length} shapes selected`;
  const s = shapes[0];
  if (s.type === "rectangle" || s.type === "circle") {
    const verb = s.type === "circle" ? "Circle" : "Rectangle";
    return `${verb} ${formatDimension(s.width, unit)} × ${formatDimension(s.height, unit)} ${unit}`;
  }
  if (s.type === "line") {
    const dx = (s.x2 ?? 0) - (s.x1 ?? 0);
    const dy = (s.y2 ?? 0) - (s.y1 ?? 0);
    const len = Math.hypot(dx, dy);
    return `Line ${formatDimension(len, unit)} ${unit}`;
  }
  if (s.type === "text") {
    const preview = (s.text ?? "").slice(0, 24);
    return `Text "${preview}"`;
  }
  if (s.type === "path") {
    const count = s.points?.length ?? 0;
    if (count > 0) return `Path · ${count} node${count === 1 ? "" : "s"}`;
    return `Path · ${formatDimension(s.width, unit)} × ${formatDimension(s.height, unit)} ${unit}`;
  }
  return "1 shape selected";
}

export function StatusBar({
  cursorDocPos,
  unit,
  selectedShapes,
  zoom,
  showIdleHints,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitAll,
}: StatusBarProps) {
  const zoomPercent = Math.round((zoom / ZOOM_REFERENCE) * 100);
  const selLabel = selectionLabel(selectedShapes, unit);

  const idle =
    showIdleHints &&
    !cursorDocPos &&
    selectedShapes.length === 0;

  const [hintIdx, setHintIdx] = useState(0);
  useEffect(() => {
    if (!idle) return;
    const t = setInterval(() => {
      setHintIdx((i) => (i + 1) % IDLE_HINTS.length);
    }, 8000);
    return () => clearInterval(t);
  }, [idle]);

  const cursorLabel = cursorDocPos
    ? `X: ${formatCoord(cursorDocPos.x, unit)}  Y: ${formatCoord(cursorDocPos.y, unit)} ${unit}`
    : idle
      ? IDLE_HINTS[hintIdx]
      : "—";

  return (
    <div className="flex h-7 items-center gap-4 border-t border-wood/[0.08] bg-[#F5F0E8] px-3 font-mono text-[11px] text-wood-light/60">
      <span className="tabular-nums transition-opacity" aria-label="Cursor position">
        {cursorLabel}
      </span>
      {selLabel ? (
        <span className="text-wood-light/80">{selLabel}</span>
      ) : null}
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <ZoomButton onClick={onZoomOut} ariaLabel="Zoom out">
          −
        </ZoomButton>
        <button
          type="button"
          onClick={onZoomReset}
          className="min-w-[3.25rem] rounded px-2 py-0.5 text-center hover:bg-wood/5"
          aria-label="Reset zoom to 100%"
        >
          {zoomPercent}%
        </button>
        <ZoomButton onClick={onZoomIn} ariaLabel="Zoom in">
          +
        </ZoomButton>
        <button
          type="button"
          onClick={onFitAll}
          className="ml-2 rounded px-2 py-0.5 hover:bg-wood/5"
          aria-label="Fit all (Ctrl+0)"
          title="Fit all (Ctrl+0)"
        >
          Fit all
        </button>
      </div>
    </div>
  );
}

function ZoomButton({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-5 w-5 items-center justify-center rounded text-wood-light hover:bg-wood/5"
    >
      {children}
    </button>
  );
}
