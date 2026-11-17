/**
 * Bambu's filament range, grouped the way you choose it: by what the part has
 * to survive, not by chemistry. Prices, colours and pack sizes come from
 * store-snapshot.json. What each one is for is written from Bambu's own
 * product descriptions on the store, in plain words.
 *
 * `needs` is the least printer that prints it well, and it matches the
 * materials line on each printer's spec page (printers.ts).
 */

export type FilamentNeeds = "any" | "hardened" | "enclosed" | "chamber";

export interface Filament {
  handle: string;
  /** Shorter than Bambu's own title where theirs repeats the brand. */
  name: string;
  for: string;
  needs: FilamentNeeds;
}

export interface FilamentGroup {
  key: string;
  title: string;
  intro: string;
  items: Filament[];
}

export const NEEDS_LABEL: Record<FilamentNeeds, string> = {
  any: "Any Bambu printer",
  hardened: "Hardened steel nozzle",
  enclosed: "Enclosed printer",
  chamber: "Enclosed, best with a heated chamber",
};

export const FILAMENT_GROUPS: FilamentGroup[] = [
  {
    key: "pla",
    title: "PLA, the one you'll use most",
    intro:
      "If you aren't sure what to buy, buy PLA, because it prints on every machine here and it's strong enough for jigs, organisers and most of what people print, it just doesn't like a hot car.",
    items: [
      { handle: "pla-basic-filament", name: "PLA Basic", for: "The everyday spool, the cheapest and the one with the most colours.", needs: "any" },
      { handle: "pla-matte", name: "PLA Matte", for: "Same as Basic with a flat finish that hides the layer lines.", needs: "any" },
      { handle: "pla-pure", name: "PLA Pure", for: "Low emission PLA that Bambu sells as toy safe and food contact grade, for printing in the house or for kids.", needs: "any" },
      { handle: "pla-tough-upgrade", name: "PLA Tough+", for: "PLA that takes a knock without snapping, for brackets, clips and shop jigs.", needs: "any" },
      { handle: "pla-cf", name: "PLA-CF", for: "Carbon fibre in PLA, so it's stiffer and has a nice dark matte look, but it wears a normal nozzle out.", needs: "hardened" },
      { handle: "pla-aero", name: "PLA Aero", for: "Foams up as it prints, so parts come out very light, which is what RC planes want.", needs: "any" },
    ],
  },
  {
    key: "pla-looks",
    title: "PLA for the looks",
    intro:
      "These print like normal PLA and the only difference is how they look, so this is the shelf for lamps, gifts and anything that sits on display.",
    items: [
      { handle: "pla-translucent", name: "PLA Translucent", for: "Frosted and see-through, so light comes through it, and that's the one to try for a lamp shade.", needs: "any" },
      { handle: "pla-silk-upgrade", name: "PLA Silk+", for: "Shiny, like satin, and it makes plain shapes look expensive.", needs: "any" },
      { handle: "pla-silk-multi-color", name: "PLA Silk Multi-Color", for: "Two silk colours in one strand, or a gradient, so the print changes colour as you walk around it.", needs: "any" },
      { handle: "pla-basic-gradient", name: "PLA Basic Gradient", for: "The colour shifts slowly along the spool, so a tall print fades from one colour to the next.", needs: "any" },
      { handle: "pla-wood", name: "PLA Wood", for: "PLA with wood in it. I'm a woodworker, so I've feelings about this one, but it does look and feel like wood.", needs: "any" },
      { handle: "pla-marble", name: "PLA Marble", for: "Speckled like stone, for planters and bases.", needs: "any" },
      { handle: "pla-metal", name: "PLA Metal", for: "A metallic finish without the weight of metal.", needs: "any" },
      { handle: "pla-sparkle", name: "PLA Sparkle", for: "Glitter in the plastic. If you need it you already know.", needs: "any" },
      { handle: "pla-galaxy", name: "PLA Galaxy", for: "Tiny glass spheres in it that catch the light, a bit like a night sky.", needs: "any" },
      { handle: "pla-glow", name: "PLA Glow", for: "Glows in the dark after it has been in the light.", needs: "any" },
      { handle: "pla-cmyk-lithophane", name: "PLA CMYK Lithophane Bundle", for: "4 spools, cyan, magenta, yellow and white, for printing a photo as a colour lithophane you light from behind.", needs: "any" },
    ],
  },
  {
    key: "petg",
    title: "PETG, tougher and happier in the heat",
    intro:
      "PETG bends a little before it breaks and it handles more heat and water than PLA, so it's good for things that live outside the house or in the workshop.",
    items: [
      { handle: "petg-basic", name: "PETG Basic", for: "The general purpose PETG, cheap and tough.", needs: "any" },
      { handle: "petg-matte", name: "PETG Matte", for: "PETG with a flat finish.", needs: "any" },
      { handle: "petg-translucent", name: "PETG Translucent", for: "See-through PETG, for light covers and things you want to see into.", needs: "any" },
      { handle: "petg-cf", name: "PETG-CF", for: "Carbon fibre PETG, stiff, with a dark matte surface.", needs: "hardened" },
    ],
  },
  {
    key: "abs-asa",
    title: "ABS and ASA, for heat and weather",
    intro:
      "These need a printer with a box around it, because they shrink as they cool and the corners lift in a cold room. ASA is the one for outside, it doesn't care about sun.",
    items: [
      { handle: "asa-filament", name: "ASA", for: "UV and weather resistant, for anything that lives outdoors.", needs: "enclosed" },
      { handle: "abs-filament", name: "ABS", for: "Heat and impact resistant, for parts that get knocked about or get warm.", needs: "enclosed" },
      { handle: "abs-gf", name: "ABS-GF", for: "Glass fibre ABS, stronger and stiffer than plain ABS.", needs: "enclosed" },
      { handle: "asa-cf", name: "ASA-CF", for: "Carbon fibre ASA for stiff outdoor parts.", needs: "enclosed" },
      { handle: "asa-aero", name: "ASA Aero", for: "Foaming ASA for light outdoor parts.", needs: "enclosed" },
    ],
  },
  {
    key: "tpu",
    title: "TPU, the soft one",
    intro:
      "Rubbery and flexible, for feet under a machine, phone cases, gaskets and anything that should bend and come back.",
    items: [
      { handle: "tpu-for-ams", name: "TPU for AMS", for: "Stiff enough to go through the AMS, so you can print soft and hard parts in one print.", needs: "any" },
      { handle: "tpu-95a-hf", name: "TPU 95A HF", for: "TPU that Bambu say prints 3 times faster than normal TPU 95A.", needs: "any" },
      { handle: "tpu-85a-tpu-90a", name: "TPU 85A / 90A", for: "Softer TPU, closer to real rubber.", needs: "any" },
    ],
  },
  {
    key: "engineering",
    title: "Engineering filaments",
    intro:
      "Nylon, polycarbonate and the fibre filled ones are for parts that take real load or real heat, and most of them want a heated chamber, a hardened steel nozzle and dry filament.",
    items: [
      { handle: "pc-filament", name: "PC", for: "Polycarbonate, very tough and heat resistant.", needs: "chamber" },
      { handle: "pc-fr", name: "PC FR", for: "Flame retardant polycarbonate.", needs: "chamber" },
      { handle: "pa6-cf", name: "PA6-CF", for: "Carbon fibre nylon, very stiff and strong.", needs: "chamber" },
      { handle: "pa6-gf", name: "PA6-GF", for: "Glass fibre nylon, strong and tough.", needs: "chamber" },
      { handle: "paht-cf", name: "PAHT-CF", for: "High temperature carbon fibre nylon for parts near heat.", needs: "chamber" },
      { handle: "pet-cf", name: "PET-CF", for: "Carbon fibre PET that hardly takes up moisture and keeps its shape in heat.", needs: "chamber" },
      { handle: "ppa-cf", name: "PPA-CF", for: "Carbon fibre PPA, for the hottest and stiffest jobs on the list.", needs: "chamber" },
      { handle: "pps-cf", name: "PPS-CF", for: "Heat and chemical resistant and flame retardant, for industrial use.", needs: "chamber" },
    ],
  },
  {
    key: "support",
    title: "Support materials",
    intro:
      "Print your supports in one of these and they come off clean, which needs an AMS or a second nozzle so the printer can switch between the part and the support.",
    items: [
      { handle: "support-for-pla-new", name: "Support for PLA", for: "Breakaway support for PLA parts.", needs: "any" },
      { handle: "support-for-pla-petg", name: "Support for PLA/PETG", for: "One support that works under both PLA and PETG.", needs: "any" },
      { handle: "pva", name: "PVA", for: "Dissolves in water, for shapes where you can't reach the support at all.", needs: "any" },
      { handle: "support-for-abs", name: "Support for ABS", for: "Breakaway support for ABS parts.", needs: "enclosed" },
      { handle: "support-for-pa-pet", name: "Support for PA/PET", for: "Support for nylon and PET parts.", needs: "chamber" },
    ],
  },
  {
    key: "packs",
    title: "Packs to start with",
    intro: "If you have just unboxed a printer, one of these gets you going without guessing at colours.",
    items: [
      { handle: "pla-basic-beginner-s-filament-pack", name: "PLA Basic Starter Classic Pack", for: "4 spools of PLA Basic in the classic colours.", needs: "any" },
      { handle: "pla-basic-color-trial-set", name: "PLA Basic Color Trial Set", for: "12 small 250 g spools, so you can try the colours before buying a full kilo.", needs: "any" },
    ],
  },
];

export const ALL_FILAMENT_HANDLES = FILAMENT_GROUPS.flatMap((g) => g.items.map((i) => i.handle));
