"use client";

// The preview scene is a vignette, not a floating shell: the bulb sits
// inside at true size, pendants hang from a cord and ceiling rose,
// table lamps stand on a stem and foot, the Kit 001 rests on the floor.
// Real-world anchors were Jesper's first hands-on feedback.

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import type { LampParameters } from "@/lib/lamp-designer/types";
import { getFixtureModule } from "@/lib/lamp-designer/fixtures";
import { lightColorFromTemperature } from "@/lib/lamp-designer/light-color";
import { LampMesh } from "./lamp-mesh";
import { FixtureRig, bulbCenterLocal } from "./fixture-rig";

/** Scene scale: geometry is mm, one scene unit is 200 mm. */
const MM_TO_SCENE = 0.005;

export interface LampSceneProps {
  parameters: LampParameters;
  color?: string;
  glowIntensity?: number;
  glowColor?: string;
  opacity?: number;
  rotateSpeed?: number;
}

function SpinGroup({
  speed,
  children,
}: {
  speed: number;
  children: React.ReactNode;
}) {
  const ref = useRef<Group>(null);
  useFrame((_state, delta) => {
    if (ref.current && speed !== 0) ref.current.rotation.y += delta * speed;
  });
  return <group ref={ref}>{children}</group>;
}

export function LampScene({
  parameters,
  color,
  glowIntensity,
  glowColor,
  opacity,
  rotateSpeed = 0.3,
}: LampSceneProps) {
  const mode = getFixtureModule(parameters.fixture.moduleId).mode;
  const lightColor = lightColorFromTemperature(parameters.light.colorTemperature);
  const bulb = bulbCenterLocal(parameters);

  // Per-mode placement. Local space: crown at origin, shade toward +y.
  const shadeHeightScene = parameters.shape.height * MM_TO_SCENE;
  const stemHeight = 1.3; // scene units of table stem (260 mm)
  const crownY =
    mode === "pendant" ? 1.9 : mode === "table" ? stemHeight : 0.01;
  const targetY =
    mode === "pendant"
      ? Math.max(1.0, crownY - shadeHeightScene / 2)
      : mode === "table"
        ? stemHeight + shadeHeightScene / 2
        : Math.max(0.35, shadeHeightScene / 2);
  const ceilingY = crownY + 0.45;

  return (
    <Canvas
      shadows
      camera={{ position: [0.6, 1.6, 3.0], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 2]} intensity={0.25} />

      {/* The lamp assembly: shade + real-size bulb + hardware + light,
          scaled and oriented together. Pendants flip so the crown is up. */}
      <group
        position={[0, crownY, 0]}
        rotation={mode === "pendant" ? [Math.PI, 0, 0] : [0, 0, 0]}
      >
        <SpinGroup speed={rotateSpeed}>
          <group scale={[MM_TO_SCENE, MM_TO_SCENE, MM_TO_SCENE]}>
            <LampMesh
              parameters={parameters}
              color={color}
              glowIntensity={glowIntensity}
              glowColor={glowColor}
              opacity={opacity}
            />
            <FixtureRig parameters={parameters} lightColor={lightColor} />
            <pointLight
              position={bulb}
              intensity={1.6}
              color={lightColor}
              castShadow
              shadow-mapSize-width={512}
              shadow-mapSize-height={512}
            />
          </group>
        </SpinGroup>
      </group>

      {/* Pendant context: cord and ceiling rose */}
      {mode === "pendant" && (
        <group>
          <mesh position={[0, (crownY + ceilingY) / 2, 0]}>
            <cylinderGeometry args={[0.01, 0.01, ceilingY - crownY, 12]} />
            <meshStandardMaterial color="#2b2b2b" />
          </mesh>
          <mesh position={[0, ceilingY, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.03, 24]} />
            <meshStandardMaterial color="#e8e0d2" />
          </mesh>
          <mesh position={[0, ceilingY + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 2.4]} />
            <meshStandardMaterial color="#efe8db" />
          </mesh>
        </group>
      )}

      {/* Table context: the stem and foot the shade mounts on */}
      {mode === "table" && (
        <group>
          <mesh position={[0, stemHeight / 2, 0]} castShadow>
            <cylinderGeometry args={[0.026, 0.026, stemHeight, 16]} />
            <meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.42, 0.04, 32]} />
            <meshStandardMaterial color="#2e2e2e" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#ece4d4" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <shadowMaterial opacity={0.22} />
      </mesh>

      {/* Back wall hint */}
      <mesh position={[0, 3, -3]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#f3ede1" />
      </mesh>

      <OrbitControls
        target={[0, targetY, 0]}
        enablePan={false}
        minDistance={1}
        maxDistance={7}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
