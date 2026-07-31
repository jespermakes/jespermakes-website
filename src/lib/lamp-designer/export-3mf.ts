// Real 3MF export (DR-160 Phase C). A 3MF file is an OPC package: a zip
// (store method is fine) holding [Content_Types].xml, _rels/.rels and
// 3D/3dmodel.model. We write the zip ourselves: ~100 lines beats a
// dependency, and store-only keeps it deterministic and fast. Vertices
// are welded via quantized keys so the package is genuinely watertight.

import type { BufferGeometry } from "three";
import { buildExportGeometry } from "./export";
import type { LampParameters } from "./types";

// -- CRC32 (standard table) --------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// -- Minimal store-only zip writer -------------------------------------------

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

function buildZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0, true); // flags
    lv.setUint16(8, 0, true); // method: store
    lv.setUint16(10, 0, true); // time
    lv.setUint16(12, 0x21, true); // date (1980-01-01)
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra length
    local.set(nameBytes, 30);

    chunks.push(local, entry.data);

    const cd = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0x21, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    // extra, comment, disk, internal attrs, external attrs all 0
    cv.setUint32(42, offset, true);
    cd.set(nameBytes, 46);
    central.push(cd);

    offset += local.length + size;
  }

  const centralSize = central.reduce((sum, c) => sum + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  const total = offset + centralSize + eocd.length;
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of [...chunks, ...central, eocd]) {
    out.set(chunk, cursor);
    cursor += chunk.length;
  }
  return out;
}

// -- Mesh to 3MF model XML ---------------------------------------------------

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function geometryTo3mfModelXml(
  geometry: BufferGeometry,
  title: string
): string {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const triCount = index ? index.count / 3 : position.count / 3;

  // Weld vertices on quantized position so the mesh is watertight in the
  // file, not just in intent. +0 normalizes negative zero.
  const q = (v: number) => Math.round(v * 1000) / 1000 + 0;
  const idByKey = new Map<string, number>();
  const remap = new Int32Array(position.count);
  const vertexLines: string[] = [];

  for (let i = 0; i < position.count; i++) {
    const x = q(position.getX(i));
    const y = q(position.getY(i));
    const z = q(position.getZ(i));
    const key = `${x},${y},${z}`;
    let id = idByKey.get(key);
    if (id === undefined) {
      id = idByKey.size;
      idByKey.set(key, id);
      vertexLines.push(`<vertex x="${x}" y="${y}" z="${z}"/>`);
    }
    remap[i] = id;
  }

  const triangleLines: string[] = [];
  for (let t = 0; t < triCount; t++) {
    const a = remap[index ? index.getX(t * 3) : t * 3];
    const b = remap[index ? index.getX(t * 3 + 1) : t * 3 + 1];
    const c = remap[index ? index.getX(t * 3 + 2) : t * 3 + 2];
    if (a === b || b === c || a === c) continue; // drop degenerates
    triangleLines.push(`<triangle v1="${a}" v2="${b}" v3="${c}"/>`);
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">`,
    `<metadata name="Title">${escapeXml(title)}</metadata>`,
    `<metadata name="Designer">Jesper Makes Lamp Designer</metadata>`,
    `<metadata name="Description">LED bulbs only. Print walls-only, no infill in the shade.</metadata>`,
    `<resources>`,
    `<object id="1" type="model">`,
    `<mesh>`,
    `<vertices>`,
    vertexLines.join(""),
    `</vertices>`,
    `<triangles>`,
    triangleLines.join(""),
    `</triangles>`,
    `</mesh>`,
    `</object>`,
    `</resources>`,
    `<build><item objectid="1"/></build>`,
    `</model>`,
  ].join("\n");
}

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Target="/3D/3dmodel.model" Id="rel-1" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`;

export function lampTo3mfBytes(
  parameters: LampParameters,
  title = "Lamp"
): Uint8Array {
  const geometry = buildExportGeometry(parameters);
  try {
    const modelXml = geometryTo3mfModelXml(geometry, title);
    const encoder = new TextEncoder();
    return buildZip([
      { name: "[Content_Types].xml", data: encoder.encode(CONTENT_TYPES_XML) },
      { name: "_rels/.rels", data: encoder.encode(RELS_XML) },
      { name: "3D/3dmodel.model", data: encoder.encode(modelXml) },
    ]);
  } finally {
    geometry.dispose();
  }
}

export function lampTo3mfBlob(parameters: LampParameters, title = "Lamp"): Blob {
  // The bytes span their entire freshly-allocated buffer, so handing the
  // ArrayBuffer over is exact (and satisfies the BlobPart typing).
  return new Blob([lampTo3mfBytes(parameters, title).buffer as ArrayBuffer], {
    type: "model/3mf",
  });
}
