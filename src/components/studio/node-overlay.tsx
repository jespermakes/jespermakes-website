import type { PathPoint } from "@/lib/studio/types";
import { SELECTION_STROKE } from "@/lib/studio/constants";

const NODE_FILL = "white";
const NODE_SELECTED_FILL = SELECTION_STROKE;
const HANDLE_FILL = SELECTION_STROKE;
const HANDLE_LINE = SELECTION_STROKE;

interface NodeOverlayProps {
  points: PathPoint[];
  selectedNodeIndices: number[];
  /** Inverse zoom factor — multiplied by base sizes to keep elements
   *  screen-stable. */
  zoomScale: number;
}

const NODE_PIXELS = 7;
const HANDLE_PIXELS = 5;
const STROKE_PIXELS = 1.2;

export function NodeOverlay({
  points,
  selectedNodeIndices,
  zoomScale,
}: NodeOverlayProps) {
  const nodeR = (NODE_PIXELS * zoomScale) / 2;
  const handleR = (HANDLE_PIXELS * zoomScale) / 2;
  const stroke = STROKE_PIXELS * zoomScale;
  const selected = new Set(selectedNodeIndices);

  return (
    <g pointerEvents="auto">
      {/* Handle lines + dots */}
      {points.map((p, i) => (
        <g key={`h-${i}`}>
          {p.handleIn ? (
            <line
              x1={p.x}
              y1={p.y}
              x2={p.handleIn.x}
              y2={p.handleIn.y}
              stroke={HANDLE_LINE}
              strokeOpacity={0.4}
              strokeWidth={stroke * 0.7}
              pointerEvents="none"
            />
          ) : null}
          {p.handleOut ? (
            <line
              x1={p.x}
              y1={p.y}
              x2={p.handleOut.x}
              y2={p.handleOut.y}
              stroke={HANDLE_LINE}
              strokeOpacity={0.4}
              strokeWidth={stroke * 0.7}
              pointerEvents="none"
            />
          ) : null}
          {p.handleIn ? (
            <circle
              cx={p.handleIn.x}
              cy={p.handleIn.y}
              r={handleR}
              fill={HANDLE_FILL}
              data-node-handle="in"
              data-node-index={i}
              style={{ cursor: "move" }}
            />
          ) : null}
          {p.handleOut ? (
            <circle
              cx={p.handleOut.x}
              cy={p.handleOut.y}
              r={handleR}
              fill={HANDLE_FILL}
              data-node-handle="out"
              data-node-index={i}
              style={{ cursor: "move" }}
            />
          ) : null}
        </g>
      ))}
      {/* Node markers */}
      {points.map((p, i) => {
        const isCurve = !!(p.handleIn || p.handleOut);
        const isSelected = selected.has(i);
        const fill = isSelected ? NODE_SELECTED_FILL : NODE_FILL;
        if (isCurve) {
          return (
            <circle
              key={`n-${i}`}
              cx={p.x}
              cy={p.y}
              r={nodeR}
              fill={fill}
              stroke={SELECTION_STROKE}
              strokeWidth={stroke}
              data-node-index={i}
              style={{ cursor: "move" }}
            />
          );
        }
        return (
          <rect
            key={`n-${i}`}
            x={p.x - nodeR}
            y={p.y - nodeR}
            width={nodeR * 2}
            height={nodeR * 2}
            fill={fill}
            stroke={SELECTION_STROKE}
            strokeWidth={stroke}
            data-node-index={i}
            style={{ cursor: "move" }}
          />
        );
      })}
    </g>
  );
}
