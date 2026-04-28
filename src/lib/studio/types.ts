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

export type StudioMode = "design" | "plan" | "review";

export type CutType = "inside" | "outside" | "online" | "pocket" | "guide";

export interface MaterialSettings {
  width: number;
  height: number;
  thickness: number;
  name: string;
}

export interface CuttingTool {
  id: string;
  name: string;
  type: "router_bit" | "laser";
  diameter: number;
  kerf: number;
}

export interface TabDefinition {
  position: number;
  width: number;
  height: number;
}

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
  // Manufacturing (Phase 5)
  cutType?: CutType;
  cutDepth?: number;
  /**
   * Indices into points[] where dogbone fillets are applied (for path
   * shapes); for rectangles a non-empty array means "all four corners".
   */
  dogboneCorners?: number[];
  tabs?: TabDefinition[];
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
  // Phase 5 — manufacturing context
  mode: StudioMode;
  material: MaterialSettings;
  /** Currently active cutting tool (also persisted in localStorage). */
  activeToolId: string | null;
  /** Whether kerf compensation preview is shown in Plan mode. */
  showKerfCompensation: boolean;
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
