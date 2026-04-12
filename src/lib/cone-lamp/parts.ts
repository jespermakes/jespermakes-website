import {
  LEAVES,
  STRETCHER_A,
  STRETCHER_B,
  DISK_OUTER_R,
  DISK_SLOT_COUNT,
  DISK_SLOT_DEPTH,
  SVG_PER_MM,
} from "./constants";
import { parsePath, getBBox, type BBox } from "./path-utils";
import { surgeLeaf } from "./leaf-surgery";
import { surgeStretcher } from "./stretcher-surgery";
import { generateDisk } from "./disk-generator";

export type PartType = "leaf" | "stretcher" | "bottomDisk" | "topDisk";

export interface Part {
  key: string;
  label: string;
  count: number;
  sizeMM: { w: number; h: number };
  ringDescription: string;
  type: PartType;
  path: string;
  bbox: BBox;
}

export function generateAllParts(thicknessMM: number): Part[] {
  const widthSVG = thicknessMM * SVG_PER_MM;
  const parts: Part[] = [];

  for (const leaf of LEAVES) {
    const path = surgeLeaf(leaf.path, widthSVG);
    const bbox = getBBox(parsePath(path));
    parts.push({
      key: leaf.key,
      label: leaf.label,
      count: leaf.count,
      sizeMM: leaf.sizeMM,
      ringDescription: leaf.ringDescription,
      type: "leaf",
      path,
      bbox,
    });
  }

  const aPath = surgeStretcher(STRETCHER_A.path, widthSVG);
  parts.push({
    key: STRETCHER_A.key,
    label: STRETCHER_A.label,
    count: STRETCHER_A.count,
    sizeMM: STRETCHER_A.sizeMM,
    ringDescription: STRETCHER_A.ringDescription,
    type: "stretcher",
    path: aPath,
    bbox: getBBox(parsePath(aPath)),
  });

  const bPath = surgeStretcher(STRETCHER_B.path, widthSVG);
  parts.push({
    key: STRETCHER_B.key,
    label: STRETCHER_B.label,
    count: STRETCHER_B.count,
    sizeMM: STRETCHER_B.sizeMM,
    ringDescription: STRETCHER_B.ringDescription,
    type: "stretcher",
    path: bPath,
    bbox: getBBox(parsePath(bPath)),
  });

  const diskPath = generateDisk(
    DISK_OUTER_R,
    DISK_SLOT_COUNT,
    widthSVG,
    DISK_SLOT_DEPTH
  );
  const diskBBox: BBox = {
    minX: -DISK_OUTER_R,
    minY: -DISK_OUTER_R,
    maxX: DISK_OUTER_R,
    maxY: DISK_OUTER_R,
    width: DISK_OUTER_R * 2,
    height: DISK_OUTER_R * 2,
  };
  parts.push({
    key: "BOTTOM_DISK",
    label: "Bottom disk",
    count: 1,
    sizeMM: { w: 240, h: 240 },
    ringDescription: "with 88mm centre hole",
    type: "bottomDisk",
    path: diskPath,
    bbox: diskBBox,
  });
  parts.push({
    key: "TOP_DISK",
    label: "Top disk",
    count: 2,
    sizeMM: { w: 240, h: 240 },
    ringDescription: "with socket cutouts",
    type: "topDisk",
    path: diskPath,
    bbox: diskBBox,
  });

  return parts;
}
