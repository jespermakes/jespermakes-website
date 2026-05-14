"use client";

import { useMemo } from "react";
import { CanvasTexture, AdditiveBlending } from "three";
import type { PatternId, ShapeParameters } from "@/lib/lamp-designer/types";
import { generateShadowProjectionCanvas } from "@/lib/lamp-designer/shadow-projection";

export interface ShadowProjectionPlaneProps {
  patternId: PatternId;
  shape: ShapeParameters;
  /** Projection intensity multiplier. Default: 0.6 */
  intensity?: number;
}

/**
 * Ground-plane mesh that shows projected light patterns from lamp
 * perforations. Rendered as a circular disc beneath the lamp using
 * additive blending so the warm light patches layer naturally over
 * the existing shadow material.
 */
export function ShadowProjectionPlane({
  patternId,
  shape,
  intensity = 0.6,
}: ShadowProjectionPlaneProps) {
  const texture = useMemo(() => {
    const canvas = generateShadowProjectionCanvas(patternId, shape);
    if (!canvas) return null;
    return new CanvasTexture(canvas);
  }, [patternId, shape]);

  if (!texture) return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.005, 0]}
    >
      <circleGeometry args={[1.8, 64]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={intensity}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
