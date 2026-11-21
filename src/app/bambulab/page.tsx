import type { Metadata } from "next";
import Link from "next/link";
import { PRINTERS, SPECS_CHECKED } from "@/data/bambu/printers";
import { resolveBambuStore } from "@/lib/bambu-store-server";
import { awinLink, checkedDate, collectionLink, snapshotAny, snapshotFor, type BambuStoreKey } from "@/lib/bambu-shop";
import { BuyButton, CheckedNote, Disclosure, Price, SectionHeader } from "@/components/bambu/ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bambu Lab 3D printers: pick the right one",
  description:
    "Every current Bambu Lab printer from the A1 mini to the H3C, with real store prices, the specs that matter and a picker that tells you which one fits your project. From the maker who prints his lamps on an H2D.",
  alternates: { canonical: "https://jespermakes.com/bambulab" },
};

/** Oldest check among the given products in one store, or null when none were checked there. */
function checkedAt(store: BambuStoreKey, handles: string[]): string | null {
  const dates = handles.map((h) => snapshotFor(h, store)?.checkedAt).filter(Boolean) as string[];
  if (dates.length === 0) return null;
  return dates.sort()[0];
}

/** A specs link that points at the store (the P1S) is a store link, so it gets the affiliate wrap too. */
const isStore = (u: string) => /(^|\.)store\.bambulab\.com$/.test(new URL(u).host);
const specsHref = (u: string) => (isStore(u) ? awinLink(u) : u);

const yes = <span className="text-[#00AE42]">Yes</span>;
const no = <span className="text-white/35">No</span>;

export default async function BambuLabPage() {
  const { store } = await resolveBambuStore();
  const h2d = PRINTERS.find((p) => p.mine)!;
  const h2dImage = snapshotAny(h2d.handle)?.image;

  return (
    <div className="bg-[#111311] text-white">
      <SectionHeader store={store} />

      {/* ------------------------------------------------------------ hero */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-5 md:pt-20">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00AE42]">Bambu Lab 3D printers</p>
        <h1 className="max-w-3xl font-serif text-4xl font-medium leading-[1.08] md:text-6xl">
          Which 3D printer should you buy?
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
          I print my lamps on a Bambu Lab H2D, but that&apos;s a big machine and most people don&apos;t need one, so here is the
          whole Bambu lineup from the cheapest to the most expensive, with the prices from their store and a few
          questions that point you at the one that fits what you actually want to make.
        </p>
        <Disclosure className="mt-4 max-w-2xl" />

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/bambulab/picker"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00AE42] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#00c94c]"
          >
            Help me pick a printer <span aria-hidden>→</span>
          </Link>
          <a
            href="#compare"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Compare them all
          </a>
          <Link
            href="/bambulab/filament"
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Filament and accessories
          </Link>
        </div>
      </section>

      {/* -------------------------------------------------- what I print */}
      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-5 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00AE42]">What I print on</p>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-4xl">The H2D and a lot of lamps</h2>
            <p className="mt-5 leading-relaxed text-white/75">
              For A Study Into Light I printed a whole series of lamps on the H2D. If you want to print one yourself,
              the lamp generator makes the file for you, and the models I&apos;ve put up are on MakerWorld.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <BuyButton store={store} handle={h2d.handle} label="The H2D at Bambu Lab" />
              <Link
                href="/lamp-designer"
                className="text-sm font-semibold text-white/75 underline decoration-white/25 underline-offset-4 hover:text-white"
              >
                Make your own lamp
              </Link>
              <a
                href="https://makerworld.com/en/@jespermakes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-white/75 underline decoration-white/25 underline-offset-4 hover:text-white"
              >
                My models on MakerWorld
              </a>
            </div>
          </div>
          {h2dImage && (
            <div className="overflow-hidden rounded-3xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h2dImage} alt="Bambu Lab H2D" className="w-full object-contain p-6" loading="lazy" />
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------ lineup */}
      <section id="lineup" className="mx-auto max-w-6xl px-4 py-16 sm:px-5 md:py-20">
        <div className="mb-8 border-b border-white/10 pb-4">
          <h2 className="font-serif text-2xl font-medium md:text-3xl">The lineup, cheapest first</h2>
          <p className="mt-1.5 text-sm text-white/50">
            The A series is open, the P series gets a box around it, the X2D adds a second nozzle and a heated chamber,
            and the H series is the big one, with lasers, cutters and tool changers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRINTERS.map((p) => {
            const snap = snapshotAny(p.handle);
            const [w, d, h] = p.specs.build;
            return (
              <article
                key={p.handle}
                className={
                  "flex flex-col overflow-hidden rounded-2xl border bg-white/[0.04] " +
                  (p.mine ? "border-[#00AE42]/60" : "border-white/10")
                }
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-white">
                  {snap?.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={snap.image} alt={`Bambu Lab ${p.name}`} loading="lazy" className="h-full w-full object-contain p-5" />
                  )}
                  {p.mine && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#00AE42] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      The one I use
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-serif text-xl font-medium">{p.name}</h3>
                    <span className="text-xs text-white/40">{p.series} series</span>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65">{p.blurb}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-white/55">
                    <dt>Build</dt>
                    <dd className="text-right text-white/80">
                      {w} × {d} × {h} mm
                    </dd>
                    <dt>Enclosed</dt>
                    <dd className="text-right text-white/80">{p.specs.enclosed ? "Yes" : "No"}</dd>
                    <dt>Nozzles</dt>
                    <dd className="text-right text-white/80">{p.specs.heads}</dd>
                    <dt>Laser</dt>
                    <dd className="text-right text-white/80">{p.laser ?? "No"}</dd>
                  </dl>
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-[11px] uppercase tracking-wide text-white/40">
                      {p.comboVariant ? "Printer only" : p.baseVariant.replace(/^Bambu Lab /, "")}
                    </p>
                    <Price store={store} handle={p.handle} variant={p.baseVariant} size="lg" />
                    {p.comboVariant && (
                      <p className="mt-1 text-xs text-white/50">
                        With {p.comboAdds}: <Price store={store} handle={p.handle} variant={p.comboVariant} size="sm" />
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <BuyButton store={store} handle={p.handle} label="See all versions" />
                      <a
                        href={specsHref(p.specsUrl)}
                        target="_blank"
                        rel={isStore(p.specsUrl) ? "sponsored noopener noreferrer" : "noopener noreferrer"}
                        className="text-xs font-semibold text-white/55 underline decoration-white/20 underline-offset-4 hover:text-white"
                      >
                        Full specs
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-6">
          <CheckedNote store={store} iso={checkedAt(store, PRINTERS.map((p) => p.handle))} />
        </div>
      </section>

      {/* ------------------------------------------------------ compare */}
      <section id="compare" className="border-t border-white/10 bg-black/20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 md:py-20">
          <h2 className="font-serif text-2xl font-medium md:text-3xl">Side by side</h2>
          <p className="mt-1.5 text-sm text-white/50">
            The numbers that decide it, from Bambu&apos;s spec pages, checked on {checkedDate(SPECS_CHECKED)}. Scroll
            sideways on a phone.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-white/[0.05] text-xs uppercase tracking-wide text-white/50">
                <tr>
                  <th className="sticky left-0 bg-[#1a1d1a] px-4 py-3">Printer</th>
                  <th className="px-4 py-3">Printer only</th>
                  <th className="px-4 py-3">With AMS</th>
                  <th className="px-4 py-3">Build volume, mm</th>
                  <th className="px-4 py-3">Enclosed</th>
                  <th className="px-4 py-3">Chamber heat</th>
                  <th className="px-4 py-3">Nozzle max</th>
                  <th className="px-4 py-3">Top speed</th>
                  <th className="px-4 py-3">Colours</th>
                  <th className="px-4 py-3">Laser</th>
                  <th className="px-4 py-3">Cutter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {PRINTERS.map((p) => (
                  <tr key={p.handle} className={p.mine ? "bg-[#00AE42]/[0.07]" : ""}>
                    <th className="sticky left-0 bg-[#141714] px-4 py-3 font-semibold">{p.name}</th>
                    <td className="px-4 py-3">
                      {p.comboVariant ? <Price store={store} handle={p.handle} variant={p.baseVariant} size="sm" /> : <span className="text-white/35">Combo only</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Price store={store} handle={p.handle} variant={p.comboVariant ?? p.baseVariant} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {p.specs.build.join(" × ")}
                      {p.specs.buildNote && <span className="block text-xs text-white/40">{p.specs.buildNote}</span>}
                    </td>
                    <td className="px-4 py-3">{p.specs.enclosed ? yes : no}</td>
                    <td className="px-4 py-3">{p.specs.chamberHeatC ? <span className="text-[#00AE42]">{p.specs.chamberHeatC} °C</span> : no}</td>
                    <td className="px-4 py-3 text-white/80">{p.specs.maxNozzleC} °C</td>
                    <td className="px-4 py-3 text-white/80">{p.specs.maxSpeed} mm/s</td>
                    <td className="max-w-[220px] px-4 py-3 text-xs text-white/65">{p.multiColour}</td>
                    <td className="px-4 py-3 text-white/80">{p.laser ?? no}</td>
                    <td className="px-4 py-3">{p.cutter ? yes : no}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-white/40">
            Two printers on Bambu&apos;s store are left out, the X1E and the H2D Pro, because neither has a price you can
            pay online, they are sold to companies. The P1S numbers come from its store page, since Bambu took its spec
            page down.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------- filament teaser */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/bambulab/picker"
            className="group block rounded-3xl border border-white/12 bg-white/[0.04] p-8 transition-colors hover:border-[#00AE42]/60 hover:bg-white/[0.07]"
          >
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00AE42]">The picker</p>
            <h3 className="font-serif text-2xl font-medium">Which one is mine?</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              8 questions about what you want to make, how big, in which material and for how much, and you get one
              printer back with the reasons, and the next one up if you can stretch.
            </p>
            <span className="mt-5 inline-block text-sm font-semibold text-[#00AE42]">
              Start <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
          <Link
            href="/bambulab/filament"
            className="group block rounded-3xl border border-white/12 bg-white/[0.04] p-8 transition-colors hover:border-[#00AE42]/60 hover:bg-white/[0.07]"
          >
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00AE42]">Filament</p>
            <h3 className="font-serif text-2xl font-medium">What do I print it in?</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              The whole Bambu filament range, sorted by what the part has to survive, plus the AMS units, build plates
              and nozzles that are worth having.
            </p>
            <span className="mt-5 inline-block text-sm font-semibold text-[#00AE42]">
              See the filaments <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
        <p className="mt-8 text-sm text-white/45">
          Want to look around the whole store?{" "}
          <a
            href={collectionLink(store, "3d-printer")}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="font-semibold text-[#00AE42] underline decoration-[#00AE42]/40 underline-offset-4"
          >
            All Bambu Lab printers
          </a>
        </p>
      </section>
    </div>
  );
}
