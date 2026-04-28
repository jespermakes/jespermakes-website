import type { PathPoint } from "@/lib/studio/types";
import { pointsToSVGPath } from "@/lib/studio/path-ops";
import { DEFAULT_STROKE, DEFAULT_STROKE_WIDTH } from "@/lib/studio/constants";

const PEN_COLOR = "#C17F3C"; // amber

interface PenOverlayProps {
  points: PathPoint[];
  cursorDoc: { x: number; y: number } | null;
  dragging: boolean;
  hoveringFirstPoint: boolean;
  zoomScale: number;
}

export function PenOverlay({
  points,
  cursorDoc,
  dragging,
  hoveringFirstPoint,
  zoomScale,
}: PenOverlayProps) {
  if (points.length === 0 && !cursorDoc) return null;

  const placed = pointsToSVGPath(points, false);
  const last = points[points.length - 1];

  const dotR = 2 * zoomScale;
  const handleR = 2 * zoomScale;
  const lineW = 1 * zoomScale;
  const closeR = 4 * zoomScale;

  // Build the rubber-band segment from last point to the cursor.
  let rubberBandD: string | null = null;
  if (last && cursorDoc && !hoveringFirstPoint) {
    if (last.handleOut) {
      // Mirror handleOut as handleIn for the cursor end so the curve preview
      // reflects the user's pulled handle.
      rubberBandD = `M${last.x},${last.y} C${last.handleOut.x},${last.handleOut.y} ${cursorDoc.x},${cursorDoc.y} ${cursorDoc.x},${cursorDoc.y}`;
    } else {
      rubberBandD = `M${last.x},${last.y} L${cursorDoc.x},${cursorDoc.y}`;
    }
  }

  const first = points[0];

  return (
    <g pointerEvents="none">
      {placed ? (
        <path
          d={placed}
          stroke={DEFAULT_STROKE}
          strokeWidth={DEFAULT_STROKE_WIDTH}
          fill="none"
        />
      ) : null}
      {rubberBandD ? (
        <path
          d={rubberBandD}
          stroke={DEFAULT_STROKE}
          strokeWidth={DEFAULT_STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${3 * zoomScale} ${2 * zoomScale}`}
          opacity={0.6}
        />
      ) : null}
      {/* Handle lines + dots for each point with handles */}
      {points.map((p, i) => (
        <g key={`h-${i}`}>
          {p.handleIn ? (
            <line
              x1={p.x}
              y1={p.y}
              x2={p.handleIn.x}
              y2={p.handleIn.y}
              stroke={PEN_COLOR}
              strokeOpacity={0.5}
              strokeWidth={lineW}
            />
          ) : null}
          {p.handleOut ? (
            <line
              x1={p.x}
              y1={p.y}
              x2={p.handleOut.x}
              y2={p.handleOut.y}
              stroke={PEN_COLOR}
              strokeOpacity={0.5}
              strokeWidth={lineW}
            />
          ) : null}
          {p.handleIn ? (
            <circle
              cx={p.handleIn.x}
              cy={p.handleIn.y}
              r={handleR}
              fill="white"
              stroke={PEN_COLOR}
              strokeWidth={lineW}
            />
          ) : null}
          {p.handleOut ? (
            <circle
              cx={p.handleOut.x}
              cy={p.handleOut.y}
              r={handleR}
              fill="white"
              stroke={PEN_COLOR}
              strokeWidth={lineW}
            />
          ) : null}
        </g>
      ))}
      {/* Placed-point dots */}
      {points.map((p, i) => {
        const isFirst = i === 0;
        const highlighted = isFirst && hoveringFirstPoint && points.length >= 2;
        return (
          <circle
            key={`p-${i}`}
            cx={p.x}
            cy={p.y}
            r={highlighted ? closeR : dotR}
            fill={highlighted ? "white" : PEN_COLOR}
            stroke={PEN_COLOR}
            strokeWidth={highlighted ? lineW * 1.5 : 0}
          />
        );
      })}
      {/* Marker at the very first point when there are 2+ points to hint
          that it's clickable to close. */}
      {first && points.length >= 2 && !hoveringFirstPoint ? (
        <circle
          cx={first.x}
          cy={first.y}
          r={dotR * 1.5}
          fill="none"
          stroke={PEN_COLOR}
          strokeOpacity={0.5}
          strokeWidth={lineW}
        />
      ) : null}
      {/* Indicate "click to close" with a stronger ring around first point. */}
      {hoveringFirstPoint && first ? (
        <circle
          cx={first.x}
          cy={first.y}
          r={closeR * 1.6}
          fill="none"
          stroke={PEN_COLOR}
          strokeWidth={lineW * 1.5}
        />
      ) : null}
      {/* Suppress lint: dragging param reserved for future cursor distinction. */}
      {dragging ? null : null}
    </g>
  );
}
