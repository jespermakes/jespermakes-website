import type { Shape } from "@/lib/studio/types";
import {
  handleSign,
  type LineEndpointHandle,
  type ResizeHandle,
} from "@/lib/studio/geometry";
import { SELECTION_STROKE } from "@/lib/studio/constants";

interface SelectionHandlesProps {
  shape: Shape;
  /** Inverse zoom — multiplied by handle size to keep handles screen-stable. */
  zoomScale: number;
}

const RESIZE_HANDLES: ResizeHandle[] = [
  "tl",
  "tr",
  "bl",
  "br",
  "t",
  "b",
  "l",
  "r",
];

const HANDLE_PIXELS = 8;
const ROTATE_PIXELS = 9;
const ROTATE_OFFSET_PIXELS = 22;
const HANDLE_FILL = "#FFFFFF";

export function SelectionHandles({ shape, zoomScale }: SelectionHandlesProps) {
  const handleSize = HANDLE_PIXELS * zoomScale;
  const halfHandle = handleSize / 2;

  if (shape.type === "line") {
    return <LineHandles shape={shape} zoomScale={zoomScale} />;
  }

  if (shape.type === "text") {
    return <TextHandles shape={shape} zoomScale={zoomScale} />;
  }

  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  const transform = shape.rotation
    ? `rotate(${shape.rotation} ${shape.x} ${shape.y})`
    : undefined;

  const rotateLineLength = ROTATE_OFFSET_PIXELS * zoomScale;
  const rotateRadius = (ROTATE_PIXELS * zoomScale) / 2;
  const rotateLocalY = -halfH - rotateLineLength;

  return (
    <g pointerEvents="auto" transform={transform}>
      <rect
        x={shape.x - halfW}
        y={shape.y - halfH}
        width={shape.width}
        height={shape.height}
        fill="none"
        stroke={SELECTION_STROKE}
        strokeWidth={zoomScale * 0.6}
        pointerEvents="none"
      />
      {/* Rotation arm */}
      <line
        x1={shape.x}
        y1={shape.y - halfH}
        x2={shape.x}
        y2={shape.y + rotateLocalY}
        stroke={SELECTION_STROKE}
        strokeWidth={zoomScale * 0.6}
        pointerEvents="none"
      />
      <circle
        cx={shape.x}
        cy={shape.y + rotateLocalY}
        r={rotateRadius}
        fill={HANDLE_FILL}
        stroke={SELECTION_STROKE}
        strokeWidth={zoomScale * 0.6}
        data-handle="rotate"
        style={{ cursor: "alias" }}
      />
      {RESIZE_HANDLES.map((h) => {
        const { sx, sy } = handleSign(h);
        const cx = shape.x + sx * halfW;
        const cy = shape.y + sy * halfH;
        return (
          <rect
            key={h}
            x={cx - halfHandle}
            y={cy - halfHandle}
            width={handleSize}
            height={handleSize}
            fill={HANDLE_FILL}
            stroke={SELECTION_STROKE}
            strokeWidth={zoomScale * 0.6}
            data-handle={h}
            style={{ cursor: cursorForHandle(h, shape.rotation) }}
          />
        );
      })}
    </g>
  );
}

function TextHandles({
  shape,
  zoomScale,
}: {
  shape: Shape;
  zoomScale: number;
}) {
  const halfW = shape.width / 2;
  const halfH = shape.height / 2;
  const transform = shape.rotation
    ? `rotate(${shape.rotation} ${shape.x} ${shape.y})`
    : undefined;
  const rotateLineLength = ROTATE_OFFSET_PIXELS * zoomScale;
  const rotateRadius = (ROTATE_PIXELS * zoomScale) / 2;
  const rotateLocalY = -halfH - rotateLineLength;
  return (
    <g pointerEvents="auto" transform={transform}>
      <rect
        x={shape.x - halfW}
        y={shape.y - halfH}
        width={shape.width}
        height={shape.height}
        fill="none"
        stroke={SELECTION_STROKE}
        strokeWidth={zoomScale * 0.6}
        pointerEvents="none"
      />
      <line
        x1={shape.x}
        y1={shape.y - halfH}
        x2={shape.x}
        y2={shape.y + rotateLocalY}
        stroke={SELECTION_STROKE}
        strokeWidth={zoomScale * 0.6}
        pointerEvents="none"
      />
      <circle
        cx={shape.x}
        cy={shape.y + rotateLocalY}
        r={rotateRadius}
        fill={HANDLE_FILL}
        stroke={SELECTION_STROKE}
        strokeWidth={zoomScale * 0.6}
        data-handle="rotate"
        style={{ cursor: "alias" }}
      />
    </g>
  );
}

function LineHandles({ shape, zoomScale }: { shape: Shape; zoomScale: number }) {
  const handleSize = HANDLE_PIXELS * zoomScale;
  const halfHandle = handleSize / 2;
  const ax = shape.x + (shape.x1 ?? 0);
  const ay = shape.y + (shape.y1 ?? 0);
  const bx = shape.x + (shape.x2 ?? 0);
  const by = shape.y + (shape.y2 ?? 0);
  const handles: { key: LineEndpointHandle; cx: number; cy: number }[] = [
    { key: "endpoint-1", cx: ax, cy: ay },
    { key: "endpoint-2", cx: bx, cy: by },
  ];
  return (
    <g pointerEvents="auto">
      {handles.map((h) => (
        <rect
          key={h.key}
          x={h.cx - halfHandle}
          y={h.cy - halfHandle}
          width={handleSize}
          height={handleSize}
          fill={HANDLE_FILL}
          stroke={SELECTION_STROKE}
          strokeWidth={zoomScale * 0.6}
          data-handle={h.key}
          style={{ cursor: "crosshair" }}
        />
      ))}
    </g>
  );
}

function cursorForHandle(h: ResizeHandle, rotation: number): string {
  // Map handles to base cursor; rotation rotates the cursor 45° per step.
  const baseAngle: Record<ResizeHandle, number> = {
    t: 0,
    tr: 45,
    r: 90,
    br: 135,
    b: 180,
    bl: 225,
    l: 270,
    tl: 315,
  };
  const total = (baseAngle[h] + rotation + 360) % 360;
  const stepped = Math.round(total / 45) % 8;
  const cursors = [
    "ns-resize",
    "nesw-resize",
    "ew-resize",
    "nwse-resize",
    "ns-resize",
    "nesw-resize",
    "ew-resize",
    "nwse-resize",
  ];
  return cursors[stepped] ?? "default";
}
