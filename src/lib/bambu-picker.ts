/**
 * The printer picker. Pure: answers in, a recommendation and its reasons out.
 *
 * How it decides, in this order:
 *   1. Hard needs remove printers that cannot do the job: build size, the
 *      materials, a hardened nozzle for fibre filament, a box around it, a
 *      laser, a cutter.
 *   2. Of what is left, the cheapest one wins. Nobody needs a bigger printer
 *      than the job, and the lineup is ordered so that the cheaper machine
 *      that can do it is nearly always the sensible one.
 *   3. Lots of colours nudges toward the tool changers, because on a single
 *      nozzle every colour change purges filament, and on a 6 colour print
 *      that waste adds up.
 *   4. Budget is a soft limit. If nothing that can do the job fits it, we say
 *      so and show the cheapest one that can, rather than recommend a printer
 *      that cannot do what you asked.
 *
 * Imports are relative so vitest runs it without the Next path alias.
 */
import { PRINTERS, type Printer } from "../data/bambu/printers";

export type SizeAnswer = "small" | "medium" | "large";
export type ColourAnswer = "one" | "few" | "many";
export type MaterialAnswer = "pla" | "abs" | "engineering";
/** Carbon or glass fibre filament, which needs a hardened steel nozzle. */
export type FibreAnswer = "no" | "yes";
export type ExtraAnswer = "none" | "laser" | "cutter";
export type EnclosureAnswer = "yes" | "either";
export type BudgetAnswer = "entry" | "mid" | "high" | "any";
export type LevelAnswer = "beginner" | "some" | "pro";

export interface PickerAnswers {
  size: SizeAnswer;
  colour: ColourAnswer;
  material: MaterialAnswer;
  fibre: FibreAnswer;
  extra: ExtraAnswer;
  enclosure: EnclosureAnswer;
  budget: BudgetAnswer;
  level: LevelAnswer;
}

/** Smallest bed side, mm, each size answer needs. */
export const SIZE_MM: Record<SizeAnswer, number> = { small: 170, medium: 250, large: 320 };

/**
 * Budget bands in EUR, the printer price including the AMS when colours are
 * wanted. They are bands rather than exact numbers so a 10 euro price change
 * on Bambu's side does not flip a recommendation.
 */
export const BUDGET_EUR: Record<BudgetAnswer, number> = { entry: 400, mid: 900, high: 1800, any: Infinity };

export interface PickResult {
  printer: Printer;
  /** The store variant to buy: the combo when colours are wanted. */
  variant: string;
  reasons: string[];
  overBudget: boolean;
  /** One step up, when there is a sensible one. */
  stepUp: { printer: Printer; variant: string; why: string } | null;
  /** Hard needs nothing in the lineup meets. Empty when all were met. */
  unmet: string[];
}

export type PriceOf = (handle: string, variant: string) => number | null;

function variantFor(p: Printer, a: PickerAnswers): string {
  return a.colour !== "one" && p.comboVariant ? p.comboVariant : p.baseVariant;
}

function meetsSize(p: Printer, a: PickerAnswers) {
  const [w, d] = p.specs.build;
  return Math.min(w, d) >= SIZE_MM[a.size];
}
function meetsMaterial(p: Printer, a: PickerAnswers) {
  if (a.material === "pla") return true;
  if (a.material === "abs") return p.specs.enclosed;
  return p.specs.chamberHeatC != null;
}
function meetsFibre(p: Printer, a: PickerAnswers) {
  return a.fibre === "no" || p.specs.hardenedNozzle;
}
function meetsEnclosure(p: Printer, a: PickerAnswers) {
  return a.enclosure === "either" || p.specs.enclosed;
}
function meetsExtra(p: Printer, a: PickerAnswers) {
  if (a.extra === "laser") return p.laser != null;
  if (a.extra === "cutter") return p.cutter;
  return true;
}

const isToolChanger = (p: Printer) => /swap|changer/i.test(p.specs.heads);

function reasonsFor(p: Printer, a: PickerAnswers): string[] {
  const r: string[] = [];
  const [w, d, h] = p.specs.build;
  if (a.size === "small") r.push(`${w} × ${d} × ${h} mm of build space covers jigs, small parts and lamp fittings.`);
  else if (a.size === "medium") r.push(`The ${w} × ${d} mm bed takes most things people print, up to ${h} mm tall.`);
  else r.push(`${w} × ${d} × ${h} mm is big enough for a lamp shade or a helmet in one piece.`);

  if (a.material === "pla") r.push("PLA, PETG and TPU print fine on it, and those cover most projects.");
  if (a.material === "abs") r.push("It's closed in, which is what ABS and ASA need to stop the corners lifting.");
  if (a.material === "engineering")
    r.push(`The chamber heats to ${p.specs.chamberHeatC} °C and the nozzle goes to ${p.specs.maxNozzleC} °C, which is what nylon and PC want.`);
  if (a.fibre === "yes" && p.specs.hardenedNozzle)
    r.push("It comes with a hardened steel nozzle, so carbon and glass fibre filament won't wear it out.");

  if (a.colour === "few") r.push(`${p.multiColour}.`);
  if (a.colour === "many")
    r.push(
      isToolChanger(p)
        ? `${p.multiColour}, so a print in lots of colours wastes far less filament.`
        : `${p.multiColour}. It purges a little filament at every colour change, which is fine for a few colours.`,
    );

  if (a.enclosure === "yes" && p.specs.enclosed) r.push("It has a box around it, so less smell, less dust and fewer curious fingers or paws.");
  if (a.extra === "laser" && p.laser) r.push(`There's a ${p.laser} laser version for engraving and cutting wood, leather and dark acrylic.`);
  if (a.extra === "cutter" && p.cutter) r.push("There's a version with a blade cutter for vinyl, paper and thin leather.");
  if (a.level === "beginner" && p.series === "A") r.push("It calibrates itself, and the A series is about as easy as 3D printing gets.");
  if (p.mine) r.push("It's the printer I use myself, so this is the one I can tell you the most about.");
  return r;
}

function stepUpFor(chosen: Printer, pool: Printer[], a: PickerAnswers): PickResult["stepUp"] {
  const idx = PRINTERS.indexOf(chosen);
  // A printer of the same series and the same box is skipped as the step up,
  // unless it adds the hardened nozzle (the P1S to the P2S).
  const addsNozzle = (p: Printer) => p.specs.hardenedNozzle && !chosen.specs.hardenedNozzle;
  const next = pool.find(
    (p) => PRINTERS.indexOf(p) > idx && (p.series !== chosen.series || p.specs.enclosed !== chosen.specs.enclosed || addsNozzle(p)),
  );
  if (!next) return null;
  let why: string;
  if (!chosen.specs.enclosed && next.specs.enclosed) why = "a box around it, so ABS and ASA become possible later";
  else if (chosen.specs.chamberHeatC == null && next.specs.chamberHeatC != null) why = "a heated chamber, for nylon and PC";
  else if (addsNozzle(next)) why = "a hardened steel nozzle, so carbon and glass fibre filament becomes possible later";
  else if (Math.min(...next.specs.build.slice(0, 2)) > Math.min(...chosen.specs.build.slice(0, 2)))
    why = `a bigger bed, ${next.specs.build[0]} × ${next.specs.build[1]} mm`;
  else if (next.specs.heads !== chosen.specs.heads) why = `${next.specs.heads === "2" ? "two nozzles" : next.specs.heads}`;
  else why = "more speed and room to grow";
  return { printer: next, variant: variantFor(next, a), why };
}

export function pickPrinter(a: PickerAnswers, priceOf: PriceOf, printers: Printer[] = PRINTERS): PickResult {
  const checks: [string, (p: Printer) => boolean][] = [
    ["that build size", (p) => meetsSize(p, a)],
    ["those materials", (p) => meetsMaterial(p, a)],
    ["fibre filament", (p) => meetsFibre(p, a)],
    ["a closed printer", (p) => meetsEnclosure(p, a)],
    [a.extra === "laser" ? "a laser" : "a cutter", (p) => meetsExtra(p, a)],
  ];
  // Colour is not a hard need: every printer in the lineup takes an AMS.

  let pool = printers.filter((p) => checks.every(([, f]) => f(p)));
  const unmet: string[] = [];
  if (pool.length === 0) {
    // Drop needs one at a time from the back until something fits, and say which.
    pool = printers;
    for (const [label, f] of checks) {
      const next = pool.filter(f);
      if (next.length) pool = next;
      else unmet.push(label);
    }
  }

  // Lots of colours: prefer the tool changers when one is in the pool and the
  // budget allows it, otherwise the AMS route on a cheaper printer is fine.
  const cost = (p: Printer) => priceOf(p.handle, variantFor(p, a)) ?? Infinity;
  const ordered = [...pool].sort((x, y) => PRINTERS.indexOf(x) - PRINTERS.indexOf(y));
  const limit = BUDGET_EUR[a.budget];
  let choice: Printer | undefined;
  if (a.colour === "many") {
    choice = ordered.find((p) => isToolChanger(p) && cost(p) <= limit);
  }
  choice ??= ordered.find((p) => cost(p) <= limit || (cost(p) === Infinity && limit === Infinity));
  const overBudget = !choice;
  choice ??= ordered[0];

  return {
    printer: choice,
    variant: variantFor(choice, a),
    reasons: reasonsFor(choice, a),
    overBudget,
    stepUp: stepUpFor(choice, ordered, a),
    unmet,
  };
}
