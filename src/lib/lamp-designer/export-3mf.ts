import { BufferGeometry } from "three";
import { zipSync, strToU8 } from "fflate";

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
</Types>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>`;

function buildModelXml(geometry: BufferGeometry): string {
  const posAttr = geometry.getAttribute("position");
  const index = geometry.index;

  // Collect vertices
  const vertexLines: string[] = [];
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    vertexLines.push(`        <vertex x="${x}" y="${y}" z="${z}" />`);
  }

  // Collect triangles
  const triangleLines: string[] = [];
  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      const v1 = index.getX(i);
      const v2 = index.getX(i + 1);
      const v3 = index.getX(i + 2);
      triangleLines.push(`        <triangle v1="${v1}" v2="${v2}" v3="${v3}" />`);
    }
  } else {
    for (let i = 0; i < posAttr.count; i += 3) {
      triangleLines.push(`        <triangle v1="${i}" v2="${i + 1}" v3="${i + 2}" />`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
  xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
${vertexLines.join("\n")}
        </vertices>
        <triangles>
${triangleLines.join("\n")}
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1" />
  </build>
</model>`;
}

/**
 * Export a BufferGeometry to 3MF format (ZIP containing XML mesh data).
 * Returns a Uint8Array of the ZIP file.
 */
export function exportGeometryTo3MF(geometry: BufferGeometry): Uint8Array {
  if (!geometry.getAttribute("position")) {
    throw new Error("Geometry has no position attribute");
  }

  const modelXml = buildModelXml(geometry);

  const zipData = zipSync({
    "[Content_Types].xml": strToU8(CONTENT_TYPES_XML),
    "_rels/.rels": strToU8(RELS_XML),
    "3D/3dmodel.model": strToU8(modelXml),
  });

  return zipData;
}

/**
 * Export a BufferGeometry to a downloadable 3MF Blob.
 */
export function exportGeometryTo3MFBlob(geometry: BufferGeometry): Blob {
  const data = exportGeometryTo3MF(geometry);
  return new Blob([data.buffer as ArrayBuffer], { type: "application/vnd.ms-package.3dmanufacturing-3dmodel+xml" });
}

/**
 * Trigger a browser download of a geometry as a 3MF file.
 */
export function download3MF(
  geometry: BufferGeometry,
  filename: string = "lamp.3mf"
): void {
  const blob = exportGeometryTo3MFBlob(geometry);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
