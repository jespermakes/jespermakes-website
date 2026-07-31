"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Mesh, Color, AdditiveBlending } from "three";
import type { LampBuildInput } from "@/lib/lamp-designer/build";
import { buildLampGeometryYUp } from "@/lib/lamp-designer/build";

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
  /** Auto-rotate speed in radians/sec. 0 = off. Default: 0.3 */
  rotateSpeed?: number;
}

/** Scale factor: geometry is in mm, scene is in meters-ish units */
const MM_TO_SCENE = 0.005;

export function LampMesh({
  parameters,
  color = "#f5f0e8",
  glowIntensity = 0.4,
  glowColor = "#ffb347",
  opacity = 0.85,
  rotateSpeed = 0.3,
}: LampMeshProps) {
  const outerRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  // One pipeline: this is the same builder the STL export calls, so the
  // preview can never show geometry the print will not have.
  const geometry = useMemo(
    () => buildLampGeometryYUp(parameters),
    [parameters.templateId, parameters.shape, parameters.fixture, parameters.pattern]
  );

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame((_state, delta) => {
    if (rotateSpeed === 0) return;
    const angle = delta * rotateSpeed;
    if (outerRef.current) outerRef.current.rotation.y += angle;
    if (glowRef.current) glowRef.current.rotation.y += angle;
  });

  return (
    <group scale={[MM_TO_SCENE, MM_TO_SCENE, MM_TO_SCENE]}>
      {/* Translucent outer shell */}
      <mesh ref={outerRef} geometry={geometry} castShadow>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.6}
          metalness={0}
          transmission={0.3}
          thickness={parameters.shape.wallThickness * MM_TO_SCENE}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Inner glow layer */}
      {glowIntensity > 0 && (
        <mesh ref={glowRef} geometry={geometry}>
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
