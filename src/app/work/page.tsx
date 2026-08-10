import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Furniture and builds from the workshop | Jesper Makes",
  description:
    "Selected furniture and builds by Jesper Kjærgaard: designed on Fyn, Denmark, built from honest materials, filmed along the way.",
  alternates: { canonical: "https://jespermakes.com/work" },
};

const PIECES = [
  {
    title: "The Cone Lamp",
    story:
      "The flagship piece. 159 parts of plywood stacked into one warm glow. It started as a one-off for our own living room and became the thing people ask about most. You can cut it on a laser, print it, or design your own variation in the lamp designer.",
    image: "/images/products/cone-lamp-laser-1.jpg",
    href: "/cone-lamp",
    linkLabel: "Explore the lamp",
  },
  {
    title: "Live-Edge Planter Shelf",
    story:
      "A floating shelf holding a row of plants with no screws and no metal. Just glue, joinery, and wood holding wood. Built as a test of how far honest joinery can go, and it has not moved a millimeter since.",
    image: "/images/blog/planter-shelf-finished.jpg",
    href: "/blog/live-edge-planter-shelf-zero-screws",
    linkLabel: "Read the build",
  },
  {
    title: "Garden Planter Boxes",
    story:
      "Fir boards, finger joints in every corner, and a routing template that made the whole batch repeatable. Built for my wife's garden, designed so they can be rebuilt by anyone with a router and patience.",
    image: "/images/blog/planter-box-finger-joints-template.jpg",
    href: "/blog/planter-box-finger-joints",
    linkLabel: "Read the build",
  },
];

export default function WorkPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
      <p className="text-[10px] font-bold tracking-[2px] text-wood-light/[0.4] uppercase mb-4">
        Selected work
      </p>
      <h1 className="font-serif text-4xl md:text-5xl text-wood mb-5 max-w-2xl">
        Furniture with a story in it
      </h1>
      <p className="text-wood-light leading-relaxed max-w-2xl mb-14">
        I design and build furniture on Fyn, Denmark. Most pieces start with
        material that had a life before: pallet wood, reclaimed boards, storm
        oak. The design work is making that history visible without shouting
        about it. Everything here was built in my workshop and filmed along
        the way.
      </p>

      <div className="space-y-14">
        {PIECES.map((piece, i) => (
          <div
            key={piece.title}
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
              i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={piece.image}
                alt={piece.title}
                className="w-full object-cover aspect-[4/3]"
              />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-wood mb-3">{piece.title}</h2>
              <p className="text-wood-light leading-relaxed mb-4">{piece.story}</p>
              <Link
                href={piece.href}
                className="text-sm font-semibold text-forest hover:text-forest/80"
              >
                {piece.linkLabel} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 rounded-2xl bg-wood text-cream p-8 md:p-10">
        <h2 className="font-serif text-2xl mb-3">Commission a piece</h2>
        <p className="text-cream/80 leading-relaxed max-w-2xl mb-5">
          I take on a small number of commissions: furniture with a story,
          shop counters from reclaimed wood, pieces that are meant to be kept.
          If you have something in mind, write me and tell me about it. No
          forms, no process, just a conversation.
        </p>
        <a
          href="mailto:hello@jespermakes.com?subject=Commission"
          className="inline-block rounded-xl bg-cream/10 border border-cream/25 px-5 py-3 text-sm font-semibold text-cream hover:bg-cream/20 transition-colors"
        >
          hello@jespermakes.com
        </a>
      </div>

      <p className="mt-10 text-sm text-wood-light/70">
        More pieces are being written up. The barn we are raising has{" "}
        <Link href="/barn" className="text-forest font-semibold">
          its own page
        </Link>
        .
      </p>
    </div>
  );
}
