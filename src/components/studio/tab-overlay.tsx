import { sampleTabsForShape } from "@/lib/studio/tabs";
import type { Shape } from "@/lib/studio/types";

interface TabOverlayProps {
  shapes: Shape[];
  zoomScale: number;
}

const AMBER = "#C17F3C";
const AMBER_FILL = "rgba(193, 127, 60, 0.45)";

export function TabOverlay({ shapes, zoomScale }: TabOverlayProps) {
  const items: {
    id: string;
    cx: number;
    cy: number;
    width: number;
    height: number;
    angleDeg: number;
  }[] = [];
  for (const s of shapes) {
    if (s.cutType !== "outside") continue;
    if (!s.tabs || s.tabs.length === 0) continue;
    const samples = sampleTabsForShape(s);
    for (let i = 0; i < samples.length; i++) {
      const t = samples[i];
      items.push({
        id: `${s.id}-tab-${i}`,
        cx: t.cx,
        cy: t.cy,
        width: t.tab.width,
        height: Math.max(0.5, t.tab.height),
        angleDeg: (t.angleRad * 180) / Math.PI,
      });
    }
  }
  if (items.length === 0) return null;
  const stroke = 1 * zoomScale;
  return (
    <g pointerEvents="none">
      {items.map((it) => (
        <rect
          key={it.id}
          x={-it.width / 2}
          y={-it.height / 2}
          width={it.width}
          height={it.height}
          fill={AMBER_FILL}
          stroke={AMBER}
          strokeWidth={stroke}
          transform={`translate(${it.cx} ${it.cy}) rotate(${it.angleDeg})`}
        />
      ))}
    </g>
  );
}
