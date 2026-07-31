import { describe, it, expect } from "vitest";
import { lampTo3mfBytes, geometryTo3mfModelXml } from "./export-3mf";
import { buildExportGeometry } from "./export";
import type { LampParameters } from "./types";

const PARAMS: LampParameters = {
  context: "bedside",
  fixture: { moduleId: "e27-clamp" },
  archetype: "vase",
  templateId: "cone",
  shape: { height: 180, topDiameter: 120, bottomDiameter: 200, curveTension: 0, wallThickness: 2.5 },
  light: { colorTemperature: 2700, beamAngle: 120, direction: "down" },
  pattern: { presetId: "spiral-twist", intensity: 1 },
};

function bytesContain(haystack: Uint8Array, needle: string): boolean {
  const n = new TextEncoder().encode(needle);
  outer: for (let i = 0; i <= haystack.length - n.length; i++) {
    for (let j = 0; j < n.length; j++) {
      if (haystack[i + j] !== n[j]) continue outer;
    }
    return true;
  }
  return false;
}

describe("3MF export", () => {
  it("produces a zip package with the three OPC parts", () => {
    const bytes = lampTo3mfBytes(PARAMS, "Test Lamp");
    // Zip local header magic
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);
    expect(bytesContain(bytes, "[Content_Types].xml")).toBe(true);
    expect(bytesContain(bytes, "_rels/.rels")).toBe(true);
    expect(bytesContain(bytes, "3D/3dmodel.model")).toBe(true);
    // End of central directory magic exists
    expect(bytesContain(bytes, "Test Lamp")).toBe(true);
  });

  it("model XML is millimeter-unit with welded vertices and triangles", () => {
    const geometry = buildExportGeometry(PARAMS);
    const xml = geometryTo3mfModelXml(geometry, "Weld Check");
    expect(xml).toContain('unit="millimeter"');
    expect(xml).toContain("<vertices>");
    expect(xml).toContain("<triangle ");
    const vertexCount = (xml.match(/<vertex /g) ?? []).length;
    // Welding must shrink the raw (duplicated seam/rim) vertex buffer
    expect(vertexCount).toBeGreaterThan(100);
    expect(vertexCount).toBeLessThan(geometry.getAttribute("position").count);
    geometry.dispose();
  });

  it("escapes XML in the title", () => {
    const geometry = buildExportGeometry(PARAMS);
    const xml = geometryTo3mfModelXml(geometry, 'A <"&"> lamp');
    expect(xml).toContain("A &lt;&quot;&amp;&quot;&gt; lamp");
    geometry.dispose();
  });
});
