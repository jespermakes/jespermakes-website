import { compensatePath } from "@/lib/studio/kerf";
import { CUT_TYPE_COLORS } from "@/lib/studio/cut-types";
import type { Shape } from "@/lib/studio/types";

interface KerfOverlayProps {
  shapes: Shape[];
  kerfMm: number;
  zoomScale: number;
}

export function KerfOverlay({ shapes, kerfMm, zoomScale }: KerfOverlayProps) {
  if (kerfMm <= 0) return null;
  const items: { id: string; d: string; color: string }[] = [];
  for (const s of shapes) {
    if (!s.cutType) continue;
    if (s.cutType === "online" || s.cutType === "guide") continue;
    const d = compensatePath(s, s.cutType, kerfMm);
    if (!d) continue;
    items.push({
      id: s.id,
      d,
      color: CUT_TYPE_COLORS[s.cutType],
    });
  }
  if (items.length === 0) return null;
  const stroke = 1.4 * zoomScale;
  return (
    <g pointerEvents="none">
      {items.map((it) => (
        <path
          key={it.id}
          d={it.d}
          fill="none"
          stroke={it.color}
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}
