import type { Shape } from "@/lib/studio/types";

interface ToolOverlayProps {
  preview: Shape | null;
  zoomScale: number;
  marquee: { x: number; y: number; width: number; height: number } | null;
}

export function ToolOverlay({ preview, zoomScale, marquee }: ToolOverlayProps) {
  return (
    <g pointerEvents="none">
      {preview ? <PreviewShape shape={preview} zoomScale={zoomScale} /> : null}
      {marquee ? (
        <rect
          x={marquee.x}
          y={marquee.y}
          width={marquee.width}
          height={marquee.height}
          fill="rgba(59, 130, 246, 0.08)"
          stroke="#3B82F6"
          strokeWidth={0.5 * zoomScale}
          strokeDasharray={`${3 * zoomScale} ${2 * zoomScale}`}
        />
      ) : null}
    </g>
  );
}

function PreviewShape({
  shape,
  zoomScale,
}: {
  shape: Shape;
  zoomScale: number;
}) {
  const stroke = shape.stroke;
  const strokeWidth = Math.max(0.5 * zoomScale, shape.strokeWidth);
  const dash = `${3 * zoomScale} ${2 * zoomScale}`;
  const common = {
    stroke,
    strokeWidth,
    fill: "none",
    strokeDasharray: dash,
  } as const;

  if (shape.type === "rectangle") {
    return (
      <rect
        x={shape.x - shape.width / 2}
        y={shape.y - shape.height / 2}
        width={shape.width}
        height={shape.height}
        {...common}
      />
    );
  }
  if (shape.type === "circle") {
    const rx = shape.width / 2;
    const ry = shape.height / 2;
    if (Math.abs(rx - ry) < 1e-6) {
      return <circle cx={shape.x} cy={shape.y} r={rx} {...common} />;
    }
    return <ellipse cx={shape.x} cy={shape.y} rx={rx} ry={ry} {...common} />;
  }
  if (shape.type === "line") {
    return (
      <line
        x1={shape.x + (shape.x1 ?? 0)}
        y1={shape.y + (shape.y1 ?? 0)}
        x2={shape.x + (shape.x2 ?? 0)}
        y2={shape.y + (shape.y2 ?? 0)}
        {...common}
      />
    );
  }
  return null;
}
