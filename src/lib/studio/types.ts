export type ShapeType = "rectangle" | "circle" | "line" | "text";

export type Tool = "select" | "rectangle" | "circle" | "line" | "text";

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  stroke: string;
  strokeWidth: number;
  fill: string;
  // Text-specific (only for type === "text")
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAnchor?: "start" | "middle" | "end";
}

export interface StudioDocument {
  shapes: Shape[];
  selectedIds: string[];
  viewportX: number;
  viewportY: number;
  zoom: number;
  gridSpacing: number;
  snapToGrid: boolean;
  unitDisplay: "mm" | "in";
}

export interface StudioHistory {
  past: HistorySnapshot[];
  present: HistorySnapshot;
  future: HistorySnapshot[];
}

export interface HistorySnapshot {
  shapes: Shape[];
  selectedIds: string[];
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
