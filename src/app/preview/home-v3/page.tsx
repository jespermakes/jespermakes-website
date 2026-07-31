import { Metadata } from "next";
import Link from "next/link";

// Homepage v3 draft (DR-156 follow-up after Jesper's design critique).
// Design intent: evening in the workshop. Photography-first, editorial
// rhythm (dark / cream / image / dark / cream), big serif, no card grids,
// no green. Preview only: not linked, not indexed.

export const metadata: Metadata = {
  title: "Homepage v3 preview — Jesper Makes",
  robots: { index: false, follow: false },
};

function Kicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-amber" />
      <span
        className={`text-[11px] font-bold tracking-[0.25em] uppercase ${
          dark ? "text-cream/50" : "text-wood-light/50"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

const FILMS = [
  {
    id: "McK0kbPZNoU",
    title: "This Video Will Change How You See Wood. I Promise.",
    note: "6.5M views",
  },
  {
    id: "1Vl7WQqodFc",
    title: "Beginner to full-time woodworker in 2 years",
    note: "4.2M views",
  },
  {
    id: "uFguK77AQxE",
    title: "The Hardest Year of My Life: A Build Diary",
    note: "The cabin, honestly told",
  },
];

const APPS = [
  { n: "01", name: "Design Studio", blurb: "A full 2D design app for laser and CNC. Draw, nest, export.", href: "/studio" },
  { n: "02", name: "Lamp Designer", blurb: "Shape your own printable lamp in 3D. Beta, and already fun.", href: "/lamp-designer" },
  { n: "03", name: "Box Joint Jig", blurb: "A cut-ready jig template for any wood thickness.", href: "/box-joint-jig" },
  { n: "04", name: "Rubio Finish Guide", blurb: "The right finish and color for your wood, without guessing.", href: "/rubio" },
  { n: "05", name: "Title Lab", blurb: "YouTube title analysis trained on what actually worked.", href: "/title-lab" },
  { n: "06", name: "Storyteller", blurb: "Finds the story hiding inside your next build.", href: "/storyteller" },
];

const PLANS = [
  { name: "Jesper's Cheat Sheets", image: "/images/products/wall-charts-hero.jpg", href: "/shop/workshop-wall-charts", sub: "8 sheets for the workshop wall" },
  { name: "Cone Lamp Laser File", image: "/images/products/cone-lamp-laser-1.jpg", href: "/shop/cone-lamp-laser", sub: "All 159 parts, cut-ready SVG" },
  { name: "Cone Lamp 3D Print Files", image: "/images/cone-lamp-3dprint/hero-firewood.jpg", href: "/shop/cone-lamp-3dprint", sub: "STL pack + printed guide" },
];

export default function HomeV3Preview() {
  return (
    <main className="bg-[#20100a]">
      {/* ————— HERO: the place, at dusk ————— */}
      <section className="relative min-h-[92vh] flex items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/press/latvia/barn-evening-wide.jpg"
          alt="The barn on South Fyn at dusk"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#20100a] via-[#20100a]/40 to-[#20100a]/10" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-40">
          <Kicker dark>Workshop on Fyn, Denmark</Kicker>
          <h1 className="mt-5 font-serif text-cream text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.02] max-w-3xl">
            Build something <em className="not-italic text-amber">real.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-cream/75 leading-relaxed">
            I&apos;m Jesper. I design furniture, raise timber frames, and film
            all of it from my workshop on Fyn, Denmark.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href="https://youtube.com/@JesperMakes"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-cream px-6 py-3.5 text-sm font-semibold text-wood hover:bg-cream/90 transition-colors"
            >
              Watch the films
            </a>
            <Link
              href="/work"
              className="text-sm font-semibold text-cream/80 hover:text-amber transition-colors"
            >
              See the work →
            </Link>
          </div>
          <p className="mt-10 text-xs tracking-wide text-cream/40">
            359,000 subscribers · 43 million views · one barn underway
          </p>
        </div>
      </section>

      {/* ————— IDENTITY INDEX ————— */}
      <section className="border-t border-cream/10">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3">
          {[
            { n: "01", label: "Furniture", href: "/work" },
            { n: "02", label: "Timber frames", href: "/barn" },
            { n: "03", label: "Films", href: "#films" },
          ].map((item, i) => (
            <a
              key={item.n}
              href={item.href}
              className={`group flex items-baseline gap-4 py-8 md:py-10 px-1 ${
                i > 0 ? "md:border-l md:border-cream/10 md:pl-10" : ""
              }`}
            >
              <span className="text-xs text-amber/70 font-semibold">{item.n}</span>
              <span className="font-serif text-2xl text-cream/85 group-hover:text-amber transition-colors">
                {item.label}
              </span>
              <span className="ml-auto text-cream/30 group-hover:text-amber group-hover:translate-x-1 transition-all">
                →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ————— SELECTED WORK: catalogue on cream ————— */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Kicker>Selected work</Kicker>
          <h2 className="mt-5 font-serif text-4xl md:text-5xl text-wood max-w-2xl leading-tight">
            Furniture with a story in it
          </h2>

          {/* Feature piece */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-5 gap-10 items-end">
            <Link href="/cone-lamp" className="md:col-span-3 group block overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/cone-lamp-3dprint/lit-floor.jpg"
                alt="The Cone Lamp glowing on a plank floor"
                className="w-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500"
              />
            </Link>
            <div className="md:col-span-2 pb-2">
              <span className="text-xs font-semibold text-amber">01</span>
              <h3 className="mt-2 font-serif text-3xl text-wood">The Cone Lamp</h3>
              <p className="mt-3 text-wood-light leading-relaxed">
                159 parts and one warm glow. It started as a one-off for our
                living room and became the piece people ask about most.
              </p>
              <Link href="/cone-lamp" className="mt-4 inline-block text-sm font-semibold text-forest hover:text-amber-dark transition-colors">
                Explore the lamp →
              </Link>
            </div>
          </div>

          {/* Staggered pair */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <Link href="/blog/live-edge-planter-shelf-zero-screws" className="group block">
              <div className="overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/blog/planter-shelf-finished.jpg"
                  alt="Live-edge planter shelf"
                  className="w-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-xs font-semibold text-amber">02</span>
                <h3 className="font-serif text-xl text-wood group-hover:text-amber-dark transition-colors">
                  Live-Edge Planter Shelf
                </h3>
              </div>
              <p className="mt-1 text-sm text-wood-light ml-8">
                No screws, no metal. Wood holding wood.
              </p>
            </Link>
            <Link href="/blog/planter-box-finger-joints" className="group block md:mt-20">
              <div className="overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/blog/planter-box-finger-joints-template.jpg"
                  alt="Garden planter boxes with finger joints"
                  className="w-full object-cover aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-xs font-semibold text-amber">03</span>
                <h3 className="font-serif text-xl text-wood group-hover:text-amber-dark transition-colors">
                  Garden Planter Boxes
                </h3>
              </div>
              <p className="mt-1 text-sm text-wood-light ml-8">
                Finger joints in every corner, built to be rebuilt.
              </p>
            </Link>
          </div>

          <p className="mt-16 text-sm text-wood-light">
            I take on a few commissions each year.{" "}
            <Link href="/work" className="font-semibold text-forest hover:text-amber-dark transition-colors">
              The work page has the door →
            </Link>
          </p>
        </div>
      </section>

      {/* ————— THE BARN: full-bleed film still ————— */}
      <section className="relative min-h-[75vh] flex items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/press/latvia/jesper-axe-timber.jpg"
          alt="Hewing timber with an axe"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#20100a] via-transparent to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-16">
          <Kicker dark>Øhavsladen · South Fyn</Kicker>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl text-cream max-w-2xl leading-tight">
            Raising a barn the old way
          </h2>
          <p className="mt-4 max-w-xl text-cream/75 leading-relaxed">
            An 1850s barn, rebuilt by hand as a timber frame workshop. Axes,
            chisels, oak pegs, and friends from The Northmen.
          </p>
          <Link
            href="/barn"
            className="mt-7 inline-block rounded-xl border border-cream/30 bg-cream/10 px-6 py-3.5 text-sm font-semibold text-cream hover:bg-cream/20 transition-colors"
          >
            Follow the build
          </Link>
        </div>
      </section>

      {/* ————— THE PLAN SHELF: dark chapter ————— */}
      <section className="bg-[#20100a]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Kicker dark>The plan shelf</Kicker>
          <h2 className="mt-5 font-serif text-4xl md:text-5xl text-cream max-w-3xl leading-tight">
            Every plan costs <em className="not-italic text-amber">€0</em>.
            <br className="hidden md:block" /> The zero is editable.
          </h2>
          <p className="mt-5 max-w-xl text-cream/60 leading-relaxed">
            Type your email, get the files. If the work is worth something to
            you, replace the zero before you download. People do, more often
            than you would think.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <Link key={plan.href} href={plan.href} className="group block">
                <div className="overflow-hidden rounded-2xl ring-1 ring-cream/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={plan.image}
                    alt={plan.name}
                    className="w-full object-cover aspect-square group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-lg text-cream group-hover:text-amber transition-colors">
                    {plan.name}
                  </h3>
                  <span className="font-serif text-amber shrink-0">€0+</span>
                </div>
                <p className="mt-1 text-sm text-cream/50">{plan.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ————— WORKSHOP APPS: the index ————— */}
      <section className="bg-[#20100a] border-t border-cream/10">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-2">
              <Kicker dark>Workshop apps</Kicker>
              <h2 className="mt-5 font-serif text-4xl text-cream leading-tight">
                Tools I built.
                <br />
                Free to use.
              </h2>
              <p className="mt-5 text-cream/60 leading-relaxed max-w-sm">
                When the workshop needs a tool that does not exist, I build
                it. These run in your browser and cost nothing.
              </p>
            </div>
            <div className="md:col-span-3">
              {APPS.map((app) => (
                <Link
                  key={app.n}
                  href={app.href}
                  className="group flex items-baseline gap-5 border-t border-cream/10 py-5 last:border-b"
                >
                  <span className="text-xs font-semibold text-amber/60">{app.n}</span>
                  <div>
                    <span className="font-serif text-xl text-cream group-hover:text-amber transition-colors">
                      {app.name}
                    </span>
                    <p className="mt-0.5 text-sm text-cream/45">{app.blurb}</p>
                  </div>
                  <span className="ml-auto text-cream/25 group-hover:text-amber group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ————— FILMS ————— */}
      <section id="films" className="bg-[#20100a] border-t border-cream/10">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <Kicker dark>The films</Kicker>
              <h2 className="mt-5 font-serif text-4xl text-cream leading-tight">
                Watched by a few million patient people
              </h2>
            </div>
            <a
              href="https://youtube.com/@JesperMakes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-cream/70 hover:text-amber transition-colors"
            >
              Subscribe on YouTube →
            </a>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {FILMS.map((film) => (
              <a
                key={film.id}
                href={`https://www.youtube.com/watch?v=${film.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="overflow-hidden rounded-2xl ring-1 ring-cream/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${film.id}/maxresdefault.jpg`}
                    alt={film.title}
                    className="w-full object-cover aspect-video group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
                <h3 className="mt-4 font-serif text-lg text-cream leading-snug group-hover:text-amber transition-colors">
                  {film.title}
                </h3>
                <p className="mt-1 text-xs tracking-wide text-cream/40 uppercase">{film.note}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ————— THE LETTER: cream close ————— */}
      <section className="bg-cream">
        <div className="mx-auto max-w-2xl px-6 py-24 md:py-32 text-center">
          <div className="flex justify-center">
            <Kicker>The workshop letter</Kicker>
          </div>
          <h2 className="mt-5 font-serif text-4xl md:text-5xl text-wood leading-tight">
            A letter from the workshop
          </h2>
          <p className="mt-5 text-wood-light leading-relaxed">
            New builds, the barn, new tools, and the occasional long read.
            Written by me, about once a month. 3,397 makers read it.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/newsletter"
              className="rounded-xl bg-wood px-8 py-4 text-sm font-semibold text-cream hover:bg-wood-light transition-colors"
            >
              Join the letter
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/press/latvia/jesper-portrait-barn.jpg"
              alt="Jesper"
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="font-serif italic text-xl text-amber-dark">Jesper</span>
          </div>
        </div>
      </section>
    </main>
  );
}
