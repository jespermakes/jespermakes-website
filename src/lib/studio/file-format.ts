import type { CuttingTool, MaterialSettings, Shape } from "./types";

/** Bumped any time a new field is added that older readers should reject. */
export const FILE_FORMAT_VERSION = 2;

export interface StudioDesignFile {
  version: 1 | 2;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  canvasSettings: {
    gridSpacing: number;
    snapToGrid: boolean;
    unitDisplay: "mm" | "in";
  };
  shapes: Shape[];
  // v2: manufacturing context
  material?: MaterialSettings;
  activeTool?: CuttingTool | null;
}

export function buildDesignFile(input: {
  name: string;
  description?: string;
  createdAt?: string;
  shapes: Shape[];
  gridSpacing: number;
  snapToGrid: boolean;
  unitDisplay: "mm" | "in";
  material?: MaterialSettings;
  activeTool?: CuttingTool | null;
}): StudioDesignFile {
  const now = new Date().toISOString();
  return {
    version: FILE_FORMAT_VERSION,
    name: input.name || "Untitled",
    description: input.description,
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    canvasSettings: {
      gridSpacing: input.gridSpacing,
      snapToGrid: input.snapToGrid,
      unitDisplay: input.unitDisplay,
    },
    shapes: input.shapes,
    material: input.material,
    activeTool: input.activeTool ?? null,
  };
}

export interface ParseResult {
  ok: true;
  file: StudioDesignFile;
}

export interface ParseError {
  ok: false;
  error: string;
}

export function parseDesignFile(json: string): ParseResult | ParseError {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Bad JSON" };
  }
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Not a design file." };
  }
  const obj = data as Record<string, unknown>;
  // Accept both v1 (shapes only) and v2 (shapes + material/activeTool).
  if (obj.version !== 1 && obj.version !== 2) {
    return {
      ok: false,
      error: `Unsupported file version: ${String(obj.version)}`,
    };
  }
  if (!Array.isArray(obj.shapes)) {
    return { ok: false, error: "Missing shapes array." };
  }
  const settings = obj.canvasSettings as Record<string, unknown> | undefined;
  const versionLiteral = obj.version === 2 ? 2 : 1;
  return {
    ok: true,
    file: {
      version: versionLiteral,
      name: typeof obj.name === "string" ? obj.name : "Untitled",
      description:
        typeof obj.description === "string" ? obj.description : undefined,
      createdAt:
        typeof obj.createdAt === "string"
          ? obj.createdAt
          : new Date().toISOString(),
      updatedAt:
        typeof obj.updatedAt === "string"
          ? obj.updatedAt
          : new Date().toISOString(),
      canvasSettings: {
        gridSpacing:
          typeof settings?.gridSpacing === "number"
            ? settings.gridSpacing
            : 10,
        snapToGrid:
          typeof settings?.snapToGrid === "boolean"
            ? settings.snapToGrid
            : true,
        unitDisplay:
          settings?.unitDisplay === "in" ? "in" : "mm",
      },
      shapes: obj.shapes as Shape[],
      material:
        obj.material && typeof obj.material === "object"
          ? (obj.material as MaterialSettings)
          : undefined,
      activeTool:
        obj.activeTool && typeof obj.activeTool === "object"
          ? (obj.activeTool as CuttingTool)
          : null,
    },
  };
}

export function downloadDesignFile(file: StudioDesignFile): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(file, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  const safeName = (file.name || "design")
    .replace(/[^a-z0-9-_ ]/gi, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  a.href = url;
  a.download = `${safeName || "design"}.jm.json`;
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
