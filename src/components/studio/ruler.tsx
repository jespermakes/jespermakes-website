"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MM_PER_INCH } from "@/lib/studio/constants";

const RULER_BG = "#F5F0E8";
const TICK_COLOR = "rgba(74, 50, 40, 0.6)";
const NUMBER_COLOR = "rgba(74, 50, 40, 0.7)";
const CURSOR_COLOR = "#C17F3C"; // amber
const RULER_THICKNESS = 24;

interface Steps {
  major: number;
  minor: number;
  sub: number;
}

function stepsForUnit(unit: "mm" | "in"): Steps {
  if (unit === "in") {
    return { major: MM_PER_INCH, minor: MM_PER_INCH / 8, sub: MM_PER_INCH / 16 };
  }
  return { major: 10, minor: 1, sub: 0.5 };
}

function formatLabel(valueMm: number, unit: "mm" | "in"): string {
  if (unit === "in") {
    const v = valueMm / MM_PER_INCH;
    // Show whole inches without decimals.
    return Math.round(v).toString();
  }
  // mm: show whole numbers, show decimals only if not integer (rare).
  const rounded = Math.round(valueMm);
  return rounded.toString();
}

interface RulerProps {
  orientation: "horizontal" | "vertical";
  /** Document-mm offset of the ruler's first pixel. */
  viewportStart: number;
  zoom: number;
  unit: "mm" | "in";
  /** Cursor position in doc mm along the ruler's axis, or null. */
  cursorDocPos: number | null;
}

export function Ruler({
  orientation,
  viewportStart,
  zoom,
  unit,
  cursorDocPos,
}: RulerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    const cssW = orientation === "horizontal" ? size.width : RULER_THICKNESS;
    const cssH = orientation === "horizontal" ? RULER_THICKNESS : size.height;
    if (cssW <= 0 || cssH <= 0) return;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawRuler(ctx, {
      orientation,
      cssWidth: cssW,
      cssHeight: cssH,
      viewportStart,
      zoom,
      unit,
      cursorDocPos,
    });
  }, [orientation, size.width, size.height, viewportStart, zoom, unit, cursorDocPos]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden"
      style={{
        background: RULER_BG,
        height: orientation === "horizontal" ? RULER_THICKNESS : "100%",
        width: orientation === "horizontal" ? "100%" : RULER_THICKNESS,
        borderBottom: orientation === "horizontal" ? "1px solid rgba(74,50,40,0.08)" : undefined,
        borderRight: orientation === "vertical" ? "1px solid rgba(74,50,40,0.08)" : undefined,
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

interface RulerCornerProps {
  unit: "mm" | "in";
  onToggleUnit: () => void;
}

export function RulerCorner({ unit, onToggleUnit }: RulerCornerProps) {
  return (
    <button
      type="button"
      onClick={onToggleUnit}
      aria-label={`Unit: ${unit}. Click to toggle.`}
      title={`Toggle units (currently ${unit})`}
      className="flex h-6 w-6 items-center justify-center text-[10px] font-mono text-wood-light/70 hover:bg-wood/5"
      style={{
        background: RULER_BG,
        borderRight: "1px solid rgba(74,50,40,0.08)",
        borderBottom: "1px solid rgba(74,50,40,0.08)",
      }}
    >
      {unit}
    </button>
  );
}

function drawRuler(
  ctx: CanvasRenderingContext2D,
  opts: {
    orientation: "horizontal" | "vertical";
    cssWidth: number;
    cssHeight: number;
    viewportStart: number;
    zoom: number;
    unit: "mm" | "in";
    cursorDocPos: number | null;
  },
) {
  const { orientation, cssWidth, cssHeight, viewportStart, zoom, unit, cursorDocPos } = opts;
  const along = orientation === "horizontal" ? cssWidth : cssHeight;
  const across = orientation === "horizontal" ? cssHeight : cssWidth;

  ctx.fillStyle = RULER_BG;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  const { major, minor, sub } = stepsForUnit(unit);
  const minorPx = minor * zoom;
  const subPx = sub * zoom;
  const showMinor = minorPx >= 4;
  const showSub = subPx >= 3;

  const minDoc = viewportStart;
  const maxDoc = viewportStart + along / zoom;

  ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillStyle = NUMBER_COLOR;

  // Sub ticks (background-most)
  if (showSub) {
    ctx.fillStyle = TICK_COLOR;
    const firstSub = Math.ceil(minDoc / sub) * sub;
    for (let v = firstSub; v <= maxDoc + 1e-6; v += sub) {
      // Skip those landing on minor ticks (rendered separately).
      if (showMinor && Math.abs(v / minor - Math.round(v / minor)) < 1e-3) continue;
      const p = (v - viewportStart) * zoom;
      drawTick(ctx, orientation, p, across, 2);
    }
  }

  // Minor ticks
  if (showMinor) {
    ctx.fillStyle = TICK_COLOR;
    const firstMinor = Math.ceil(minDoc / minor) * minor;
    for (let v = firstMinor; v <= maxDoc + 1e-6; v += minor) {
      if (Math.abs(v / major - Math.round(v / major)) < 1e-3) continue;
      const p = (v - viewportStart) * zoom;
      drawTick(ctx, orientation, p, across, 5);
    }
  }

  // Major ticks + labels
  ctx.fillStyle = TICK_COLOR;
  const firstMajor = Math.ceil(minDoc / major) * major;
  for (let v = firstMajor; v <= maxDoc + 1e-6; v += major) {
    const p = (v - viewportStart) * zoom;
    drawTick(ctx, orientation, p, across, 10);
  }

  ctx.fillStyle = NUMBER_COLOR;
  for (let v = firstMajor; v <= maxDoc + 1e-6; v += major) {
    const p = (v - viewportStart) * zoom;
    const label = formatLabel(v, unit);
    drawLabel(ctx, orientation, p, across, label);
  }

  // Cursor indicator
  if (cursorDocPos !== null) {
    const p = (cursorDocPos - viewportStart) * zoom;
    if (p >= -1 && p <= along + 1) {
      ctx.strokeStyle = CURSOR_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (orientation === "horizontal") {
        ctx.moveTo(p + 0.5, 0);
        ctx.lineTo(p + 0.5, across);
      } else {
        ctx.moveTo(0, p + 0.5);
        ctx.lineTo(across, p + 0.5);
      }
      ctx.stroke();
    }
  }
}

function drawTick(
  ctx: CanvasRenderingContext2D,
  orientation: "horizontal" | "vertical",
  alongPx: number,
  acrossPx: number,
  lengthPx: number,
) {
  // Ticks grow inward from the canvas-facing edge.
  if (orientation === "horizontal") {
    // Bottom edge faces canvas (canvas is below). Tick grows upward.
    ctx.fillRect(Math.round(alongPx), acrossPx - lengthPx, 1, lengthPx);
  } else {
    // Right edge faces canvas. Tick grows leftward.
    ctx.fillRect(acrossPx - lengthPx, Math.round(alongPx), lengthPx, 1);
  }
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  orientation: "horizontal" | "vertical",
  alongPx: number,
  acrossPx: number,
  label: string,
) {
  if (orientation === "horizontal") {
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(label, alongPx, 2);
  } else {
    // Place near the outer (left) edge, rotated 90° so it reads top-to-bottom.
    ctx.save();
    ctx.translate(2, alongPx);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(label, 0, 0);
    ctx.restore();
    // Reset across reference (no-op for now)
    void acrossPx;
  }
}
