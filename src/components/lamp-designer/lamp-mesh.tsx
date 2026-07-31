"use client";

import { useEffect, useMemo, useState } from "react";
import { DoubleSide, Color, AdditiveBlending } from "three";
import type { LampBuildInput } from "@/lib/lamp-designer/build";
import { buildLampGeometryYUp } from "@/lib/lamp-designer/build";
import { getLoadedMoonField, loadMoonHeightField } from "@/lib/lamp-designer/moonfield";

export interface LampMeshProps {
  /** The design. The mesh builds the exact geometry the export writes. */
  parameters: LampBuildInput;
  /** Outer shell color. Default: warm white */
  color?: string;
  /** Glow intensity for inner light. 0 = off, 1 = full. Default: 0.4 */
  glowIntensity?: number;
  /** Glow color. Default: warm amber */
  glowColor?: string;
  /** Outer shell opacity. Default: 0.85 */
  opacity?: number;
}

/**
 * The shade itself, in local mm space (crown plane at y=0, shade toward
 * +y). The scene provides scale, orientation and rotation so the shade,
 * bulb and hardware always move together.
 */
export function LampMesh({
  parameters,
  color = "#f5f0e8",
  glowIntensity = 0.4,
  glowColor = "#ffb347",
  opacity = 0.85,
}: LampMeshProps) {
  const [fieldVersion, setFieldVersion] = useState(0);

  useEffect(() => {
    if (parameters.archetype !== "moon" || getLoadedMoonField()) return;
    let cancelled = false;
    loadMoonHeightField()
      .then(() => {
        if (!cancelled) setFieldVersion((v) => v + 1);
      })
      .catch((err) => console.error("Moon height map load failed:", err));
    return () => {
      cancelled = true;
    };
  }, [parameters.archetype]);

  // One pipeline: this is the same builder the STL export calls, so the
  // preview can never show geometry the print will not have.
  const geometry = useMemo(
    () => buildLampGeometryYUp(parameters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      parameters.archetype,
      parameters.templateId,
      parameters.shape,
      parameters.fixture,
      parameters.pattern,
      fieldVersion,
    ]
  );

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <group>
      {/* Translucent outer shell */}
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.6}
          metalness={0}
          transmission={0.3}
          thickness={parameters.shape.wallThickness * 0.005}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Inner glow layer */}
      {glowIntensity > 0 && (
        <mesh geometry={geometry}>
          <meshBasicMaterial
            color={new Color(glowColor).multiplyScalar(glowIntensity)}
            transparent
            opacity={glowIntensity * 0.3}
            blending={AdditiveBlending}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
