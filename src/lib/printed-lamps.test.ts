import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  PRINTED_LAMPS,
  fileUrl,
  defaultVariant,
  findVariant,
  hasVariant,
} from "./printed-lamps";

// The data file is written by ~/bambu/printed/tools/manifest.py from the
// variants whose gate was empty. These tests guard the page against a hand
// edit or a broken manifest: everything it offers must be complete.

describe("printed lamps data", () => {
  it("has lamps", () => {
    expect(PRINTED_LAMPS.length).toBeGreaterThan(0);
  });

  for (const lamp of PRINTED_LAMPS) {
    describe(lamp.name, () => {
      it("marks the variant that was printed (Cloudy Fluff was printed in 2 versions)", () => {
        const printed = lamp.variants.filter((v) => v.printed).length;
        expect(printed).toBeGreaterThanOrEqual(1);
        expect(printed).toBeLessThanOrEqual(lamp.id === "fluff" ? 2 : 1);
      });

      it("opens on the printed variant", () => {
        expect(defaultVariant(lamp).printed).toBe(true);
      });

      it("every variant has both downloads, a print time, filaments and a render on disk", () => {
        for (const v of lamp.variants) {
          expect(v.files.project3mf).toMatch(/\.3mf$/);
          expect(v.files.stlZip).toMatch(/\.zip$/);
          expect(v.printTime).toMatch(/^\d+h \d{2}m$/);
          expect(v.filaments.length).toBeGreaterThan(0);
          expect(existsSync(join(process.cwd(), "public", v.image))).toBe(true);
        }
      });

      it("every variant is reachable with the knobs", () => {
        for (const v of lamp.variants) {
          expect(findVariant(lamp, v.params)).toBe(v);
          for (const k of lamp.knobs) {
            expect(k.values).toContain(v.params[k.key]);
            expect(hasVariant(lamp, v.params, k.key, v.params[k.key])).toBe(true);
          }
        }
      });

      it("every print fits the H2D (325 mm tall, 320 mm deep; the widest Twisted Ruff shade is 302 mm and printed)", () => {
        for (const v of lamp.variants) {
          expect(v.printHeightMm).toBeLessThanOrEqual(325);
          expect(v.widthMm).toBeLessThanOrEqual(320);
        }
      });
    });
  }
});

describe("download links", () => {
  it("point at the Blob store and ask for an attachment", () => {
    const url = fileUrl(PRINTED_LAMPS[0].variants[0].files.project3mf);
    expect(url).toMatch(/^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/printed-lamps\/.+\.3mf\?download=1$/);
  });
});
