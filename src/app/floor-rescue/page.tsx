import type { Metadata } from "next";
import EntryForm from "./entry-form";

export const metadata: Metadata = {
  title: "The Floor Rescue | Jesper Makes",
  description:
    "Worst floor wins. Three worn wooden floors around Europe get rescued with Rubio Monocoat Oil Plus 2C. Enter yours.",
  alternates: { canonical: "/floor-rescue" },
};

/* The Floor Rescue: Rubio Monocoat competition (Aug-Sep 2026). Mechanics agreed
 * with Rubio on the "Code" email thread: three winners, worst floor wins, real
 * wood only, entries close end of August, winners early September, winners
 * share before/after photos. The form posts to /api/competition/floor.
 * Palette is Rubio's own brand set, pulled from their logo asset: dark green
 * #183029, forest green #396948, gold #fcc52c, white. */

export default function FloorRescuePage() {
  return (
    <div className="bg-[#183029]">
      <main className="mx-auto max-w-3xl px-4 py-14 text-white">
        <h1 className="font-serif text-4xl md:text-5xl font-normal leading-[1.05] tracking-tight text-white mb-3">
          The Floor Rescue
        </h1>
        <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-[620px]">
          Worst floor wins. Three worn wooden floors get rescued by their owners, with the oil to do it.
        </p>

        <div className="text-white/80 text-[15px] leading-relaxed max-w-[620px] space-y-4 mb-10">
          <p>
            Almost two years ago we restored our living room floor with Rubio Monocoat Oil Plus 2C,
            and it has been earning its keep ever since. Now three more floors get the same chance.
          </p>
          <p>
            The deal is simple. Show me your worst wooden floor. The three floors that need it most,
            with the best stories behind them, each win 1.3L of Oil Plus 2C in the colour of your
            choice. That is roughly a floor&apos;s worth. You do the work, your floor gets saved, and
            you share a before and after photo we can both be proud of.
          </p>
          <p>
            Real wood only. Oil needs wood, so no laminate, no vinyl. Solid boards, plank, parquet,
            the rougher the better. Entries close at the end of August; winners are picked in early
            September, ideally from three different countries.
          </p>
          <p>
            Not sure what your floor actually needs? I built a guide for exactly that:{" "}
            <a
              href="/rubio"
              className="text-[#fcc52c] underline decoration-[#fcc52c]/40 hover:decoration-[#fcc52c]"
            >
              the Rubio guide
            </a>
            .
          </p>
        </div>

        <EntryForm />

        <p className="text-xs text-white/40 mt-10 max-w-2xl leading-relaxed">
          Disclosure: I have a long-standing partnership with Rubio Monocoat, and the prizes are
          provided by Rubio Monocoat. Entries are judged on need and story by me together with the
          Rubio team. Winners agree to share before and after photos of their floor. Your details are
          used for this competition only, shared with Rubio Monocoat as described in the consent box,
          and never sold.
        </p>
      </main>
    </div>
  );
}
