import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { pickPrinter, type PickerAnswers } from "./bambu-picker";
import { awinLink, productLink, storePageUrl, AWIN_AFFID, AWIN_MID } from "./bambu-links";
import { PRINTERS } from "../data/bambu/printers";
import { FILAMENT_GROUPS } from "../data/bambu/filaments";
import { ACCESSORY_GROUPS } from "../data/bambu/accessories";
import snapshot from "../data/bambu/store-snapshot.json";
import handles from "../data/bambu/handles.json";

type Snap = { products: Record<string, { eu?: { variants: { name: string; price: number }[]; checkedAt: string; currency: string } }> };
const SNAP = snapshot as unknown as Snap;

const eur = (handle: string, variant: string) =>
  SNAP.products[handle]?.eu?.variants.find((v) => v.name === variant)?.price ?? null;

const base: PickerAnswers = {
  size: "medium",
  colour: "one",
  material: "pla",
  extra: "none",
  enclosure: "either",
  budget: "any",
  level: "some",
};
const pick = (a: Partial<PickerAnswers>) => pickPrinter({ ...base, ...a }, eur);

describe("affiliate links", () => {
  it("uses the Awin pattern already on the /tools Bambu entries", () => {
    expect(productLink("eu", "h2d")).toBe(
      "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Feu.store.bambulab.com%2Fproducts%2Fh2d",
    );
    expect(productLink("us", "h2d")).toBe(
      "https://www.awin1.com/cread.php?awinmid=46345&awinaffid=2412491&ued=https%3A%2F%2Fstore.bambulab.com%2Fproducts%2Fh2d",
    );
  });

  it("round-trips the store URL through ued", () => {
    for (const store of ["eu", "us"] as const) {
      for (const h of Object.values(handles).flat()) {
        const u = new URL(productLink(store, h));
        expect(u.searchParams.get("awinmid")).toBe(AWIN_MID);
        expect(u.searchParams.get("awinaffid")).toBe(AWIN_AFFID);
        expect(u.searchParams.get("ued")).toBe(storePageUrl(store, h));
      }
    }
    expect(awinLink("https://eu.store.bambulab.com/collections/filament")).toContain("ued=https%3A%2F%2Feu.store.bambulab.com%2Fcollections%2Ffilament");
  });
});

describe("data", () => {
  const shown = [
    ...PRINTERS.map((p) => p.handle),
    ...FILAMENT_GROUPS.flatMap((g) => g.items.map((i) => i.handle)),
    ...ACCESSORY_GROUPS.flatMap((g) => g.items.map((i) => i.handle)),
  ];

  it("every product on the pages is in the refresh list", () => {
    const listed = new Set(Object.values(handles).flat());
    for (const h of shown) expect(listed.has(h), h).toBe(true);
  });

  it("every product on the pages has a dated EUR price from the store", () => {
    for (const h of shown) {
      const e = SNAP.products[h]?.eu;
      expect(e, h).toBeTruthy();
      expect(e!.currency).toBe("EUR");
      expect(Number.isNaN(Date.parse(e!.checkedAt))).toBe(false);
      expect(e!.variants.length, h).toBeGreaterThan(0);
    }
  });

  it("every printer's price variants exist on the store", () => {
    for (const p of PRINTERS) {
      expect(eur(p.handle, p.baseVariant), `${p.handle} ${p.baseVariant}`).not.toBeNull();
      if (p.comboVariant) expect(eur(p.handle, p.comboVariant), `${p.handle} ${p.comboVariant}`).not.toBeNull();
    }
  });

  it("the lineup runs cheapest first", () => {
    const prices = PRINTERS.map((p) => eur(p.handle, p.baseVariant)!);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });

  it("no long dashes anywhere in the section", () => {
    const files = [
      "src/data/bambu/printers.ts",
      "src/data/bambu/filaments.ts",
      "src/data/bambu/accessories.ts",
      "src/lib/bambu-picker.ts",
      "src/components/bambu/ui.tsx",
      "src/app/bambulab/page.tsx",
      "src/app/bambulab/picker/page.tsx",
      "src/app/bambulab/picker/picker-client.tsx",
      "src/app/bambulab/filament/page.tsx",
    ];
    for (const f of files) {
      const text = fs.readFileSync(path.join(__dirname, "..", "..", f), "utf8");
      expect(/[\u2013\u2014]/.test(text), f).toBe(false);
    }
  });
});

describe("picker", () => {
  it("a beginner printing small PLA things gets the A1 mini", () => {
    expect(pick({ size: "small", level: "beginner", budget: "entry" }).printer.handle).toBe("a1-mini");
  });

  it("medium PLA in one colour is the A1", () => {
    expect(pick({}).printer.handle).toBe("a1");
  });

  it("wanting colours picks the combo variant", () => {
    const r = pick({ colour: "few" });
    expect(r.printer.handle).toBe("a1");
    expect(r.variant).toBe("A1 Combo");
  });

  it("large prints on a small budget get the A2L", () => {
    expect(pick({ size: "large", budget: "entry" }).printer.handle).toBe("a2l");
  });

  it("ABS and ASA need a box, so the P1S", () => {
    expect(pick({ material: "abs" }).printer.handle).toBe("p1s");
  });

  it("in the house means enclosed even for PLA", () => {
    expect(pick({ enclosure: "yes" }).printer.handle).toBe("p1s");
  });

  it("engineering filament needs a heated chamber, so the X2D", () => {
    expect(pick({ material: "engineering" }).printer.handle).toBe("x2d");
  });

  it("a laser means an H2 machine, the H2S first", () => {
    expect(pick({ extra: "laser" }).printer.handle).toBe("h2s");
  });

  it("lots of colours with no budget limit goes to a tool changer", () => {
    expect(pick({ colour: "many", size: "large" }).printer.handle).toBe("h2c");
  });

  it("lots of colours on a small budget stays on the AMS route", () => {
    const r = pick({ colour: "many", budget: "entry" });
    expect(r.printer.series).toBe("A");
    expect(r.overBudget).toBe(false);
  });

  it("an impossible budget says so instead of lying", () => {
    const r = pick({ extra: "laser", budget: "entry" });
    expect(r.printer.handle).toBe("h2s");
    expect(r.overBudget).toBe(true);
  });

  it("always gives reasons, and a step up below the top", () => {
    for (const size of ["small", "medium", "large"] as const)
      for (const material of ["pla", "abs", "engineering"] as const) {
        const r = pick({ size, material });
        expect(r.reasons.length).toBeGreaterThan(1);
        expect(r.unmet).toEqual([]);
      }
    expect(pick({}).stepUp).not.toBeNull();
  });

  it("no reason text has a long dash", () => {
    for (const p of PRINTERS) {
      const r = pickPrinter({ ...base, colour: "many", extra: p.laser ? "laser" : "none", material: "engineering", enclosure: "yes", level: "beginner" }, eur, [p]);
      for (const reason of r.reasons) expect(/[\u2013\u2014]/.test(reason)).toBe(false);
    }
  });
});
