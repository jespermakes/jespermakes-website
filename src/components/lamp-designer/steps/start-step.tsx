"use client";

// The wall of lamps: every tile is a complete design, silhouette drawn
// from the preset's real profile (the same math the 3D engine revolves),
// with its mounting context hinted: cord above pendants, stem and foot
// under standing lamps, a floor line under accent pieces.

import { useMemo } from "react";
import type { LampPreset } from "@/lib/lamp-designer/presets";
import { PRESETS } from "@/lib/lamp-designer/presets";
import { buildProfileForParameters } from "@/lib/lamp-designer/build";
import { interpolateProfile } from "@/lib/lamp-designer/geometry";
import { getFixtureModule } from "@/lib/lamp-designer/fixtures";
import { getPattern } from "@/lib/lamp-designer/patterns";

export interface StartStepProps {
  selectedId: string | null;
  onSelect: (preset: LampPreset) => void;
}

const VIEW_W = 120;
const VIEW_H = 150;

interface Silhouette {
  path: string;
  crownX: number;
  topY: number;
  bottomY: number;
  maxHalf: number;
}

function buildSilhouette(preset: LampPreset, flip: boolean): Silhouette {
  const profile = interpolateProfile(
    buildProfileForParameters(preset.parameters),
    28
  );
  const maxR = Math.max(...profile.map((p) => p.x));
  const maxY = Math.max(...profile.map((p) => p.y));
  const boxW = 84;
  const boxH = 96;
  const scale = Math.min(boxW / (2 * maxR), boxH / maxY);
  const cx = VIEW_W / 2;
  const yTop = 26;

  const mapY = (y: number) => (flip ? yTop + (maxY - y) * scale : yTop + y * scale);
  const right = profile.map((p) => `${(cx + p.x * scale).toFixed(1)},${mapY(p.y).toFixed(1)}`);
  const left = [...profile]
    .reverse()
    .map((p) => `${(cx - p.x * scale).toFixed(1)},${mapY(p.y).toFixed(1)}`);
  const path = `M ${right.join(" L ")} L ${left.join(" L ")} Z`;

  return {
    path,
    crownX: profile[0].x * scale,
    topY: mapY(flip ? maxY : 0),
    bottomY: mapY(flip ? 0 : maxY),
    maxHalf: maxR * scale,
  };
}

function PresetTile({
  preset,
  isSelected,
  onSelect,
}: {
  preset: LampPreset;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const mode = getFixtureModule(preset.parameters.fixture.moduleId).mode;
  const isMoon = preset.parameters.archetype === "moon";
  // Pendants hang crown-up (profile y=0 is the crown); standing lamps
  // sit crown-down, so flip those.
  const flip = mode !== "pendant";
  const s = useMemo(() => buildSilhouette(preset, flip), [preset, flip]);
  const modulation = getPattern(preset.parameters.pattern.presetId).modulation;
  const clipId = `clip-${preset.id}`;

  const detailLines: React.ReactNode[] = [];
  if (!isMoon && modulation.waveCount > 0) {
    const twist = modulation.twistDeg > 0;
    for (let i = 0; i < 5; i++) {
      const x = VIEW_W / 2 - s.maxHalf + ((i + 0.75) * (2 * s.maxHalf)) / 5.5;
      detailLines.push(
        twist ? (
          <path
            key={i}
            d={`M ${x - 7} ${s.topY} Q ${x + 9} ${(s.topY + s.bottomY) / 2} ${x - 3} ${s.bottomY}`}
            stroke="#b9a98c"
            strokeWidth="1.1"
            fill="none"
          />
        ) : (
          <line
            key={i}
            x1={x}
            y1={s.topY}
            x2={x}
            y2={s.bottomY}
            stroke="#b9a98c"
            strokeWidth="1.1"
          />
        )
      );
    }
  }
  if (!isMoon && modulation.bandCount > 0) {
    for (let i = 1; i <= 3; i++) {
      const y = s.topY + ((s.bottomY - s.topY) * i) / 4;
      detailLines.push(
        <path
          key={`b${i}`}
          d={`M ${VIEW_W / 2 - s.maxHalf} ${y} q ${s.maxHalf} ${i % 2 ? 7 : -7} ${2 * s.maxHalf} 0`}
          stroke="#b9a98c"
          strokeWidth="1.1"
          fill="none"
        />
      );
    }
  }
  if (isMoon) {
    detailLines.push(
      <circle key="c1" cx={VIEW_W / 2 - 12} cy={(s.topY + s.bottomY) / 2 - 8} r="5" fill="#e3d7bd" />,
      <circle key="c2" cx={VIEW_W / 2 + 10} cy={(s.topY + s.bottomY) / 2 + 10} r="7" fill="#e3d7bd" />,
      <circle key="c3" cx={VIEW_W / 2 + 16} cy={(s.topY + s.bottomY) / 2 - 14} r="3.5" fill="#e3d7bd" />
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={[
        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center",
        isSelected
          ? "border-forest bg-forest/5"
          : "border-wood/15 bg-white hover:border-forest/30 hover:bg-forest/[0.02]",
      ].join(" ")}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full" role="img" aria-label={preset.name}>
        <defs>
          <clipPath id={clipId}>
            <path d={s.path} />
          </clipPath>
        </defs>
        {mode === "pendant" && (
          <line x1={VIEW_W / 2} y1={0} x2={VIEW_W / 2} y2={s.topY} stroke="#3a3a3a" strokeWidth="2" />
        )}
        <path d={s.path} fill="#f7efdd" stroke="#c9ba9b" strokeWidth="1.5" />
        <g clipPath={`url(#${clipId})`}>{detailLines}</g>
        {mode === "table" && (
          <g stroke="#3a3a3a" strokeWidth="2">
            <line x1={VIEW_W / 2} y1={s.bottomY} x2={VIEW_W / 2} y2={VIEW_H - 10} />
            <line x1={VIEW_W / 2 - 16} y1={VIEW_H - 9} x2={VIEW_W / 2 + 16} y2={VIEW_H - 9} strokeWidth="3" />
          </g>
        )}
        {mode === "accent" && (
          <line
            x1={VIEW_W / 2 - 30}
            y1={s.bottomY + 3}
            x2={VIEW_W / 2 + 30}
            y2={s.bottomY + 3}
            stroke="#d8ccb2"
            strokeWidth="2"
          />
        )}
      </svg>
      <span className={`text-sm font-medium leading-tight ${isSelected ? "text-forest" : "text-wood"}`}>
        {preset.name}
      </span>
      <span className="text-[11px] leading-snug text-wood/50">{preset.tagline}</span>
    </button>
  );
}

export function StartStep({ selectedId, onSelect }: StartStepProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-wood mb-1">Pick a lamp</h2>
      <p className="text-sm text-wood/60 mb-6 max-w-xl">
        Every one of these is a finished, printable lamp: hardware, shape
        and pattern already matched. Pick one and make it yours; the 3D
        workshop opens the moment you choose.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {PRESETS.map((preset) => (
          <PresetTile
            key={preset.id}
            preset={preset}
            isSelected={selectedId === preset.id}
            onSelect={() => onSelect(preset)}
          />
        ))}
      </div>
    </div>
  );
}
