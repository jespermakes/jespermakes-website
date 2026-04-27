interface GridLayerProps {
  gridSpacing: number;
  viewportX: number;
  viewportY: number;
  viewWidthMm: number;
  viewHeightMm: number;
  /** Pixels per mm. Used to scale stroke widths and pick density tiers. */
  zoom: number;
}

const GRID_COLOR = "74, 50, 40";

export function GridLayer({
  gridSpacing,
  viewportX,
  viewportY,
  viewWidthMm,
  viewHeightMm,
  zoom,
}: GridLayerProps) {
  if (gridSpacing <= 0 || viewWidthMm <= 0 || viewHeightMm <= 0) return null;

  const showMinor = zoom >= 0.5;
  const showSub = zoom > 10 && gridSpacing > 1;

  const subId = "studio-grid-sub";
  const minorId = "studio-grid-minor";
  const majorId = "studio-grid-major";

  // Stroke widths in document mm, derived from a target screen pixel width.
  const minorStroke = 0.4 / zoom;
  const majorStroke = 0.5 / zoom;
  const subStroke = 0.4 / zoom;

  const major = gridSpacing * 10;
  const sub = 1;

  return (
    <>
      <defs>
        {showSub ? (
          <pattern
            id={subId}
            width={sub}
            height={sub}
            patternUnits="userSpaceOnUse"
            x={0}
            y={0}
          >
            <path
              d={`M ${sub} 0 L 0 0 0 ${sub}`}
              fill="none"
              stroke={`rgba(${GRID_COLOR}, 0.08)`}
              strokeWidth={subStroke}
            />
          </pattern>
        ) : null}
        {showMinor ? (
          <pattern
            id={minorId}
            width={gridSpacing}
            height={gridSpacing}
            patternUnits="userSpaceOnUse"
            x={0}
            y={0}
          >
            {showSub ? (
              <rect
                width={gridSpacing}
                height={gridSpacing}
                fill={`url(#${subId})`}
              />
            ) : null}
            <path
              d={`M ${gridSpacing} 0 L 0 0 0 ${gridSpacing}`}
              fill="none"
              stroke={`rgba(${GRID_COLOR}, 0.15)`}
              strokeWidth={minorStroke}
            />
          </pattern>
        ) : null}
        <pattern
          id={majorId}
          width={major}
          height={major}
          patternUnits="userSpaceOnUse"
          x={0}
          y={0}
        >
          {showMinor ? (
            <rect width={major} height={major} fill={`url(#${minorId})`} />
          ) : null}
          <path
            d={`M ${major} 0 L 0 0 0 ${major}`}
            fill="none"
            stroke={`rgba(${GRID_COLOR}, 0.30)`}
            strokeWidth={majorStroke}
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
