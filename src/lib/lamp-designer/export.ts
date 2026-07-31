// Real file export for the lamp designer (DR-155 era fix: the old export
// buttons were placeholders). Builds the same geometry the 3D preview shows
// and serializes it to binary STL for slicers and MakerWorld.

import { BufferGeometry, Matrix4, Vector3 } from "three";
import { generateLampGeometry } from "./geometry";
import { buildLampGeometryYUp } from "./build";
import { getMountInterface } from "./fixtures";
import type { FixtureModuleId, LampParameters, ProfilePoint, ShapeParameters } from "./types";

function toZUp(geometry: BufferGeometry): BufferGeometry {
  geometry.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));
  return geometry;
}

/**
 * Build the printable geometry for a design: fixture crown + shade with
 * the pattern as real modulation, the exact geometry the preview renders,
 * rotated so the lamp stands on the build plate (designer is Y-up in mm,
 * slicers expect Z-up).
 */
export function buildExportGeometry(parameters: LampParameters): BufferGeometry {
  return toZUp(buildLampGeometryYUp(parameters));
}

/**
 * Fit-test coupon for a fixture module: the crown ring with a short
 * flared skirt. Prints in minutes and verifies the aperture against the
 * user's real hardware before they commit to a long shade print.
 */
export function buildFitCouponGeometry(moduleId: FixtureModuleId): BufferGeometry {
  const mount = getMountInterface(moduleId);
  const r0 = mount.apertureDiameter / 2;
  const r1 = r0 + mount.landWidth;
  const profile: ProfilePoint[] = [
    { x: r0, y: 0 },
    { x: r1, y: 0 },
    { x: r1 + 4, y: 6 },
  ];
  const couponShape: ShapeParameters = {
    height: 6,
    topDiameter: r0 * 2,
    bottomDiameter: (r1 + 4) * 2,
    curveTension: 0,
    wallThickness: 2.4,
  };
  return toZUp(
    generateLampGeometry(profile, couponShape, { profileSegments: 4 })
  );
}

export function couponToStlBlob(moduleId: FixtureModuleId): Blob {
  const geometry = buildFitCouponGeometry(moduleId);
  try {
    const stl = geometryToBinaryStl(geometry, `Jesper Makes fit coupon ${moduleId}`);
    return new Blob([stl], { type: "model/stl" });
  } finally {
    geometry.dispose();
  }
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
