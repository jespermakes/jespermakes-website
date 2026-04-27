import { GRID_MAJOR, GRID_MINOR } from "@/lib/studio/constants";

interface GridLayerProps {
  gridSpacing: number;
  viewportX: number;
  viewportY: number;
  viewWidthMm: number;
  viewHeightMm: number;
}

export function GridLayer({
  gridSpacing,
  viewportX,
  viewportY,
  viewWidthMm,
  viewHeightMm,
}: GridLayerProps) {
  if (gridSpacing <= 0 || viewWidthMm <= 0 || viewHeightMm <= 0) return null;

  const minorId = "studio-grid-minor";
  const majorId = "studio-grid-major";
  const minorStrokeWidth = Math.max(0.05, gridSpacing * 0.01);
  const majorStrokeWidth = Math.max(0.08, gridSpacing * 0.02);
  const major = gridSpacing * 10;

  return (
    <>
      <defs>
        <pattern
          id={minorId}
          width={gridSpacing}
          height={gridSpacing}
          patternUnits="userSpaceOnUse"
          x={0}
          y={0}
        >
          <path
            d={`M ${gridSpacing} 0 L 0 0 0 ${gridSpacing}`}
            fill="none"
            stroke={GRID_MINOR}
            strokeWidth={minorStrokeWidth}
          />
        </pattern>
        <pattern
          id={majorId}
          width={major}
          height={major}
          patternUnits="userSpaceOnUse"
          x={0}
          y={0}
        >
          <rect width={major} height={major} fill={`url(#${minorId})`} />
          <path
            d={`M ${major} 0 L 0 0 0 ${major}`}
            fill="none"
            stroke={GRID_MAJOR}
            strokeWidth={majorStrokeWidth}
          />
        </pattern>
      </defs>
      <rect
        x={viewportX}
        y={viewportY}
        width={viewWidthMm}
        height={viewHeightMm}
        fill={`url(#${majorId})`}
      />
    </>
  );
}
