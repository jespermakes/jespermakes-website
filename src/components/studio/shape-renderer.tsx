import type { Shape } from "@/lib/studio/types";
import {
  SELECTION_STROKE,
  SELECTION_STROKE_WIDTH,
} from "@/lib/studio/constants";

interface ShapeRendererProps {
  shape: Shape;
  selected?: boolean;
  /** Inverse of zoom; used to keep selection overlay strokes screen-stable. */
  zoomScale?: number;
}

function shapeTransform(shape: Shape): string | undefined {
  if (!shape.rotation) return undefined;
  return `rotate(${shape.rotation} ${shape.x} ${shape.y})`;
}

export function ShapeElement({ shape }: { shape: Shape }) {
  const transform = shapeTransform(shape);
  const common = {
    stroke: shape.stroke,
    strokeWidth: shape.strokeWidth,
    fill: shape.fill,
    transform,
    "data-shape-id": shape.id,
    style: { cursor: "default" },
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
      />
    );
  }
  return null;
}

export function ShapeRenderer({
  shape,
  selected,
  zoomScale = 1,
}: ShapeRendererProps) {
  return (
    <>
      <ShapeElement shape={shape} />
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
    fill: "none" as const,
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
        pointerEvents="none"
        transform={transform}
      />
    );
  }
  return null;
}
