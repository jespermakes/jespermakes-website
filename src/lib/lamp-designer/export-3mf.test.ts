import { describe, it, expect } from "vitest";
import { BoxGeometry, BufferGeometry, Float32BufferAttribute } from "three";
import { unzipSync, strFromU8 } from "fflate";
import { exportGeometryTo3MF, exportGeometryTo3MFBlob } from "./export-3mf";

function unpackModel(zipData: Uint8Array): string {
  const files = unzipSync(zipData);
  return strFromU8(files["3D/3dmodel.model"]);
}

describe("exportGeometryTo3MF", () => {
  it("produces a valid ZIP with required 3MF entries", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    const result = exportGeometryTo3MF(geometry);

    const files = unzipSync(result);
    expect(files["[Content_Types].xml"]).toBeDefined();
    expect(files["_rels/.rels"]).toBeDefined();
    expect(files["3D/3dmodel.model"]).toBeDefined();
  });

  it("contains valid XML model with vertices and triangles", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    const modelXml = unpackModel(exportGeometryTo3MF(geometry));

    expect(modelXml).toContain('<?xml version="1.0"');
    expect(modelXml).toContain("<vertices>");
    expect(modelXml).toContain("<triangles>");
    expect(modelXml).toContain('unit="millimeter"');
  });

  it("exports correct vertex count for a box", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    const modelXml = unpackModel(exportGeometryTo3MF(geometry));

    const vertexMatches = modelXml.match(/<vertex /g);
    // BoxGeometry has 24 vertices (4 per face, 6 faces)
    expect(vertexMatches).toHaveLength(24);
  });

  it("exports correct triangle count for a box", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    const modelXml = unpackModel(exportGeometryTo3MF(geometry));

    const triangleMatches = modelXml.match(/<triangle /g);
    // 12 triangles (2 per face, 6 faces)
    expect(triangleMatches).toHaveLength(12);
  });

  it("throws on geometry without position attribute", () => {
    const geometry = new BufferGeometry();
    expect(() => exportGeometryTo3MF(geometry)).toThrow(
      "Geometry has no position attribute"
    );
  });

  it("handles non-indexed geometry", () => {
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));

    const modelXml = unpackModel(exportGeometryTo3MF(geometry));

    const vertexMatches = modelXml.match(/<vertex /g);
    expect(vertexMatches).toHaveLength(3);

    const triangleMatches = modelXml.match(/<triangle /g);
    expect(triangleMatches).toHaveLength(1);
    expect(modelXml).toContain('v1="0" v2="1" v3="2"');
  });

  it("includes correct content types and relationships", () => {
    const geometry = new BoxGeometry(5, 5, 5);
    const result = exportGeometryTo3MF(geometry);
    const files = unzipSync(result);

    const contentTypes = strFromU8(files["[Content_Types].xml"]);
    expect(contentTypes).toContain("3dmanufacturing-3dmodel+xml");

    const rels = strFromU8(files["_rels/.rels"]);
    expect(rels).toContain("/3D/3dmodel.model");
  });
});

describe("exportGeometryTo3MFBlob", () => {
  it("returns a Blob with correct type", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    const blob = exportGeometryTo3MFBlob(geometry);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toContain("3dmanufacturing");
    expect(blob.size).toBeGreaterThan(0);
  });
});
