import { describe, it, expect } from "vitest";
import { BoxGeometry, BufferGeometry, Float32BufferAttribute } from "three";
import { exportGeometryToSTL, exportGeometryToSTLBlob } from "./export-stl";

describe("exportGeometryToSTL", () => {
  it("exports a simple box geometry to binary STL", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    const result = exportGeometryToSTL(geometry);

    expect(result).toBeInstanceOf(DataView);
    // Binary STL: 80 byte header + 4 byte triangle count + (50 bytes per triangle)
    const triangleCount = result.getUint32(80, true);
    expect(triangleCount).toBeGreaterThan(0);
    const expectedSize = 80 + 4 + triangleCount * 50;
    expect(result.byteLength).toBe(expectedSize);
  });

  it("throws on geometry without position attribute", () => {
    const geometry = new BufferGeometry();
    expect(() => exportGeometryToSTL(geometry)).toThrow(
      "Geometry has no position attribute"
    );
  });

  it("handles indexed geometry correctly", () => {
    const geometry = new BoxGeometry(5, 5, 5);
    // BoxGeometry is indexed by default
    expect(geometry.index).not.toBeNull();
    const result = exportGeometryToSTL(geometry);
    const triangleCount = result.getUint32(80, true);
    // A box has 12 triangles (2 per face, 6 faces)
    expect(triangleCount).toBe(12);
  });

  it("handles non-indexed geometry", () => {
    const geometry = new BufferGeometry();
    // 1 triangle = 3 vertices, each with x,y,z
    const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));

    const result = exportGeometryToSTL(geometry);
    const triangleCount = result.getUint32(80, true);
    expect(triangleCount).toBe(1);
  });
});

describe("exportGeometryToSTLBlob", () => {
  it("returns a Blob with correct type", () => {
    const geometry = new BoxGeometry(10, 10, 10);
    const blob = exportGeometryToSTLBlob(geometry);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/octet-stream");
    expect(blob.size).toBeGreaterThan(0);
  });
});
