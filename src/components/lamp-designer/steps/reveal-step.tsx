"use client";

import { useState } from "react";
import type {
  LampContext,
  ShapeParameters,
  LightParameters,
  PatternId,
} from "@/lib/lamp-designer/types";

export interface RevealStepProps {
  context: LampContext;
  shape: ShapeParameters;
  light: LightParameters;
  patternId: PatternId;
}

const CONTEXT_LABELS: Record<LampContext, string> = {
  bedside: "Bedside table",
  dining: "Dining room",
  reading: "Reading nook",
  hallway: "Hallway",
  desk: "Desk",
  shelf: "Shelf",
};

export function lightColorFromTemperature(kelvin: number): string {
  if (kelvin <= 2400) return "#ffb347";
  if (kelvin <= 2900) return "#ffd699";
  if (kelvin <= 3500) return "#ffe8c0";
  if (kelvin <= 4500) return "#fff4e0";
  return "#fff9f0";
}

export function glowOpacity(beamAngle: number): number {
  return Math.min(1, Math.max(0.2, beamAngle / 150));
}

export function RevealStep({ context, shape, light, patternId }: RevealStepProps) {
  const [lightOn, setLightOn] = useState(true);

  const lightColor = lightColorFromTemperature(light.colorTemperature);
  const glow = glowOpacity(light.beamAngle);

  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">
        Your lamp, in context
      </h2>
      <p className="text-sm text-wood/60 mb-5">
        See how your design looks in a {CONTEXT_LABELS[context].toLowerCase()} setting.
        Toggle the light to preview the mood.
      </p>

      {/* Beauty shot placeholder */}
      <div
        className={[
          "relative w-full aspect-[4/3] rounded-2xl border-2 overflow-hidden transition-colors duration-500",
          lightOn ? "border-forest/20 bg-wood/5" : "border-wood/15 bg-wood/20",
        ].join(" ")}
        role="img"
        aria-label={`Lamp preview in ${CONTEXT_LABELS[context].toLowerCase()} — light ${lightOn ? "on" : "off"}`}
      >
        {/* Room context background */}
        <div
          className={[
            "absolute inset-0 transition-opacity duration-500",
            lightOn ? "opacity-100" : "opacity-40",
          ].join(" ")}
        >
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-wood/10 to-transparent" />
        </div>

        {/* Lamp silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex flex-col items-center">
            {/* Glow effect when light is on */}
            {lightOn && (
              <div
                className="absolute rounded-full blur-3xl transition-opacity duration-500"
                style={{
                  width: `${Math.max(shape.topDiameter, shape.bottomDiameter) * 0.8}px`,
                  height: `${shape.height * 0.6}px`,
                  backgroundColor: lightColor,
                  opacity: glow * 0.5,
                }}
              />
            )}

            {/* Lamp body (simplified trapezoid) */}
            <svg
              viewBox="0 0 200 200"
              className="w-32 h-32 relative z-10"
              aria-hidden="true"
            >
              <defs>
                {lightOn && (
                  <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={lightColor} stopOpacity={glow * 0.6} />
                    <stop offset="100%" stopColor={lightColor} stopOpacity={0} />
                  </radialGradient>
                )}
              </defs>

              {lightOn && (
                <circle cx="100" cy="100" r="90" fill="url(#lamp-glow)" />
              )}

              <polygon
                points={`${100 - shape.topDiameter * 0.3},30 ${100 + shape.topDiameter * 0.3},30 ${100 + shape.bottomDiameter * 0.3},170 ${100 - shape.bottomDiameter * 0.3},170`}
                fill={lightOn ? lightColor : "#d4c5b0"}
                fillOpacity={lightOn ? 0.4 : 0.3}
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-wood/40"
              />
            </svg>
          </div>
        </div>

        {/* Room label */}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium text-wood/50 bg-white/70 px-2 py-1 rounded-lg">
            {CONTEXT_LABELS[context]}
          </span>
        </div>
      </div>

      {/* On/off toggle */}
      <div className="mt-5 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-wood">Light</span>
          <span className="text-xs text-wood/50 ml-2">
            {lightOn ? "On" : "Off"}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={lightOn}
          aria-label="Toggle lamp light"
          onClick={() => setLightOn((prev) => !prev)}
          className={[
            "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors duration-200",
            lightOn
              ? "border-forest bg-forest"
              : "border-wood/20 bg-wood/10",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
              lightOn ? "translate-x-5" : "translate-x-0.5",
            ].join(" ")}
          />
        </button>
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-xl bg-wood/5">
          <span className="block text-xs text-wood/50">Height</span>
          <span className="text-sm font-medium text-wood tabular-nums">
            {shape.height} mm
          </span>
        </div>
        <div className="text-center p-2 rounded-xl bg-wood/5">
          <span className="block text-xs text-wood/50">Warmth</span>
          <span className="text-sm font-medium text-wood tabular-nums">
            {light.colorTemperature} K
          </span>
        </div>
        <div className="text-center p-2 rounded-xl bg-wood/5">
          <span className="block text-xs text-wood/50">Pattern</span>
          <span className="text-sm font-medium text-wood">
            {patternId.replace("-", " ")}
          </span>
        </div>
      </div>
    </div>
  );
}
