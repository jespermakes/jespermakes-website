import { computeDogbones } from "@/lib/studio/dogbones";
import { CUT_TYPE_COLORS } from "@/lib/studio/cut-types";
import type { Shape } from "@/lib/studio/types";

interface DogboneOverlayProps {
  shapes: Shape[];
  toolDiameter: number;
  zoomScale: number;
}

const AMBER = "#C17F3C";

export function DogboneOverlay({
  shapes,
  toolDiameter,
  zoomScale,
}: DogboneOverlayProps) {
  if (toolDiameter <= 0) return null;
  const items: {
    id: string;
    cx: number;
    cy: number;
    r: number;
    color: string;
  }[] = [];
  for (const s of shapes) {
    if (!s.cutType || (s.cutType !== "inside" && s.cutType !== "pocket")) continue;
    if (!s.dogboneCorners || s.dogboneCorners.length === 0) continue;
    const dogs = computeDogbones(s, toolDiameter);
    const color = CUT_TYPE_COLORS[s.cutType];
    for (const d of dogs) {
      items.push({
        id: `${s.id}-${d.cornerIndex}`,
        cx: d.cx,
        cy: d.cy,
        r: d.r,
        color,
      });
    }
  }
  if (items.length === 0) return null;
  const stroke = 1 * zoomScale;
  const dotR = 1.2 * zoomScale;
  return (
    <g pointerEvents="none">
      {items.map((it) => (
        <g key={it.id}>
          <circle
            cx={it.cx}
            cy={it.cy}
            r={it.r}
            fill="none"
            stroke={it.color}
            strokeWidth={stroke}
          />
          <circle cx={it.cx} cy={it.cy} r={dotR} fill={AMBER} />
        </g>
      ))}
    </g>
  );
}
