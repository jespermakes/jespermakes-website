"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DoubleSide,
  type Mesh,
  Color,
  AdditiveBlending,
  CanvasTexture,
  RepeatWrapping,
} from "three";
import type {
  ProfilePoint,
  ShapeParameters,
  PatternId,
} from "@/lib/lamp-designer/types";
import { generateLampGeometry } from "@/lib/lamp-designer/geometry";
import { generatePatternCanvas } from "@/lib/lamp-designer/pattern-texture";

export interface LampMeshProps {
  profile: ProfilePoint[];
  shape: ShapeParameters;
  /** Pattern to apply as alpha map. Default: "smooth" (no pattern) */
  patternId?: PatternId;
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
  profile,
  shape,
  patternId = "smooth",
  color = "#f5f0e8",
  glowIntensity = 0.4,
  glowColor = "#ffb347",
  opacity = 0.85,
  rotateSpeed = 0.3,
}: LampMeshProps) {
  const outerRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);

  const geometry = useMemo(
    () => generateLampGeometry(profile, shape),
    [profile, shape]
  );

  const alphaMap = useMemo(() => {
    const canvas = generatePatternCanvas(patternId);
    if (!canvas) return null;
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(4, 2);
    return texture;
  }, [patternId]);

  useFrame((_state, delta) => {
    if (rotateSpeed === 0) return;
    const angle = delta * rotateSpeed;
    if (outerRef.current) outerRef.current.rotation.y += angle;
    if (glowRef.current) glowRef.current.rotation.y += angle;
  });

  return (
    <group scale={[MM_TO_SCENE, MM_TO_SCENE, MM_TO_SCENE]}>
      {/* Translucent outer shell */}
      <mesh ref={outerRef} geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={opacity}
          roughness={0.6}
          metalness={0}
          transmission={0.3}
          thickness={shape.wallThickness * MM_TO_SCENE}
          side={DoubleSide}
          depthWrite={false}
          alphaMap={alphaMap}
          alphaTest={0.05}
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
            alphaMap={alphaMap}
          />
        </mesh>
      )}
    </group>
  );
}
