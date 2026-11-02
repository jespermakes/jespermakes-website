// Printed lamps (DR-301): only lamps that were printed on the H2D and judged
// good, in a few variants. Every variant here was built on the Spark by the
// script that made the printed lamp, checked (a slice every 0.5 mm, overhang,
// the gcode) and sliced with the printed lamp's own settings. The data file is
// written by ~/bambu/printed/tools/manifest.py and holds ONLY variants whose
// gate was empty; nothing here generates geometry.

import data from "../data/printed-lamps.json";

export interface PrintedFilament {
  name: string;
  colour: string;
  grams: number;
  nozzle: "left" | "right";
  /** set when the filament is for another part than the shade (the Cradle base) */
  part?: string;
}

export interface PrintedFiles {
  project3mf: string;
  project3mfMb: number;
  stlZip: string;
  stlZipMb: number;
  /** more parts printed per variant, each its own 3MF (the Cradle base) */
  extra?: { label: string; path: string; mb: number }[];
}

export interface PrintedVariant {
  id: string;
  params: Record<string, number>;
  /** true only for the variant identical to the lamp that was printed */
  printed: boolean;
  /** the lamp as it stands, foot or base included */
  heightMm: number;
  /** the tallest single print */
  printHeightMm: number;
  widthMm: number;
  printTime: string;
  filaments: PrintedFilament[];
  files: PrintedFiles;
  image: string;
  imageLit?: string;
}

export interface PrintedKnob {
  key: string;
  label: string;
  unit?: string;
  values: number[];
  /** display label per value, same order as values */
  labels?: string[];
}

export interface PrintedPart {
  name: string;
  note: string;
  printTime?: string;
  filaments?: PrintedFilament[];
  files?: PrintedFiles;
}

export interface PrintedLamp {
  id: string;
  name: string;
  blurb: string;
  printedNote: string;
  knobs: PrintedKnob[];
  hardware: string[];
  parts: PrintedPart[];
  variants: PrintedVariant[];
}

export interface PrintedLampsData {
  generated: string;
  lamps: PrintedLamp[];
}

export const PRINTED_LAMPS = (data as PrintedLampsData).lamps;

/** Where the download files live: Vercel Blob in production, a local folder on the Spark for review. */
export function fileUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_PRINTED_LAMPS_FILES ?? "").replace(/\/$/, "");
  return `${base}/${path}`;
}

/** 0.218 -> "218 KB", 119.1 -> "119 MB" */
export function formatSize(mb: number): string {
  if (mb < 1) return `${Math.max(1, Math.round(mb * 1000))} KB`;
  return `${Math.round(mb)} MB`;
}

export function findVariant(
  lamp: PrintedLamp,
  params: Record<string, number>
): PrintedVariant | undefined {
  return lamp.variants.find((v) =>
    lamp.knobs.every((k) => v.params[k.key] === params[k.key])
  );
}

/** The variant a lamp opens on: the one that was printed, else the first. */
export function defaultVariant(lamp: PrintedLamp): PrintedVariant {
  return lamp.variants.find((v) => v.printed) ?? lamp.variants[0];
}

/** Is there a checked variant with this knob value, the other knobs as they are? */
export function hasVariant(
  lamp: PrintedLamp,
  params: Record<string, number>,
  key: string,
  value: number
): boolean {
  return findVariant(lamp, { ...params, [key]: value }) !== undefined;
}
