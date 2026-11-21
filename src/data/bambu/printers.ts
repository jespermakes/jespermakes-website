/**
 * The Bambu Lab printer lineup, cheapest first.
 *
 * Every number in `specs` was read off Bambu's own technical specification
 * page for that printer (specsUrl) on SPECS_CHECKED. The P1S has no spec page
 * on bambulab.com any more (it 404s), so its numbers come from the spec table
 * on its EU store page. Prices are NOT here: they live in store-snapshot.json
 * and are refreshed by scripts/bambu-refresh.mjs.
 *
 * The X1E and the H2D Pro are left out of the lineup on purpose. Both are on
 * the EU store without a price you can pay (the X1E is parked at 99999, the
 * H2D Pro has no priced variant), so they are sold to companies on request and
 * there is nothing for a reader to compare.
 */

export const SPECS_CHECKED = "2026-11-17";

/**
 * The nozzle line was read off the same specsUrl pages on this date, for the
 * picker's fibre question. Only a printer whose page says the nozzle it ships
 * with is hardened steel counts, so a printer that needs a nozzle swap first
 * (the A2L says so on its page) is false.
 */
export const NOZZLES_CHECKED = "2026-11-21";

/** What a printer can realistically print, in the order people grow into it. */
export type MaterialTier = "basic" | "enclosed" | "engineering";

export interface PrinterSpecs {
  /** Largest single-nozzle volume, mm. */
  build: [number, number, number];
  /** Extra build-volume wording when the printer has more than one nozzle. */
  buildNote?: string;
  enclosed: boolean;
  /** Active chamber heating, max chamber temperature in °C, or null. */
  chamberHeatC: number | null;
  /** Nozzle it ships with, as the spec page names it. */
  nozzle: "Stainless Steel" | "Hardened Steel";
  /**
   * Ships with a hardened steel nozzle, so carbon and glass fibre filament
   * does not wear it out. Must agree with `nozzle`; a test checks it.
   */
  hardenedNozzle: boolean;
  maxNozzleC: number;
  maxBedC: number;
  maxSpeed: number;
  /** "1", "2" or the tool changer count. */
  heads: string;
  weightKg: number;
  /** Filament line straight from the spec page, shortened only where it repeats. */
  filamentLine: string;
}

export interface Printer {
  handle: string;
  name: string;
  series: "A" | "P" | "X" | "H";
  specsUrl: string;
  specs: PrinterSpecs;
  /** Store variant names, exactly as Bambu lists them, for the two price columns. */
  baseVariant: string;
  comboVariant?: string;
  /** What the combo adds, in a few words. */
  comboAdds?: string;
  /** How many colours or materials in one print, and with what. */
  multiColour: string;
  materials: MaterialTier;
  laser: null | "10W" | "10W or 40W";
  /** Laser is an add-on you buy later rather than a version you buy now. */
  laserAddOn?: boolean;
  cutter: boolean;
  /** One or two lines in Jesper's voice. */
  blurb: string;
  /** Marked when it is the printer Jesper actually runs. */
  mine?: boolean;
}

export const PRINTERS: Printer[] = [
  {
    handle: "a1-mini",
    name: "A1 mini",
    series: "A",
    specsUrl: "https://bambulab.com/en/a1-mini/tech-specs",
    specs: {
      build: [180, 180, 180],
      enclosed: false,
      chamberHeatC: null,
      // specsUrl, 21 Nov 2026: "Nozzle: Stainless Steel", and carbon or glass fibre is "Not Recommended"
      nozzle: "Stainless Steel",
      hardenedNozzle: false,
      maxNozzleC: 300,
      maxBedC: 80,
      maxSpeed: 500,
      heads: "1",
      weightKg: 5.5,
      filamentLine: "PLA, PETG, TPU and PVA. ABS, ASA, PC, PA and fibre filled filament aren't recommended.",
    },
    baseVariant: "A1 mini",
    comboVariant: "A1 mini Combo",
    comboAdds: "AMS lite",
    multiColour: "4 colours with the AMS lite",
    materials: "basic",
    laser: null,
    cutter: false,
    blurb:
      "The cheapest way in, and it's small, so a box of shop jigs or a few lamp parts is fine but a big lamp shade won't fit on an 18 cm bed.",
  },
  {
    handle: "a1",
    name: "A1",
    series: "A",
    specsUrl: "https://bambulab.com/en/a1/tech-specs",
    specs: {
      build: [256, 256, 256],
      enclosed: false,
      chamberHeatC: null,
      // specsUrl, 21 Nov 2026: "Nozzle: Stainless Steel", and carbon or glass fibre is "Not Recommended"
      nozzle: "Stainless Steel",
      hardenedNozzle: false,
      maxNozzleC: 300,
      maxBedC: 100,
      maxSpeed: 500,
      heads: "1",
      weightKg: 8.3,
      filamentLine: "PLA, PETG, TPU and PVA. ABS, ASA, PC, PA and fibre filled filament aren't recommended.",
    },
    baseVariant: "A1",
    comboVariant: "A1 Combo",
    comboAdds: "AMS lite",
    multiColour: "4 colours with the AMS lite",
    materials: "basic",
    laser: null,
    cutter: false,
    blurb:
      "Same idea as the mini with a 25 cm bed, and that's the size most things you'll ever print fit on, so for PLA and PETG this is the one I would point a beginner at.",
  },
  {
    handle: "a2l",
    name: "A2L",
    series: "A",
    specsUrl: "https://bambulab.com/en/a2l/specs",
    specs: {
      build: [330, 320, 325],
      enclosed: false,
      chamberHeatC: null,
      // specsUrl, 21 Nov 2026: "Nozzle: Stainless Steel"; PLA-CF and PETG-CF only after "Replace with Hardened Steel Nozzle"
      nozzle: "Stainless Steel",
      hardenedNozzle: false,
      maxNozzleC: 300,
      maxBedC: 80,
      maxSpeed: 500,
      heads: "1",
      weightKg: 12.8,
      filamentLine: "PLA, PETG, TPU and PVA, and PLA-CF and PETG-CF once you fit a hardened steel nozzle.",
    },
    baseVariant: "A2L",
    comboVariant: "A2L Combo",
    comboAdds: "AMS lite",
    multiColour: "4 colours with the AMS lite",
    materials: "basic",
    laser: null,
    cutter: true,
    blurb:
      "A big open printer for not much money, 33 cm across, and the Cutting Full Combo adds a blade and a pen, so you can cut vinyl and paper on the same machine.",
  },
  {
    handle: "p1s",
    name: "P1S",
    series: "P",
    specsUrl: "https://eu.store.bambulab.com/products/p1s",
    specs: {
      build: [256, 256, 256],
      enclosed: true,
      chamberHeatC: null,
      // specsUrl (the spec table on the store page), 21 Nov 2026: "Nozzle: 0.4 mm Stainless Steel Included"
      nozzle: "Stainless Steel",
      hardenedNozzle: false,
      maxNozzleC: 300,
      maxBedC: 100,
      maxSpeed: 500,
      heads: "1",
      weightKg: 12.95,
      filamentLine: "Ideal for PLA, PETG, TPU, PVA, PET, ABS and ASA, and capable of PA and PC.",
    },
    baseVariant: "P1S",
    comboVariant: "P1S AMS Combo",
    comboAdds: "AMS",
    multiColour: "4 colours with one AMS, more with extra units",
    materials: "enclosed",
    laser: null,
    cutter: false,
    blurb:
      "The cheapest printer with a box around it, and the box is what lets ABS and ASA print without warping, so this is where outdoor parts start.",
  },
  {
    handle: "p2s",
    name: "P2S",
    series: "P",
    specsUrl: "https://bambulab.com/en/p2s/specs",
    specs: {
      build: [256, 256, 256],
      enclosed: true,
      chamberHeatC: null,
      // specsUrl, 21 Nov 2026: "Nozzle: Hardened Steel"
      nozzle: "Hardened Steel",
      hardenedNozzle: true,
      maxNozzleC: 300,
      maxBedC: 110,
      maxSpeed: 600,
      heads: "1",
      weightKg: 14.9,
      filamentLine:
        "PLA, PETG, ABS, ASA, TPU, PET, PA, PC, PVA and the supports, plus PLA-CF, PETG-CF, ABS-GF, ASA-CF, PA6-CF, PA6-GF, PAHT-CF, PPA-CF and PET-CF.",
    },
    baseVariant: "P2S",
    comboVariant: "P2S Combo",
    comboAdds: "AMS 2 Pro",
    multiColour: "Up to 20 colours with several AMS units",
    materials: "enclosed",
    laser: null,
    cutter: false,
    blurb:
      "The newer P, with the same 25 cm bed as the P1S but a hardened steel nozzle from the start, so the fibre filled filaments are on the menu too.",
  },
  {
    handle: "x2d",
    name: "X2D",
    series: "X",
    specsUrl: "https://bambulab.com/en/x2d/specs",
    specs: {
      build: [256, 256, 260],
      buildNote: "Two nozzles, 235.5 × 256 × 256 mm when both print",
      enclosed: true,
      chamberHeatC: 65,
      // specsUrl, 21 Nov 2026: "Nozzle: Hardened Steel"
      nozzle: "Hardened Steel",
      hardenedNozzle: true,
      maxNozzleC: 300,
      maxBedC: 120,
      maxSpeed: 1000,
      heads: "2",
      weightKg: 16.25,
      filamentLine:
        "PLA, PETG, ABS, ASA, TPU, PET, PA, PC, PVA and the supports, plus carbon and glass filled PLA, PETG, ABS, ASA, PA6, PAHT, PPA and PET on the main nozzle.",
    },
    baseVariant: "X2D",
    comboVariant: "X2D AMS Combo",
    comboAdds: "AMS 2 Pro",
    multiColour: "Two nozzles plus AMS, so support in one material and the part in another",
    materials: "engineering",
    laser: null,
    cutter: false,
    blurb:
      "Two nozzles and a heated chamber at a price well under the H2 machines, and the second nozzle is mostly there so support material comes off clean.",
  },
  {
    handle: "h2s",
    name: "H2S",
    series: "H",
    specsUrl: "https://bambulab.com/en/h2s/tech-specs",
    specs: {
      build: [340, 320, 340],
      enclosed: true,
      chamberHeatC: 65,
      // specsUrl, 21 Nov 2026: "Nozzle: Hardened Steel"
      nozzle: "Hardened Steel",
      hardenedNozzle: true,
      maxNozzleC: 350,
      maxBedC: 120,
      maxSpeed: 1000,
      heads: "1",
      weightKg: 30,
      filamentLine:
        "PLA, PETG, TPU, PVA, BVOH, ABS, ASA, PC, PA, PET and PPS, and the carbon and glass filled versions of PLA, PETG, PA, PET, PC, ABS, ASA, PPA and PPS.",
    },
    baseVariant: "H2S",
    comboVariant: "H2S AMS Combo",
    comboAdds: "AMS 2 Pro",
    multiColour: "Single nozzle with AMS",
    materials: "engineering",
    laser: "10W",
    cutter: true,
    blurb:
      "The biggest build volume Bambu make, 34 cm tall, with one nozzle, and there's a Laser Full Combo with a 10 W laser and the cutting module if you want those as well.",
  },
  {
    handle: "h2d",
    name: "H2D",
    series: "H",
    specsUrl: "https://bambulab.com/en/h2d/tech-specs",
    specs: {
      build: [325, 320, 325],
      buildNote: "350 × 320 × 320 mm across both nozzles",
      enclosed: true,
      chamberHeatC: 65,
      // specsUrl, 21 Nov 2026: "Nozzle: Hardened Steel"
      nozzle: "Hardened Steel",
      hardenedNozzle: true,
      maxNozzleC: 350,
      maxBedC: 120,
      maxSpeed: 1000,
      heads: "2",
      weightKg: 31,
      filamentLine:
        "PLA, PETG, TPU, PVA, BVOH, ABS, ASA, PC, PA and PET, the carbon and glass filled versions of all of those, and PPA-CF/GF, PPS and PPS-CF/GF.",
    },
    baseVariant: "H2D / Standard",
    comboVariant: "H2D AMS Combo / Standard",
    comboAdds: "AMS 2 Pro",
    multiColour: "Two nozzles plus AMS, two materials in one print without purging between them",
    materials: "engineering",
    laser: "10W or 40W",
    cutter: true,
    blurb:
      "This is the one in my workshop, and every lamp in A Study Into Light came off it. Two nozzles, a heated chamber, and the Laser Full Combo adds a 10 W or 40 W laser and a blade cutter.",
    mine: true,
  },
  {
    handle: "h2c",
    name: "H2C",
    series: "H",
    specsUrl: "https://bambulab.com/en/h2c/specs",
    specs: {
      build: [325, 320, 320],
      buildNote: "330 × 320 × 320 mm across both nozzles",
      enclosed: true,
      chamberHeatC: 65,
      // specsUrl, 21 Nov 2026: "Nozzle: Hardened Steel"
      nozzle: "Hardened Steel",
      hardenedNozzle: true,
      maxNozzleC: 350,
      maxBedC: 120,
      maxSpeed: 1000,
      heads: "7 swapping hotends",
      weightKg: 32.5,
      filamentLine: "The same list as the H2D, from PLA and PETG up to PPA and PPS with carbon or glass fibre.",
    },
    baseVariant: "H2C AMS Combo / Standard",
    multiColour: "7 hotends that swap themselves and up to 24 filaments, with very little purge waste",
    materials: "engineering",
    laser: "10W or 40W",
    cutter: true,
    blurb:
      "An H2D body with a hotend changer, so a print in 6 colours throws away a lot less filament between layers, and the Laser Full Combo brings the laser and the cutter.",
  },
  {
    handle: "h3c",
    name: "H3C",
    series: "H",
    specsUrl: "https://bambulab.com/en/h3c/specs",
    specs: {
      build: [330, 320, 325],
      enclosed: true,
      chamberHeatC: 65,
      // specsUrl, 21 Nov 2026: "Included Nozzle Material: Hardened Steel"
      nozzle: "Hardened Steel",
      hardenedNozzle: true,
      maxNozzleC: 350,
      maxBedC: 120,
      maxSpeed: 1400,
      heads: "9 tool changer",
      weightKg: 36.28,
      filamentLine:
        "PLA, PETG, PCTG, TPU, EVA, PE, PP, PHA, PVA, BVOH, ABS, ASA, HIPS, PA, PAHT, PC, PET, PPA and PPS, and the carbon and glass filled versions, with drying built in.",
    },
    baseVariant: "Bambu Lab H3C Combo",
    multiColour: "9 tools that switch in about 6 seconds, AMS 3H with filament drying included",
    materials: "engineering",
    laser: null,
    cutter: true,
    blurb:
      "The top of the range, a 9 tool changer that dries its own filament, and it takes add-on tools for cutting and drawing. It's a lot of printer, and you know if you need it.",
  },
];

export function printerByHandle(handle: string): Printer | undefined {
  return PRINTERS.find((p) => p.handle === handle);
}
