"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DoubleSide,
  Color,
  AdditiveBlending,
  TextureLoader,
  SRGBColorSpace,
  type Texture,
} from "three";
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
  const [moonMaps, setMoonMaps] = useState<{ map: Texture; bump: Texture } | null>(null);

  // The lithophane lives in the wall thickness, invisible on plain
  // geometry: the preview drapes NASA's color map over the sphere so the
  // moon reads as the moon (the print, lit, shows the same surface).
  useEffect(() => {
    if (parameters.archetype !== "moon" || moonMaps) return;
    let live = true;
    const loader = new TextureLoader();
    Promise.all([
      loader.loadAsync("/images/lamp-designer/moon-color.jpg"),
      loader.loadAsync("/images/lamp-designer/moon-height.jpg"),
    ])
      .then(([map, bump]) => {
        map.colorSpace = SRGBColorSpace;
        if (live) setMoonMaps({ map, bump });
      })
      .catch((err) => console.error("Moon texture load failed:", err));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameters.archetype]);

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

  const isMoon = parameters.archetype === "moon";

  return (
    <group>
      {/* Outer shell: translucent shade, or the moon with its surface */}
      <mesh geometry={geometry} castShadow>
        {isMoon ? (
          <meshStandardMaterial
            color="#f2efe8"
            map={moonMaps?.map ?? null}
            bumpMap={moonMaps?.bump ?? null}
            bumpScale={2.2}
            emissive={new Color("#ffc98c").multiplyScalar(glowIntensity > 0 ? 1 : 0)}
            emissiveMap={moonMaps?.map ?? null}
            emissiveIntensity={0.55}
            roughness={0.95}
            metalness={0}
          />
        ) : (
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
        )}
      </mesh>

      {/* Inner glow layer (the moon glows through its emissive map) */}
      {!isMoon && glowIntensity > 0 && (
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
