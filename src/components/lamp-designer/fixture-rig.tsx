"use client";

// The hardware the user will actually see: socket, bulb at true size,
// and per-mode context (cord, stem, foot). Drawn in mm in the lamp's
// local space (crown plane at y=0, shade interior toward +y), so it
// scales and orients together with the shade mesh.

import { getFixtureModule } from "@/lib/lamp-designer/fixtures";
import type { LampBuildInput } from "@/lib/lamp-designer/build";

export interface FixtureRigProps {
  parameters: LampBuildInput;
  lightColor: string;
  lightOn?: boolean;
}

/** Bulb center in the lamp's local mm space, for placing the light. */
export function bulbCenterLocal(parameters: LampBuildInput): [number, number, number] {
  const mod = getFixtureModule(parameters.fixture.moduleId);
  if (parameters.fixture.moduleId === "kit001-seat") {
    return [0, 12, 0];
  }
  const env = mod.bulbEnvelope;
  return [0, env.topOffset + env.diameter / 2, 0];
}

export function FixtureRig({ parameters, lightColor, lightOn = true }: FixtureRigProps) {
  const mod = getFixtureModule(parameters.fixture.moduleId);
  const env = mod.bulbEnvelope;
  const emissiveIntensity = lightOn ? 1.2 : 0;

  if (parameters.fixture.moduleId === "kit001-seat") {
    return (
      <group>
        {/* Kit 001 puck seated in the crown */}
        <mesh position={[0, 8, 0]}>
          <cylinderGeometry args={[34.5, 34.5, 16, 32]} />
          <meshStandardMaterial color="#2e2e2e" roughness={0.7} />
        </mesh>
        <mesh position={[0, 17, 0]}>
          <cylinderGeometry args={[30, 30, 2, 32]} />
          <meshStandardMaterial
            color="#fff6e0"
            emissive={lightColor}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
      </group>
    );
  }

  const socketRadius = (mod.apertureDiameter >= 40 ? 39 : 27) / 2;
  const bulbRadius = env.diameter / 2;
  const isCandle = env.diameter < 40;
  const center = env.topOffset + bulbRadius;

  return (
    <group>
      {/* Lamp holder body through the crown */}
      <mesh position={[0, env.topOffset / 2, 0]}>
        <cylinderGeometry args={[socketRadius, socketRadius - 2, env.topOffset, 32]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.85} />
      </mesh>
      {/* The bulb, at its true envelope size */}
      <mesh position={[0, center, 0]} scale={[1, isCandle ? 1.45 : 1.05, 1]}>
        <sphereGeometry args={[bulbRadius, 32, 24]} />
        <meshStandardMaterial
          color="#fff6e0"
          emissive={lightColor}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  );
}
