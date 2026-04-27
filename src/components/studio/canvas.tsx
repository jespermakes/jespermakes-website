"use client";

import { forwardRef, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import type { Shape } from "@/lib/studio/types";
import { CANVAS_BACKGROUND } from "@/lib/studio/constants";
import { GridLayer } from "./grid-layer";
import { ShapeRenderer } from "./shape-renderer";

interface CanvasProps {
  shapes: Shape[];
  selectedIds: string[];
  viewportX: number;
  viewportY: number;
  zoom: number;
  gridSpacing: number;
  viewWidthMm: number;
  viewHeightMm: number;
  cursor: string;
  onPointerDown: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (e: PointerEvent<SVGSVGElement>) => void;
  onPointerLeave?: (e: PointerEvent<SVGSVGElement>) => void;
  onWheel: (e: WheelEvent<SVGSVGElement>) => void;
  overlay?: ReactNode;
}

export const Canvas = forwardRef<SVGSVGElement, CanvasProps>(function Canvas(
  {
    shapes,
    selectedIds,
    viewportX,
    viewportY,
    zoom,
    gridSpacing,
    viewWidthMm,
    viewHeightMm,
    cursor,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onWheel,
    overlay,
  },
  ref,
) {
  const selectedSet = new Set(selectedIds);
  const zoomScale = 1 / zoom;
  const viewBox =
    viewWidthMm > 0 && viewHeightMm > 0
      ? `${viewportX} ${viewportY} ${viewWidthMm} ${viewHeightMm}`
      : "0 0 1 1";

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onWheel={onWheel}
      style={{
        background: CANVAS_BACKGROUND,
        touchAction: "none",
        cursor,
        userSelect: "none",
        display: "block",
      }}
    >
      <GridLayer
        gridSpacing={gridSpacing}
        viewportX={viewportX}
        viewportY={viewportY}
        viewWidthMm={viewWidthMm}
        viewHeightMm={viewHeightMm}
        zoom={zoom}
      />
      <g>
        {shapes.map((shape) => (
          <ShapeRenderer
            key={shape.id}
            shape={shape}
            selected={selectedSet.has(shape.id)}
            zoomScale={zoomScale}
          />
        ))}
      </g>
      {overlay}
    </svg>
  );
});
