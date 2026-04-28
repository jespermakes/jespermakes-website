import type { MaterialSettings } from "@/lib/studio/types";

interface MaterialOutlineProps {
  material: MaterialSettings;
  zoomScale: number;
  unit: "mm" | "in";
}

const COLOR = "rgba(74, 50, 40, 0.4)";
const LABEL_COLOR = "rgba(74, 50, 40, 0.7)";

export function MaterialOutline({
  material,
  zoomScale,
  unit,
}: MaterialOutlineProps) {
  const halfW = material.width / 2;
  const halfH = material.height / 2;
  const dash = 4 * zoomScale;
  const labelSize = 9 * zoomScale;
  const labelY = halfH + 4 * zoomScale + labelSize;
  const text =
    unit === "in"
      ? `${(material.width / 25.4).toFixed(2)} × ${(material.height / 25.4).toFixed(2)} in, ${(material.thickness / 25.4).toFixed(3)} in thick`
      : `${material.width} × ${material.height} mm, ${material.thickness}mm thick`;

  return (
    <g pointerEvents="none">
      <rect
        x={-halfW}
        y={-halfH}
        width={material.width}
        height={material.height}
        fill="none"
        stroke={COLOR}
        strokeWidth={1 * zoomScale}
        strokeDasharray={`${dash} ${dash}`}
      />
      <text
        x={0}
        y={labelY}
        fontSize={labelSize}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
        textAnchor="middle"
        fill={LABEL_COLOR}
      >
        {text}
      </text>
    </g>
  );
}
