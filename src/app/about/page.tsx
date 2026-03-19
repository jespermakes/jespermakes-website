import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Jesper Makes",
  description:
    "Danish maker, started with pallet wood, now 351K subscribers. Building real things.",
};

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl shadow-wood/10">
          <Image
            src="https://i.ytimg.com/vi/1Vl7WQqodFc/maxresdefault.jpg"
            alt="Jesper in the workshop"
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
              I started woodworking with pallet wood in my backyard in Denmark.
              No formal training, no expensive tools — just a stubborn need to
              make things with my hands and figure out what works by actually
              building.
            </p>
            <p>
              What began as a hobby turned into a YouTube channel. 351,000
              subscribers later, the approach hasn&apos;t changed: build real
              furniture from real materials, share the process honestly, and
              never pretend everything goes perfectly on the first try.
            </p>
            <p>
              I don&apos;t use CNC machines or fancy jigs. My builds are meant
              to be done with the tools most people already have — or can get
              without taking out a loan. Woodworking should be accessible,
              practical, and satisfying.
            </p>
            <p>
              When I&apos;m not in the workshop, I&apos;m probably drinking
              coffee and thinking about the next build.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="https://youtube.com/@jespermakes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-amber hover:bg-amber-dark text-cream px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Watch on YouTube
            </a>
            <a
              href="https://instagram.com/jespermakes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-wood/20 hover:border-amber text-wood px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com/@jespermakes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-wood/20 hover:border-amber text-wood px-6 py-3 rounded-lg font-medium transition-colors"
            >
              TikTok
            </a>
            <Link
              href="/shop"
              className="inline-block border border-wood/20 hover:border-amber text-wood px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Visit the Shop
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
        <div>
          <p className="font-serif text-3xl text-amber">351K</p>
          <p className="text-wood-light/60 text-sm mt-1">Subscribers</p>
        </div>
        <div>
          <p className="font-serif text-3xl text-amber">200+</p>
          <p className="text-wood-light/60 text-sm mt-1">Videos</p>
        </div>
        <div>
          <p className="font-serif text-3xl text-amber">DK</p>
          <p className="text-wood-light/60 text-sm mt-1">Denmark</p>
        </div>
      </div>
    </div>
  );
}
