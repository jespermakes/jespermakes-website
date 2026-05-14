import { BufferGeometry, Mesh, MeshBasicMaterial } from "three";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

/**
 * Export a BufferGeometry to binary STL format.
 * Returns a DataView containing the binary STL data.
 */
export function exportGeometryToSTL(geometry: BufferGeometry): DataView {
  if (!geometry.getAttribute("position")) {
    throw new Error("Geometry has no position attribute");
  }

  geometry.computeVertexNormals();

  const mesh = new Mesh(geometry, new MeshBasicMaterial());
  const exporter = new STLExporter();
  // STLExporter.parse with binary: true returns a DataView
  const result = exporter.parse(mesh, { binary: true }) as unknown as DataView;

  return result;
}

/**
 * Export a BufferGeometry to a downloadable binary STL Blob.
 */
export function exportGeometryToSTLBlob(geometry: BufferGeometry): Blob {
  const dataView = exportGeometryToSTL(geometry);
  const buffer = dataView.buffer.slice(0) as ArrayBuffer;
  return new Blob([buffer], { type: "application/octet-stream" });
}

/**
 * Trigger a browser download of a geometry as a binary STL file.
 */
export function downloadSTL(
  geometry: BufferGeometry,
  filename: string = "lamp.stl"
): void {
  const blob = exportGeometryToSTLBlob(geometry);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
