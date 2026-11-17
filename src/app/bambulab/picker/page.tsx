import type { Metadata } from "next";
import { PRINTERS } from "@/data/bambu/printers";
import { resolveBambuStore } from "@/lib/bambu-store-server";
import { checkedDate, priceFor, productLink, snapshotAny, snapshotFor } from "@/lib/bambu-shop";
import { Disclosure, SectionHeader } from "@/components/bambu/ui";
import PickerClient, { type PickerPrinterView } from "./picker-client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Which Bambu Lab printer should I buy?",
  description:
    "7 questions about what you want to print, how big, in what material and for how much, and you get the Bambu Lab printer that fits, with the reasons and today's store price.",
  alternates: { canonical: "https://jespermakes.com/bambulab/picker" },
};

/**
 * Server shell. The questions are client state, but prices and tracked links
 * are resolved here for the visitor's store so the price file never ships to
 * the browser.
 *
 * Budget bands are compared against EUR prices for everyone. They are bands,
 * not exact numbers, and the EU store is the one we have checked; a US visitor
 * sees no number in the budget question, only the band names.
 */
export default async function PickerPage() {
  const { store } = await resolveBambuStore();

  const printers: PickerPrinterView[] = PRINTERS.map((p) => {
    const variants = [p.baseVariant, p.comboVariant].filter(Boolean) as string[];
    const eur: Record<string, number | null> = {};
    const shown: Record<string, { text: string; was: string | null } | null> = {};
    for (const v of variants) {
      eur[v] = priceFor(p.handle, "eu", v)?.from ?? null;
      const s = priceFor(p.handle, store, v);
      shown[v] = s ? { text: s.text, was: s.was } : null;
    }
    return {
      handle: p.handle,
      image: snapshotAny(p.handle)?.image ?? null,
      link: productLink(store, p.handle),
      eur,
      shown,
    };
  });

  const checked = snapshotFor("a1", store)?.checkedAt;

  return (
    <div className="min-h-screen bg-[#111311] text-white">
      <SectionHeader store={store} here={{ label: "Printer picker" }} />
      <section className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-5 md:pt-14">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00AE42]">The printer picker</p>
        <h1 className="font-serif text-3xl font-medium leading-tight md:text-5xl">Which Bambu Lab printer is yours?</h1>
        <p className="mt-4 text-white/65 leading-relaxed">
          7 quick questions, and at the end you get one printer with the reasons it fits, because the cheapest printer
          that can do your job is nearly always the right one and you can spend the rest on filament.
        </p>
        <PickerClient
          printers={printers}
          store={store}
          checkedLabel={checked ? checkedDate(checked) : null}
        />
        <Disclosure className="mt-10" />
      </section>
    </div>
  );
}
