import { exportSVG, downloadSVG } from "./export-svg";
import { compensatePath } from "./kerf";
import type { CuttingTool, MaterialSettings, Shape } from "./types";

export type ExportProfile =
  | "generic"
  | "shaper-origin"
  | "laser"
  | "cnc-router";

export const PROFILE_LABELS: Record<ExportProfile, string> = {
  generic: "Generic SVG",
  "shaper-origin": "Shaper Origin SVG",
  laser: "Laser Cutter SVG",
  "cnc-router": "CNC Router SVG",
};

export const PROFILE_DESCRIPTIONS: Record<ExportProfile, string> = {
  generic: "Works with any SVG-aware tool (Inkscape, Illustrator…).",
  "shaper-origin":
    "Color-encoded for Shaper Origin: black=interior, blue=exterior, red=on-line, gray=guide.",
  laser:
    "Hairline strokes for laser software (LightBurn, LaserGRBL, Glowforge): red=cut, blue=score, black=raster.",
  "cnc-router":
    "Closed paths only, plus a .json job sheet sidecar with material + bit notes.",
};

const PROFILE_STORAGE_KEY = "studio_export_profile";

/** Read the most-recently-used profile (from localStorage). */
export function readLastProfile(): ExportProfile {
  if (typeof window === "undefined") return "generic";
  try {
    const v = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (
      v === "generic" ||
      v === "shaper-origin" ||
      v === "laser" ||
      v === "cnc-router"
    ) {
      return v;
    }
  } catch {
    /* noop */
  }
  return "generic";
}

export function rememberProfile(profile: ExportProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, profile);
  } catch {
    /* noop */
  }
}

/* ----------------------------- Profile maps ---------------------------- */

// Shaper Origin's color convention (different from the studio's plan-mode
// palette): interior=black, exterior=blue, on-line=red, guide=gray.
function shaperColorForCutType(s: Shape): string {
  switch (s.cutType) {
    case "outside":
      return "#0000FF"; // exterior
    case "online":
      return "#FF0000"; // on-line
    case "guide":
      return "#808080"; // guide (not cut)
    case "inside":
    case "pocket":
    default:
      return "#000000"; // interior (default for unassigned too)
  }
}

function shaperColorize(s: Shape): Shape {
  return {
    ...s,
    stroke: shaperColorForCutType(s),
    fill: s.cutType === "pocket" ? "#000000" : "none",
  };
}

function laserize(s: Shape): Shape {
  // Default everything to "cut" (red) with hairline stroke. Pockets export
  // with a fill so laser raster engraves work.
  return {
    ...s,
    stroke: "#FF0000",
    strokeWidth: 0.001,
    fill: s.cutType === "pocket" ? "#000000" : "none",
  };
}

function isClosed(s: Shape): boolean {
  if (s.type === "rectangle" || s.type === "circle") return true;
  if (s.type === "line") return false;
  if (s.type === "text") return false;
  if (s.type === "path") return s.closed === true;
  return false;
}

interface ProfileResult {
  svg: string;
  sidecar?: { filename: string; content: string };
}

interface ProfileOptions {
  activeTool: CuttingTool | null;
  material: MaterialSettings | null;
}

/**
 * Replace each cut-typed shape with a kerf-compensated path-type shape
 * (so the rendered path matches the actual toolpath). On-line and guide
 * shapes pass through unchanged; shapes without a cut type also pass
 * through. Returns the original shape array if there's no tool or kerf.
 */
function withKerfCompensation(
  shapes: Shape[],
  activeTool: CuttingTool | null,
): Shape[] {
  if (!activeTool || activeTool.kerf <= 0) return shapes;
  return shapes.map((s) => {
    if (!s.cutType) return s;
    if (s.cutType === "online" || s.cutType === "guide") return s;
    const d = compensatePath(s, s.cutType, activeTool.kerf);
    if (!d) return s;
    // Replace with a type:"path" shape carrying the compensated d-string.
    // Preserve identity fields the export uses.
    return {
      ...s,
      type: "path" as const,
      pathData: d,
      points: undefined,
      closed: true,
    };
  });
}

function exportGeneric(shapes: Shape[]): ProfileResult {
  return { svg: exportSVG(shapes) };
}

function exportShaperOrigin(
  shapes: Shape[],
  opts: ProfileOptions,
): ProfileResult {
  // Note: shaper:cutDepth attribute injection isn't done here — the export
  // pipeline builds <rect>/<circle>/<path> markup without that hook. The
  // depth is recorded in the design file and the CNC sidecar; Shaper Origin
  // happily reads colour-encoded SVGs without the depth attribute.
  void opts;
  return { svg: exportSVG(shapes.map(shaperColorize)) };
}

function exportLaser(shapes: Shape[], opts: ProfileOptions): ProfileResult {
  // Apply kerf compensation so the cut produces parts at design dimensions.
  const compensated = withKerfCompensation(shapes, opts.activeTool);
  return { svg: exportSVG(compensated.map(laserize)) };
}

function exportCncRouter(
  shapes: Shape[],
  designName: string,
  opts: ProfileOptions,
): ProfileResult {
  const closed = shapes.filter(isClosed);
  const skipped = shapes.length - closed.length;
  const compensated = withKerfCompensation(closed, opts.activeTool);
  const svg = exportSVG(compensated);
  const bounds = computeBounds(closed);
  const sidecar = {
    generator: "Jesper Makes Studio",
    version: 2,
    designName,
    exportDate: new Date().toISOString(),
    units: "mm",
    material: opts.material
      ? {
          name: opts.material.name,
          width: opts.material.width,
          height: opts.material.height,
          thickness: opts.material.thickness,
        }
      : null,
    tool: opts.activeTool
      ? {
          name: opts.activeTool.name,
          type: opts.activeTool.type,
          diameter: opts.activeTool.diameter,
          kerf: opts.activeTool.kerf,
        }
      : null,
    boundingBox: bounds
      ? {
          width: Math.round((bounds.maxX - bounds.minX) * 1000) / 1000,
          height: Math.round((bounds.maxY - bounds.minY) * 1000) / 1000,
        }
      : { width: 0, height: 0 },
    shapesSkipped: skipped,
    shapes: closed.map((s) => ({
      id: s.id,
      type: s.type,
      cutType: s.cutType ?? null,
      cutDepth: s.cutDepth ?? null,
      dimensions: { width: s.width, height: s.height },
      tabs:
        s.tabs?.map((t) => ({
          position: t.position,
          width: t.width,
          height: t.height,
        })) ?? [],
      dogbones: s.dogboneCorners ?? [],
    })),
    notes:
      "Generated by Jesper Makes Studio. Cut paths in the SVG are kerf-compensated (outside cuts grew, inside cuts shrunk by kerf/2). Tab and dogbone positions are listed here — most CAM software reapplies them as toolpath operations rather than path geometry. Open paths, lines, and text were skipped.",
  };
  return {
    svg,
    sidecar: {
      filename: filenameForJobSheet(designName),
      content: JSON.stringify(sidecar, null, 2),
    },
  };
}

function computeBounds(
  shapes: Shape[],
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (shapes.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of shapes) {
    minX = Math.min(minX, s.x - s.width / 2);
    minY = Math.min(minY, s.y - s.height / 2);
    maxX = Math.max(maxX, s.x + s.width / 2);
    maxY = Math.max(maxY, s.y + s.height / 2);
  }
  return { minX, minY, maxX, maxY };
}

function safeSlug(name: string): string {
  return (
    name
      .replace(/[^a-z0-9-_ ]/gi, "")
      .replace(/\s+/g, "-")
      .toLowerCase() || "design"
  );
}

function filenameForExport(name: string, profile: ExportProfile): string {
  const slug = safeSlug(name);
  switch (profile) {
    case "generic":
      return `${slug}.svg`;
    case "shaper-origin":
      return `${slug}-shaper.svg`;
    case "laser":
      return `${slug}-laser.svg`;
    case "cnc-router":
      return `${slug}-cnc.svg`;
  }
}

function filenameForJobSheet(name: string): string {
  return `${safeSlug(name)}-cnc.job.json`;
}

export function exportWithProfile(
  shapes: Shape[],
  profile: ExportProfile,
  designName: string,
  opts: ProfileOptions = { activeTool: null, material: null },
): ProfileResult {
  switch (profile) {
    case "generic":
      return exportGeneric(shapes);
    case "shaper-origin":
      return exportShaperOrigin(shapes, opts);
    case "laser":
      return exportLaser(shapes, opts);
    case "cnc-router":
      return exportCncRouter(shapes, designName, opts);
  }
}

export function downloadProfileExport(
  shapes: Shape[],
  profile: ExportProfile,
  designName: string,
  opts: ProfileOptions = { activeTool: null, material: null },
): void {
  const result = exportWithProfile(shapes, profile, designName, opts);
  downloadSVG(result.svg, filenameForExport(designName, profile));
  if (result.sidecar) {
    if (typeof window === "undefined") return;
    const blob = new Blob([result.sidecar.content], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = result.sidecar.filename;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
