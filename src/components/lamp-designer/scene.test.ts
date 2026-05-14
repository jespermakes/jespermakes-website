import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(dir, "scene.tsx"), "utf-8");

describe("LampScene component structure", () => {
  it("exports LampScene function", () => {
    expect(source).toContain("export function LampScene");
  });

  it("exports LampSceneProps interface", () => {
    expect(source).toContain("export interface LampSceneProps");
  });

  it("renders R3F Canvas with shadows", () => {
    expect(source).toMatch(/Canvas[\s\S]*shadows/);
  });

  it("includes ambient light", () => {
    expect(source).toContain("<ambientLight");
    expect(source).toContain("intensity={0.4}");
  });

  it("includes point light as bulb inside the lamp", () => {
    expect(source).toContain("<pointLight");
    expect(source).toContain('position={[0, 0.5, 0]}');
    expect(source).toContain('color="#ffb347"');
    expect(source).toContain("castShadow");
  });

  it("includes ground plane with shadow at y=-0.01", () => {
    expect(source).toContain('position={[0, -0.01, 0]}');
    expect(source).toContain("receiveShadow");
    expect(source).toContain("<planeGeometry");
    expect(source).toContain("<shadowMaterial");
  });

  it("includes OrbitControls restricted to upper hemisphere", () => {
    expect(source).toContain("<OrbitControls");
    expect(source).toContain("maxPolarAngle={Math.PI / 2}");
    expect(source).toContain("enablePan={false}");
  });

  it("renders LampMesh with forwarded props", () => {
    expect(source).toContain("<LampMesh");
    expect(source).toContain("profile={profile}");
    expect(source).toContain("shape={shape}");
  });
});

describe("LampSceneDynamic wrapper", () => {
  const dynamicSource = readFileSync(resolve(dir, "scene-dynamic.tsx"), "utf-8");

  it("uses next/dynamic import", () => {
    expect(dynamicSource).toContain('from "next/dynamic"');
    expect(dynamicSource).toContain("dynamic<LampSceneProps>");
  });

  it("disables SSR", () => {
    expect(dynamicSource).toContain("ssr: false");
  });

  it("imports from ./scene", () => {
    expect(dynamicSource).toContain('import("./scene")');
  });
});
