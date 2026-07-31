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
    expect(source).toContain("intensity={0.35}");
  });

  it("includes the point light at the bulb position", () => {
    expect(source).toContain("<pointLight");
    expect(source).toContain("position={bulb}");
    expect(source).toContain("castShadow");
  });

  it("renders the fixture rig with the real bulb", () => {
    expect(source).toContain("<FixtureRig");
    expect(source).toContain("bulbCenterLocal");
  });

  it("shows per-mode context: cord for pendants, stem and foot for table lamps", () => {
    expect(source).toContain('mode === "pendant"');
    expect(source).toContain('mode === "table"');
  });

  it("includes ground plane with shadow", () => {
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
    expect(source).toContain("parameters={parameters}");
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
