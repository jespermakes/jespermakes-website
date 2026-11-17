/**
 * The accessories worth knowing about, out of about 1,300 products on Bambu's
 * store (most of them spare parts). Prices from store-snapshot.json, the
 * "fits" lines from the store's own variant names.
 */

export interface Accessory {
  handle: string;
  name: string;
  for: string;
  fits: string;
}

export interface AccessoryGroup {
  key: string;
  title: string;
  intro: string;
  items: Accessory[];
}

export const ACCESSORY_GROUPS: AccessoryGroup[] = [
  {
    key: "ams",
    title: "AMS, the box that makes it multi-colour",
    intro:
      "The AMS holds 4 spools and feeds the printer whichever one the print asks for, so it's what turns a single colour printer into a 4 colour one, and on most printers you can chain several of them.",
    items: [
      { handle: "ams-lite", name: "AMS lite", for: "The open 4 spool feeder for the A series. A1 and A2 printers take one, so 4 colours is the most.", fits: "A1 mini, A1, A2L" },
      { handle: "ams-2-pro", name: "AMS 2 Pro", for: "The closed AMS that also dries filament, and it's the one in most of the combos.", fits: "Most printers, pick yours on the store page" },
      { handle: "ams-ht", name: "AMS HT", for: "Dries hotter than the AMS 2 Pro, up to 85 °C, for nylon and the other filaments that soak up water.", fits: "Most printers, pick yours on the store page" },
      { handle: "ams-multicolor-printing", name: "AMS", for: "The first generation AMS with 4 spools.", fits: "Most printers, pick yours on the store page" },
      { handle: "ams-hub", name: "AMS Hub", for: "Connects up to 4 AMS units to one printer, so 16 spools.", fits: "X1 and P1 series" },
      { handle: "ams-hub-a1-series", name: "AMS Hub for the A1 series", for: "The hub for the A1 series.", fits: "A1 series" },
    ],
  },
  {
    key: "plates",
    title: "Build plates",
    intro:
      "Every printer comes with a textured PEI plate, which is fine for most things. A second plate is the cheapest upgrade there's, because you can start the next print while the last one cools.",
    items: [
      { handle: "bambu-textured-pei-plate", name: "Textured PEI Plate", for: "The plate most printers ship with, and it leaves a fine texture on the bottom of the part.", fits: "Pick your printer on the store page" },
      { handle: "bambu-smooth-pei-plate", name: "Smooth PEI Plate", for: "A glossy bottom surface instead of the texture.", fits: "Pick your printer on the store page" },
      { handle: "bambu-dual-texture-pei-plate", name: "Dual-Texture PEI Plate", for: "Textured on one side and smooth on the other, two plates in one.", fits: "Pick your printer on the store page" },
      { handle: "bambu-cool-plate-supertack", name: "Cool Plate SuperTack", for: "A very sticky plate, for when a print won't stay down.", fits: "Pick your printer on the store page" },
      { handle: "bambu-engineering-plate", name: "Engineering Plate", for: "Bambu's plate for the engineering filaments.", fits: "Pick your printer on the store page" },
      { handle: "bambu-3d-effect-plate", name: "3D Effect Plate", for: "Prints a pattern into the bottom face of the part.", fits: "Pick your printer on the store page" },
    ],
  },
  {
    key: "hotends",
    title: "Hotends and nozzles",
    intro:
      "A 0.4 mm nozzle comes on every printer. A 0.2 mm does fine detail, a 0.6 or 0.8 mm prints big things much faster, and carbon or glass fibre filament wants hardened steel.",
    items: [
      { handle: "bambu-hotend-a1-a2", name: "Bambu Hotend, A1 and A2", for: "Spare or different size hotends in stainless or hardened steel.", fits: "A1 mini, A1, A2L" },
      { handle: "bambu-hotend-h2-p2s", name: "Bambu Hotend, H2, P2S and X2D", for: "Standard and high flow hotends in every size.", fits: "H2 series, P2S, X2D" },
      { handle: "multi-size-hotends-kit", name: "Multi-Size Hotends Kit", for: "The 0.2, 0.6 and 0.8 mm sizes in one box.", fits: "A2L, P2S, X2D, H2C and more" },
      { handle: "hardened-steel-upgrade-combo", name: "Hardened Steel Upgrade Combo", for: "Turns an A1 or P1 into a printer for the carbon fibre filaments.", fits: "A1 series, P1 series" },
    ],
  },
  {
    key: "laser",
    title: "Laser and cutting on the H2 series",
    intro:
      "The H2 machines take a laser module and a blade cutter on the same toolhead, so they can engrave a box lid and print the box. If you bought one without, these add it later.",
    items: [
      { handle: "laser-upgrade-kit", name: "Laser Upgrade Kit", for: "Everything to add a laser to an H2 printer, with the module, in 10 W or 40 W.", fits: "H2D, H2C (10 W or 40 W), H2S (10 W)" },
      { handle: "laser-module", name: "Laser Module", for: "The laser module on its own, 10 W or 40 W.", fits: "H2D, H2C (10 W or 40 W), H2S (10 W)" },
      { handle: "cutting-upgrade-kit-h2-series-a2l", name: "Cutting Upgrade Kit", for: "The blade cutter and pen holder, for vinyl, paper and thin leather.", fits: "H2 series, A2L" },
    ],
  },
  {
    key: "care",
    title: "Keeping it running",
    intro: "A few small parts wear out on every printer, the silicone sock on the hotend first, and this kit has them for your model.",
    items: [
      { handle: "printer-maintenance-kit", name: "Printer Maintenance Kit", for: "Silicone socks and the other small parts that wear out, matched to your printer.", fits: "Pick your printer" },
    ],
  },
];

export const ALL_ACCESSORY_HANDLES = ACCESSORY_GROUPS.flatMap((g) => g.items.map((i) => i.handle));
