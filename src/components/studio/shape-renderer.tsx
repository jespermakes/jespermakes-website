import type { Shape } from "@/lib/studio/types";
import {
  SELECTION_FILL,
  SELECTION_STROKE,
  SELECTION_STROKE_WIDTH,
} from "@/lib/studio/constants";

interface ShapeRendererProps {
  shape: Shape;
  selected?: boolean;
  /** Inverse of zoom; used to keep selection overlay strokes screen-stable. */
  zoomScale?: number;
  interactive?: boolean;
}

function shapeTransform(shape: Shape): string | undefined {
  if (!shape.rotation) return undefined;
  return `rotate(${shape.rotation} ${shape.x} ${shape.y})`;
}

export function ShapeElement({
  shape,
  interactive = true,
}: {
  shape: Shape;
  interactive?: boolean;
}) {
  const transform = shapeTransform(shape);
  const cursor = interactive ? "move" : "inherit";
  const pointerEvents = interactive ? undefined : "none";
  const common = {
    stroke: shape.stroke,
    strokeWidth: shape.strokeWidth,
    fill: shape.fill,
    transform,
    "data-shape-id": shape.id,
    style: { cursor },
    pointerEvents,
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
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
        transform={transform}
        data-shape-id={shape.id}
        style={{ cursor }}
        pointerEvents={pointerEvents}
      />
    );
  }
  if (shape.type === "text") {
    const lines = (shape.text ?? "").split("\n");
    const fontSize = shape.fontSize ?? 10;
    const lineHeight = fontSize * 1.2;
    const startDy = -((lines.length - 1) * lineHeight) / 2;
    return (
      <text
        x={shape.x}
        y={shape.y}
        fontSize={fontSize}
        fontFamily={shape.fontFamily ?? "Inter, sans-serif"}
        textAnchor={shape.textAnchor ?? "middle"}
        dominantBaseline="middle"
        fill={shape.stroke}
        transform={transform}
        data-shape-id={shape.id}
        style={{ cursor, userSelect: "none" }}
        pointerEvents={pointerEvents}
      >
        {lines.map((line, i) => (
          <tspan
            key={i}
            x={shape.x}
            dy={i === 0 ? startDy : lineHeight}
          >
            {line === "" ? " " : line}
          </tspan>
        ))}
      </text>
    );
  }
  return null;
}

export function ShapeRenderer({
  shape,
  selected,
  zoomScale = 1,
  interactive = true,
}: ShapeRendererProps) {
  return (
    <>
      <ShapeElement shape={shape} interactive={interactive} />
      {selected ? (
        <ShapeSelectionOverlay shape={shape} zoomScale={zoomScale} />
      ) : null}
    </>
  );
}

function ShapeSelectionOverlay({
  shape,
  zoomScale,
}: {
  shape: Shape;
  zoomScale: number;
}) {
  const transform = shapeTransform(shape);
  const stroke = SELECTION_STROKE;
  const strokeWidth = SELECTION_STROKE_WIDTH * zoomScale;
  const common = {
    stroke,
    strokeWidth,
    fill: SELECTION_FILL,
    pointerEvents: "none" as const,
    transform,
  };

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
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill="none"
        pointerEvents="none"
        transform={transform}
      />
    );
  }
  if (shape.type === "text") {
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
  return null;
}
