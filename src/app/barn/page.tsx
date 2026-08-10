import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Øhavsladen: rebuilding an 1850s barn on Fyn",
  description:
    "We are rebuilding an 1850s barn on South Fyn as a hand-cut timber frame workshop. Axes, chisels, oak pegs, and The Northmen. Follow the build.",
  alternates: { canonical: "https://jespermakes.com/barn" },
};

export default function BarnPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
      <p className="text-[10px] font-bold tracking-[2px] text-wood-light/[0.4] uppercase mb-4">
        The barn / Øhavsladen
      </p>
      <h1 className="font-serif text-4xl md:text-5xl text-wood mb-5 max-w-2xl">
        Raising a barn the old way
      </h1>
      <p className="text-wood-light leading-relaxed max-w-2xl mb-10">
        On the coast of South Fyn stands a barn from the 1850s. It is beyond
        saving: the roof is asbestos, the frame is rotten, the north wall is
        giving up. So we are doing the next best thing to saving it. We are
        building it again, by hand, as a real timber frame workshop.
      </p>

      <div className="overflow-hidden rounded-2xl mb-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/press/latvia/barn-evening-wide.jpg"
          alt="The barn at dusk"
          className="w-full object-cover aspect-[21/9]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
        <div>
          <h2 className="font-serif text-2xl text-wood mb-3">The build</h2>
          <p className="text-wood-light leading-relaxed mb-4">
            The new barn rises on the same footprint as the old one: 25 by 6
            meters, 8 meters to the ridge, about 150 square meters of ground
            floor and a loft above. Every joint is cut by hand: mortise and
            tenon, oak pegs, no metal plates. The oak and pine were felled in
            winter and are air-drying while we prepare.
          </p>
          <p className="text-wood-light leading-relaxed">
            This is bindingsværk, the Danish timber framing tradition, built
            the way it was built when the first barn went up. Not because it
            is nostalgic, but because it works, and because a craft you do not
            practice is a craft you lose.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-wood mb-3">The people</h2>
          <p className="text-wood-light leading-relaxed mb-4">
            I am not doing this alone. Tom Schotman, a master timber framer
            who spent years building and teaching with the Northmen Guild in
            Latvia, has moved to Denmark and is leading the framing. Rihards
            Vidzickis of Vienkoču Park in Latvia brings the old knowledge.
            Ditte plans the courses that will run here.
          </p>
          <p className="text-wood-light leading-relaxed">
            When it stands, Øhavsladen becomes a workshop and a place to
            learn: timber framing courses, maker camps, and room for the kind
            of work that needs space and patience.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-14">
        {[
          { src: "/images/press/latvia/jesper-chisel-mortise.jpg", alt: "Cutting a mortise by hand" },
          { src: "/images/press/latvia/tom-timber-bench.jpg", alt: "Tom at the timber bench" },
          { src: "/images/press/latvia/jesper-axe-timber.jpg", alt: "Hewing timber with an axe" },
        ].map((photo) => (
          <div key={photo.src} className="overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover aspect-square"
            />
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-wood text-cream p-8 md:p-10 mb-10">
        <h2 className="font-serif text-2xl mb-3">Follow the build</h2>
        <p className="text-cream/80 leading-relaxed max-w-2xl mb-5">
          The project has its own site with the full story in Danish and
          English, and the build will show up in my videos and The Workshop
          Letter as it happens.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://ohavsladen.dk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-cream/10 border border-cream/25 px-5 py-3 text-sm font-semibold text-cream hover:bg-cream/20 transition-colors"
          >
            ohavsladen.dk ↗
          </a>
          <Link
            href="/newsletter"
            className="inline-block rounded-xl bg-cream/10 border border-cream/25 px-5 py-3 text-sm font-semibold text-cream hover:bg-cream/20 transition-colors"
          >
            Get The Workshop Letter
          </Link>
        </div>
      </div>

      <p className="text-sm text-wood-light/70">
        Curious what hand-cut timber framing looks like up close?{" "}
        <Link
          href="/blog/tom-timber-framing-course-denmark-june-2026"
          className="text-forest font-semibold"
        >
          Read about Tom&apos;s course in Denmark
        </Link>
        .
      </p>
    </div>
  );
}
