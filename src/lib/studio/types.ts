export type ShapeType = "rectangle" | "circle" | "line" | "text" | "path";

export type Tool =
  | "select"
  | "rectangle"
  | "circle"
  | "line"
  | "text"
  | "pen"
  | "polygon"
  | "arc";

export interface PathPoint {
  x: number;
  y: number;
  /** Cubic-bezier control point coming INTO this point (in absolute mm). */
  handleIn?: { x: number; y: number };
  /** Cubic-bezier control point going OUT of this point (in absolute mm). */
  handleOut?: { x: number; y: number };
}

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
  // Rectangle-specific (only for type === "rectangle")
  cornerRadius?: number;
  // Path-specific (only for type === "path")
  points?: PathPoint[];
  closed?: boolean;
  /**
   * Raw SVG path data — used for compound paths produced by booleans or SVG
   * import. When present, it takes precedence over `points` for rendering.
   */
  pathData?: string;
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
