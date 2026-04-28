import type { Shape } from "./types";

/** Bumped any time a new field is added that older readers should reject. */
export const FILE_FORMAT_VERSION = 1;

export interface StudioDesignFile {
  version: 1;
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
}

export function buildDesignFile(input: {
  name: string;
  description?: string;
  createdAt?: string;
  shapes: Shape[];
  gridSpacing: number;
  snapToGrid: boolean;
  unitDisplay: "mm" | "in";
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
  if (obj.version !== FILE_FORMAT_VERSION) {
    return {
      ok: false,
      error: `Unsupported file version: ${String(obj.version)}`,
    };
  }
  if (!Array.isArray(obj.shapes)) {
    return { ok: false, error: "Missing shapes array." };
  }
  const settings = obj.canvasSettings as Record<string, unknown> | undefined;
  return {
    ok: true,
    file: {
      version: 1,
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
