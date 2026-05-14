"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { ProfilePoint, ShapeParameters } from "@/lib/lamp-designer/types";
import { LampMesh } from "./lamp-mesh";

export interface LampSceneProps {
  profile: ProfilePoint[];
  shape: ShapeParameters;
  color?: string;
  glowIntensity?: number;
  glowColor?: string;
  opacity?: number;
  rotateSpeed?: number;
}

export function LampScene({
  profile,
  shape,
  color,
  glowIntensity,
  glowColor,
  opacity,
  rotateSpeed,
}: LampSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.2, 2.5], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight
        position={[0, 0.5, 0]}
        intensity={1.5}
        color="#ffb347"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      <LampMesh
        profile={profile}
        shape={shape}
        color={color}
        glowIntensity={glowIntensity}
        glowColor={glowColor}
        opacity={opacity}
        rotateSpeed={rotateSpeed}
      />

      {/* Ground plane with shadow */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[6, 6]} />
        <shadowMaterial opacity={0.25} />
      </mesh>

      <OrbitControls
        enablePan={false}
        minDistance={1}
        maxDistance={6}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
