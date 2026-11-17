import type { Metadata } from "next";
import Link from "next/link";
import { FILAMENT_GROUPS, NEEDS_LABEL, ALL_FILAMENT_HANDLES } from "@/data/bambu/filaments";
import { ACCESSORY_GROUPS } from "@/data/bambu/accessories";
import { resolveBambuStore } from "@/lib/bambu-store-server";
import { collectionLink, snapshotAny, snapshotFor, type BambuStoreKey } from "@/lib/bambu-shop";
import { BuyLink, CheckedNote, Disclosure, Price, SectionHeader } from "@/components/bambu/ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bambu Lab filament: which one for what",
  description:
    "The whole Bambu Lab filament range sorted by what the part has to survive, PLA, PETG, ABS, ASA, TPU and the engineering filaments, with store prices, plus the AMS units, build plates and nozzles worth having.",
  alternates: { canonical: "https://jespermakes.com/bambulab/filament" },
};

/**
 * How many colours a filament comes in. Bambu name their variants
 * "<colour> / <pack> / <weight>", sometimes with the colour code in brackets,
 * so the colour is the part that is not a pack or a weight.
 */
function colourCount(handle: string): number {
  const e = snapshotAny(handle);
  if (!e) return 0;
  const colours = new Set<string>();
  for (const v of e.variants) {
    const parts = v.name.split(" / ").map((s) => s.trim());
    const colour = parts.find((s) => !/^(refill|filament with spool|\d[\d.,]*\s?(kg|g)(\*\d+)?|\d+g\*\d+|1kg\*4)$/i.test(s));
    if (colour) colours.add(colour.replace(/\s*\(\d+\)$/, ""));
  }
  return colours.size;
}

/** The pack size of the cheapest variant, like "1 kg" or "0.5 kg". */
function packOf(handle: string, store: BambuStoreKey): string | null {
  const e = snapshotFor(handle, store) ?? snapshotAny(handle);
  if (!e) return null;
  const cheapest = [...e.variants].sort((a, b) => a.price - b.price)[0];
  const m = cheapest?.name.match(/(\d+(?:\.\d+)?)\s?(kg|g)(\*\d+)?/i);
  if (!m) return null;
  return `${m[1]} ${m[2].toLowerCase()}${m[3] ? ` × ${m[3].slice(1)}` : ""}`;
}

function oldestCheck(store: BambuStoreKey, handles: string[]): string | null {
  const d = handles.map((h) => snapshotFor(h, store)?.checkedAt).filter(Boolean) as string[];
  return d.length ? d.sort()[0] : null;
}

export default async function FilamentPage() {
  const { store } = await resolveBambuStore();

  return (
    <div className="bg-[#111311] text-white">
      <SectionHeader store={store} here={{ label: "Filament and accessories" }} />

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-5 md:pt-16">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00AE42]">Bambu Lab filament</p>
        <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.08] md:text-5xl">What do I print it in?</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
          Bambu make a lot of filament, and the names don&apos;t help much, so I sorted the whole range by what the part has
          to survive, cheapest and easiest first, with the printer each one needs.
        </p>
        <Disclosure className="mt-4 max-w-2xl" />
        <nav className="mt-7 flex flex-wrap gap-2 text-sm">
          {FILAMENT_GROUPS.map((g) => (
            <a key={g.key} href={`#${g.key}`} className="rounded-full border border-white/15 px-3.5 py-1.5 text-white/70 hover:border-[#00AE42]/60 hover:text-white">
              {g.title.split(",")[0]}
            </a>
          ))}
          <a href="#accessories" className="rounded-full border border-[#00AE42]/50 px-3.5 py-1.5 text-white hover:bg-[#00AE42]/10">
            Accessories
          </a>
        </nav>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-5">
        {FILAMENT_GROUPS.map((g) => (
          <div key={g.key} id={g.key} className="mb-14 scroll-mt-6">
            <div className="mb-5 border-b border-white/10 pb-4">
              <h2 className="font-serif text-2xl font-medium md:text-3xl">{g.title}</h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-white/55">{g.intro}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((f) => {
                const snap = snapshotAny(f.handle);
                const colours = colourCount(f.handle);
                const pack = packOf(f.handle, store);
                return (
                  <BuyLink
                    key={f.handle}
                    store={store}
                    handle={f.handle}
                    className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-[#00AE42]/60 hover:bg-white/[0.07]"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                      {snap?.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={snap.image} alt={f.name} loading="lazy" className="h-full w-full object-contain p-1.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-snug">{f.name}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{f.for}</p>
                      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-white/45">
                        <Price store={store} handle={f.handle} size="sm" />
                        {pack && <span>{pack}</span>}
                        {colours > 1 && <span>{colours} colours</span>}
                      </div>
                      <p className="mt-1.5 text-[11px] uppercase tracking-wide text-[#00AE42]/80">{NEEDS_LABEL[f.needs]}</p>
                    </div>
                  </BuyLink>
                );
              })}
            </div>
          </div>
        ))}
        <p className="text-sm text-white/45">
          That&apos;s the full range Bambu list as filament, apart from bundles and seasonal boxes.{" "}
          <a
            href={collectionLink(store, "filament")}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="font-semibold text-[#00AE42] underline decoration-[#00AE42]/40 underline-offset-4"
          >
            See all filament at Bambu Lab
          </a>
        </p>
      </section>

      <section id="accessories" className="scroll-mt-6 border-t border-white/10 bg-black/20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00AE42]">Accessories</p>
          <h2 className="font-serif text-3xl font-medium md:text-4xl">The extras worth having</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
            Bambu&apos;s store has about 1,300 products and most of them are spare parts, so these are the ones that
            change what your printer can do.
          </p>
          {ACCESSORY_GROUPS.map((g) => (
            <div key={g.key} className="mt-12">
              <h3 className="font-serif text-2xl font-medium">{g.title}</h3>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-white/55">{g.intro}</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((a) => {
                  const snap = snapshotAny(a.handle);
                  return (
                    <BuyLink
                      key={a.handle}
                      store={store}
                      handle={a.handle}
                      className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-[#00AE42]/60 hover:bg-white/[0.07]"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                        {snap?.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={snap.image} alt={a.name} loading="lazy" className="h-full w-full object-contain p-1.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold leading-snug">{a.name}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-white/60">{a.for}</p>
                        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 text-xs text-white/45">
                          <Price store={store} handle={a.handle} size="sm" />
                        </div>
                        <p className="mt-1.5 text-[11px] uppercase tracking-wide text-white/40">Fits: {a.fits}</p>
                      </div>
                    </BuyLink>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-10">
            <CheckedNote store={store} iso={oldestCheck(store, ALL_FILAMENT_HANDLES)} />
          </div>
          <p className="mt-6 text-sm text-white/55">
            Not sure which printer yet?{" "}
            <Link href="/bambulab/picker" className="font-semibold text-[#00AE42] underline decoration-[#00AE42]/40 underline-offset-4">
              Try the picker
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
