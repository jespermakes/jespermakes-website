"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PRINTERS } from "@/data/bambu/printers";
import { pickPrinter, BUDGET_EUR, type PickerAnswers } from "@/lib/bambu-picker";
import { BAMBU_STORES, awinLink, type BambuStoreKey } from "@/lib/bambu-links";

export interface PickerPrinterView {
  handle: string;
  image: string | null;
  link: string;
  /** EUR price per variant, used for the budget bands. */
  eur: Record<string, number | null>;
  /** Price in the visitor's store, or null when we have not checked it. */
  shown: Record<string, { text: string; was: string | null } | null>;
}

type Key = keyof PickerAnswers;

interface Question {
  key: Key;
  title: string;
  hint?: string;
  options: { value: string; label: string; note?: string }[];
}

const QUESTIONS: Question[] = [
  {
    key: "size",
    title: "How big is the biggest thing you want to print?",
    hint: "In one piece. Bigger things can be printed in parts and glued, but it's nicer when you don't have to.",
    options: [
      { value: "small", label: "Small", note: "Up to about 17 cm, like jigs, clips, small parts and lamp fittings" },
      { value: "medium", label: "Medium", note: "Up to about 25 cm, which is most things people print" },
      { value: "large", label: "Large", note: "Over 30 cm, like lamp shades, helmets or big enclosures" },
    ],
  },
  {
    key: "colour",
    title: "One colour, or several in the same print?",
    options: [
      { value: "one", label: "One colour is fine", note: "You can still change the spool between prints" },
      { value: "few", label: "A few colours", note: "2 to 4, like a sign with lettering or a two tone part" },
      { value: "many", label: "Lots of colours", note: "Figures, maps, anything with 5 or more colours" },
    ],
  },
  {
    key: "material",
    title: "What does the part have to survive?",
    options: [
      { value: "pla", label: "Normal life indoors", note: "PLA, PETG and TPU, which covers most projects" },
      { value: "abs", label: "Heat, sun and weather", note: "ABS and ASA, for outdoor parts and things that get warm" },
      { value: "engineering", label: "Real load and real heat", note: "Nylon and PC" },
    ],
  },
  {
    key: "fibre",
    title: "Do you want to print carbon or glass fibre filament?",
    hint: "PLA-CF, PETG-CF, ASA-CF and the like have chopped fibre in them, which makes the parts stiffer but wears a normal nozzle out, so they need a hardened steel one.",
    options: [
      { value: "no", label: "No, normal filament is fine" },
      { value: "yes", label: "Yes, carbon or glass fibre", note: "For stiff brackets, jigs and parts that have to keep their shape" },
    ],
  },
  {
    key: "enclosure",
    title: "Where will it stand?",
    options: [
      { value: "yes", label: "In the house", note: "A box around it means less smell, less dust and fewer curious fingers or paws" },
      { value: "either", label: "Workshop or garage", note: "An open printer is fine here" },
    ],
  },
  {
    key: "extra",
    title: "Do you want it to do more than print?",
    options: [
      { value: "none", label: "Just print" },
      { value: "laser", label: "Laser engraving and cutting", note: "Wood, leather, dark acrylic" },
      { value: "cutter", label: "A blade cutter", note: "Vinyl, paper, stickers, thin leather" },
    ],
  },
  {
    key: "level",
    title: "How much have you printed before?",
    options: [
      { value: "beginner", label: "Never", note: "This is my first printer" },
      { value: "some", label: "A bit", note: "I've had a printer or used one" },
      { value: "pro", label: "A lot", note: "I know what I want, give me capability" },
    ],
  },
  {
    key: "budget",
    title: "How much do you want to spend?",
    hint: "The printer, plus the AMS if you want colours.",
    options: [
      { value: "entry", label: "Entry level" },
      { value: "mid", label: "Mid range" },
      { value: "high", label: "A serious machine" },
      { value: "any", label: "Whatever the job needs" },
    ],
  },
];

function budgetNote(value: string, store: BambuStoreKey): string | undefined {
  // EUR bands are only shown as numbers to people on the EU store. A US
  // visitor gets the band names; we have no checked USD prices to convert.
  if (store !== "eu") return undefined;
  const v = value as keyof typeof BUDGET_EUR;
  if (v === "entry") return `Up to about €${BUDGET_EUR.entry}`;
  if (v === "mid") return `Up to about €${BUDGET_EUR.mid}`;
  if (v === "high") return `Up to about €${BUDGET_EUR.high}`;
  return "Show me the right tool, price second";
}

export default function PickerClient({
  printers,
  store,
  checkedLabel,
}: {
  printers: PickerPrinterView[];
  store: BambuStoreKey;
  checkedLabel: string | null;
}) {
  const [answers, setAnswers] = useState<Partial<PickerAnswers>>({});
  const [step, setStep] = useState(0);

  const view = useMemo(() => Object.fromEntries(printers.map((p) => [p.handle, p])), [printers]);
  const done = step >= QUESTIONS.length;

  const result = useMemo(() => {
    if (!done) return null;
    return pickPrinter(answers as PickerAnswers, (handle, variant) => view[handle]?.eur[variant] ?? null);
  }, [done, answers, view]);

  function answer(key: Key, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  }

  if (!done) {
    const q = QUESTIONS[step];
    return (
      <div className="mt-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[#00AE42] transition-all" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
          </div>
          <span className="text-xs text-white/45">
            {step + 1} of {QUESTIONS.length}
          </span>
        </div>
        <h2 className="font-serif text-2xl font-medium leading-snug md:text-3xl">{q.title}</h2>
        {q.hint && <p className="mt-2 text-sm text-white/55">{q.hint}</p>}
        <div className="mt-6 grid gap-3">
          {q.options.map((o) => {
            const note = q.key === "budget" ? budgetNote(o.value, store) : o.note;
            const active = answers[q.key] === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => answer(q.key, o.value)}
                className={
                  "rounded-2xl border px-5 py-4 text-left transition-colors " +
                  (active ? "border-[#00AE42] bg-[#00AE42]/10" : "border-white/12 bg-white/[0.04] hover:border-[#00AE42]/60 hover:bg-white/[0.07]")
                }
              >
                <span className="block font-semibold">{o.label}</span>
                {note && <span className="mt-1 block text-sm text-white/55">{note}</span>}
              </button>
            );
          })}
        </div>
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="mt-6 text-sm text-white/50 hover:text-white">
            ← Back
          </button>
        )}
      </div>
    );
  }

  const r = result!;
  const p = r.printer;
  const v = view[p.handle];
  const price = v?.shown[r.variant];
  const step2 = r.stepUp ? view[r.stepUp.printer.handle] : null;
  const step2Price = r.stepUp && step2 ? step2.shown[r.stepUp.variant] : null;

  return (
    <div className="mt-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00AE42]">Your printer</p>
      <div className="mt-3 overflow-hidden rounded-3xl border border-[#00AE42]/50 bg-white/[0.04]">
        <div className="grid gap-0 md:grid-cols-[2fr_3fr]">
          <div className="bg-white">
            {v?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.image} alt={`Bambu Lab ${p.name}`} className="h-full w-full object-contain p-6" />
            )}
          </div>
          <div className="p-6 md:p-8">
            <h2 className="font-serif text-3xl font-medium">Bambu Lab {p.name}</h2>
            <p className="mt-1 text-sm text-white/55">{r.variant.replace(/^Bambu Lab /, "").replace(" / Standard", "")}</p>
            <div className="mt-4">
              {price ? (
                <span className="inline-flex flex-wrap items-baseline gap-x-2">
                  <span className="text-2xl font-semibold">{price.text}</span>
                  {price.was && <span className="text-sm text-white/40 line-through">{price.was}</span>}
                </span>
              ) : (
                <span className="text-sm text-white/55">See today&apos;s {BAMBU_STORES[store].currency} price at Bambu</span>
              )}
            </div>
            {r.overBudget && (
              <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-white/80">
                Nothing in your budget can do all of that, so this is the cheapest printer that can. Drop one of the
                answers and run it again if the budget is fixed.
              </p>
            )}
            {r.unmet.length > 0 && (
              <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-white/80">
                No Bambu printer does {r.unmet.join(" and ")} together with the rest of your answers, so this one leaves
                that part out.
              </p>
            )}
            <ul className="mt-5 space-y-2 text-sm leading-relaxed text-white/75">
              {r.reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span aria-hidden className="text-[#00AE42]">✓</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href={v?.link}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#00AE42] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#00c94c]"
              >
                See it at Bambu Lab <span aria-hidden>↗</span>
              </a>
              <a href={/store\.bambulab\.com/.test(p.specsUrl) ? awinLink(p.specsUrl) : p.specsUrl} target="_blank" rel={/store\.bambulab\.com/.test(p.specsUrl) ? "sponsored noopener noreferrer" : "noopener noreferrer"} className="text-sm font-semibold text-white/60 underline decoration-white/20 underline-offset-4 hover:text-white">
                Full specs
              </a>
            </div>
          </div>
        </div>
      </div>

      {r.stepUp && (
        <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <p className="text-sm text-white/70">
            <span className="font-semibold text-white">If you can stretch:</span> the {r.stepUp.printer.name} adds{" "}
            {r.stepUp.why}
            {step2Price ? `, at ${step2Price.text}` : ""}.{" "}
            <a
              href={step2?.link}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="font-semibold text-[#00AE42] underline decoration-[#00AE42]/40 underline-offset-4"
            >
              See the {r.stepUp.printer.name}
            </a>
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <button
          type="button"
          onClick={() => {
            setAnswers({});
            setStep(0);
          }}
          className="font-semibold text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white"
        >
          Start again
        </button>
        <Link href="/bambulab#compare" className="font-semibold text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white">
          Compare all {PRINTERS.length} printers
        </Link>
        <Link href="/bambulab/filament" className="font-semibold text-white/70 underline decoration-white/25 underline-offset-4 hover:text-white">
          Which filament?
        </Link>
      </div>
      <p className="mt-6 text-xs text-white/40">
        {checkedLabel
          ? `Prices as the ${BAMBU_STORES[store].label} showed them on ${checkedLabel}. The store page has the final word.`
          : `I've not checked prices on the ${BAMBU_STORES[store].label}, so the button shows you today's price there.`}
      </p>
    </div>
  );
}
