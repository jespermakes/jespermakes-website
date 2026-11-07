import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Floor Rescue has closed | Jesper Makes",
  description:
    "The Floor Rescue with Rubio Monocoat has closed. Thank you to everyone who sent a floor. The winners have been contacted.",
  alternates: { canonical: "/floor-rescue" },
};

/* The Floor Rescue: Rubio Monocoat competition (Aug-Sep 2026). Closed on
 * 2026-11-08: no more entries. The form is gone and /api/competition/floor
 * answers 410. Stored entries are untouched. Palette is Rubio's own brand set:
 * dark green #183029, gold #fcc52c, white. */

export default function FloorRescuePage() {
  return (
    <div className="bg-[#183029]">
      <main className="mx-auto max-w-3xl px-4 py-14 text-white">
        <h1 className="font-serif text-4xl md:text-5xl font-normal leading-[1.05] tracking-tight text-white mb-3">
          The Floor Rescue has closed
        </h1>
        <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-[620px]">
          Thank you to everyone who sent in a floor.
        </p>

        <div className="text-white/80 text-[15px] leading-relaxed max-w-[620px] space-y-4 mb-10">
          <p>
            The Floor Rescue is over and we are not taking any more entries. The winners have been
            contacted.
          </p>
          <p>
            Rubio Monocoat supported the Floor Rescue. If you want to see the oil I use, it is all
            in{" "}
            <Link
              href="/rubio"
              className="text-[#fcc52c] underline decoration-[#fcc52c]/40 hover:decoration-[#fcc52c]"
            >
              the Rubio page
            </Link>
            , and the{" "}
            <Link
              href="/rubio/guide"
              className="text-[#fcc52c] underline decoration-[#fcc52c]/40 hover:decoration-[#fcc52c]"
            >
              Rubio guide
            </Link>{" "}
            helps you pick the right product for your floor.
          </p>
        </div>

        <p className="text-xs text-white/40 mt-10 max-w-2xl leading-relaxed">
          Disclosure: I have a long-standing partnership with Rubio Monocoat, and the prizes were
          provided by Rubio Monocoat.
        </p>
      </main>
    </div>
  );
}
