// Real file export for the lamp designer (DR-155 era fix: the old export
// buttons were placeholders). Builds the same geometry the 3D preview shows
// and serializes it to binary STL for slicers and MakerWorld.

import { BufferGeometry, Matrix4, Vector3 } from "three";
import { generateLampGeometry } from "./geometry";
import { buildLampProfile } from "./templates";
import type { LampParameters } from "./types";

/**
 * Build the printable geometry for a design. Identical inputs to the
 * preview mesh (shared buildLampProfile + shape), rotated so the lamp
 * stands on the build plate: the designer works Y-up in mm, slicers
 * expect Z-up.
 */
export function buildExportGeometry(parameters: LampParameters): BufferGeometry {
  const geometry = generateLampGeometry(buildLampProfile(parameters), parameters.shape);
  geometry.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));
  return geometry;
}

/**
 * Serialize a BufferGeometry to binary STL. Units pass through untouched
 * (geometry is in mm, which is what slicers assume for STL).
 */
export function geometryToBinaryStl(
  geometry: BufferGeometry,
  headerText = "Jesper Makes Lamp Designer",
): ArrayBuffer {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const triCount = index ? index.count / 3 : position.count / 3;

  const buffer = new ArrayBuffer(84 + triCount * 50);
  const view = new DataView(buffer);

  for (let i = 0; i < Math.min(headerText.length, 79); i++) {
    view.setUint8(i, headerText.charCodeAt(i) & 0x7f);
  }
  view.setUint32(80, triCount, true);

  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const ab = new Vector3();
  const cb = new Vector3();

  const readVertex = (i: number, out: Vector3) =>
    out.set(position.getX(i), position.getY(i), position.getZ(i));

  let offset = 84;
  for (let t = 0; t < triCount; t++) {
    const i0 = index ? index.getX(t * 3) : t * 3;
    const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;

    readVertex(i0, a);
    readVertex(i1, b);
    readVertex(i2, c);

    cb.subVectors(c, b);
    ab.subVectors(a, b);
    cb.cross(ab).normalize();

    view.setFloat32(offset, cb.x, true);
    view.setFloat32(offset + 4, cb.y, true);
    view.setFloat32(offset + 8, cb.z, true);
    offset += 12;

    for (const v of [a, b, c]) {
      view.setFloat32(offset, v.x, true);
      view.setFloat32(offset + 4, v.y, true);
      view.setFloat32(offset + 8, v.z, true);
      offset += 12;
    }

    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return buffer;
}

export function lampToStlBlob(parameters: LampParameters): Blob {
  const geometry = buildExportGeometry(parameters);
  try {
    const stl = geometryToBinaryStl(geometry);
    return new Blob([stl], { type: "model/stl" });
  } finally {
    geometry.dispose();
  }
}
