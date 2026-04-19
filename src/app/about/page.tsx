import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Jesper Makes",
  description:
    "Danish woodworker. Started with pallet wood in 2020. Now 351K subscribers, a workshop on Fyn, and a mission to get more people making things.",
};

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shadow-wood/10">
            <Image
              src="/images/press/jesper-portrait-winter-1.jpg"
              alt="Jesper in his leather apron, outside the workshop"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-wood mb-6">
              About Jesper
            </h1>
            <div className="space-y-4 text-wood-light/80 leading-relaxed">
              <p>
                I&apos;m Jesper. I&apos;m 54, I live on the island of Fyn in
                Denmark, and I make things out of wood.
              </p>
              <p>
                I started woodworking in 2020. No background in it. No
                training. I just grabbed some pallet wood, watched a few
                videos, and started building. That same year I picked up a
                camera and started sharing the process on YouTube.
              </p>
              <p>
                Six years later, 352,000 people follow along. My videos get
                somewhere between 150,000 and 750,000 views. One hit 4.5
                million. I still don&apos;t fully understand how that happened.
              </p>
              <p>
                But I think it&apos;s because I keep it real. I show the
                mistakes. I show the figuring out. I don&apos;t pretend to be
                an expert. I&apos;m just a guy in a workshop who wants to build
                cool stuff and tell honest stories about it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The story */}
      <section className="bg-wood text-cream">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-24">
          <h2 className="font-serif text-3xl md:text-4xl mb-8">
            The short version
          </h2>
          <div className="space-y-4 text-cream/80 leading-relaxed text-lg">
            <p>
              It started with pallet wood. Free material, no pressure, nothing
              to lose. I broke down pallets in my backyard and turned them into
              furniture. Some of it was rough. Some of it I&apos;m still proud
              of.
            </p>
            <p>
              Along the way I got into upcycling, epoxy resin tables, hand tool
              woodworking, and even building an off-grid cabin. I draw my
              designs in a notebook. I like projects that have character and
              story. Old materials getting new life.
            </p>
            <p>
              The YouTube channel grew. Slowly at first, then not so slowly.
              People told me they picked up tools because of my videos. That
              still means more than any view count.
            </p>
          </div>
        </div>
      </section>

      {/* Photo + how I work */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-wood mb-8">
              How I work
            </h2>
            <div className="space-y-4 text-wood-light/80 leading-relaxed">
              <p>
                I write my own scripts. I edit in Adobe Premiere Pro. I use
                drones and tiny action cameras to get the shots I want. Music
                matters a lot to me. I use Epidemic Sound and I lean into
                cinematic film scores. I grew up on Depeche Mode, The Cure,
                Daft Punk, and Tenacious D. You can probably hear that in my
                edits.
              </p>
              <p>
                I care about storytelling as much as woodworking. Maybe more.
                The content mixes craftsmanship and narrative because
                that&apos;s what I find interesting. A table is just a table.
                The story of building it is what makes people watch.
              </p>
              <p>
                I also have a second channel called{" "}
                <a
                  href="https://youtube.com/@intherough"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest hover:text-forest-dark transition-colors font-medium"
                >
                  In The Rough
                </a>{" "}
                for longer, less polished, more direct content. No fancy edits.
                Just the work.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-wood/10">
            <Image
              src="/images/press/jesper-workshop-measuring.jpg"
              alt="Jesper measuring and marking wood at the workbench"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Workshop + Latvia photos */}
      <section className="max-w-5xl mx-auto px-6 pb-12 space-y-4">
        <div className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-2xl shadow-wood/10">
          <Image
            src="/images/press/jesper-workshop-carrying.jpg"
            alt="Jesper carrying lumber in the workshop"
            fill
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg shadow-wood/10">
            <Image
              src="/images/press/latvia/jesper-axe-timber.jpg"
              alt="Jesper working with an axe on a timber beam in Latvia"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg shadow-wood/10">
            <Image
              src="/images/press/latvia/jesper-chisel-workshop.jpg"
              alt="Jesper chiseling a mortise joint"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg shadow-wood/10">
            <Image
              src="/images/press/latvia/chisel-joinery-closeup.jpg"
              alt="Closeup of hand-cut timber joinery"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Latvia barn photo */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-2xl shadow-wood/10">
          <Image
            src="/images/press/latvia/barn-evening-wide.jpg"
            alt="Traditional timber frame barn in Latvia at dusk"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Sponsors & values */}
      <section className="max-w-3xl mx-auto px-6 py-20 md:py-24">
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-8">
          On sponsors and trust
        </h2>
        <div className="space-y-4 text-wood-light/80 leading-relaxed">
          <p>
            My audience comes first. Always. A good relationship with sponsors
            is important to me, but it&apos;s always second to the people who
            watch.
          </p>
          <p>
            I&apos;m an ambassador for Festool, Rubio Monocoat, and Carhartt.
            I only work with brands whose products I genuinely use in my own
            shop. I don&apos;t make videos just in exchange for free products.
            The integrations have to feel natural in the story, or I&apos;m not
            interested.
          </p>
          <p>
            If you&apos;re a brand that thinks there&apos;s a fit,{" "}
            <Link
              href="/contact"
              className="text-forest hover:text-forest-dark transition-colors font-medium"
            >
              let&apos;s talk
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-wood/5">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-serif text-3xl md:text-4xl text-forest">352K</p>
              <p className="text-wood-light/60 text-sm mt-1">YouTube subscribers</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl text-forest">4.5M</p>
              <p className="text-wood-light/60 text-sm mt-1">Top video views</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl text-forest">2020</p>
              <p className="text-wood-light/60 text-sm mt-1">Started building</p>
            </div>
            <div>
              <p className="font-serif text-3xl md:text-4xl text-forest">Fyn 🇩🇰</p>
              <p className="text-wood-light/60 text-sm mt-1">Based in Denmark</p>
            </div>
          </div>
        </div>
      </section>

      {/* The point */}
      <section className="max-w-3xl mx-auto px-6 py-20 md:py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-6">
          Start before you feel ready.
        </h2>
        <p className="text-wood-light/70 text-lg leading-relaxed mb-8">
          That&apos;s the whole thing, really. Jesper Makes is not just about
          wood. It&apos;s about building things, telling stories, and showing
          that you don&apos;t need permission or a perfect plan to get started.
          You just need to start.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://youtube.com/@jespermakes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-forest hover:bg-forest-dark text-cream px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Watch on YouTube
          </a>
          <a
            href="https://instagram.com/jespermakes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-wood/20 hover:border-forest text-wood px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://tiktok.com/@jespermakes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-wood/20 hover:border-forest text-wood px-6 py-3 rounded-lg font-medium transition-colors"
          >
            TikTok
          </a>
          <Link
            href="/shop"
            className="inline-block border border-wood/20 hover:border-forest text-wood px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Visit the Shop
          </Link>
        </div>
      </section>
    </div>
  );
}
