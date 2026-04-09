import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight text-wood mb-6">
            Build something{" "}
            <span className="text-amber italic">real.</span>
          </h1>
          <p className="text-lg text-wood-light/80 mb-8 leading-relaxed max-w-md">
            I&apos;m Jesper — a Danish woodworker building real furniture from
            real wood. 351K people on YouTube watch every step.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://youtube.com/@jespermakes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-amber hover:bg-amber-dark text-cream px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Watch on YouTube
            </a>
            <Link
              href="/shop"
              className="inline-block border border-wood/20 hover:border-amber text-wood px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse the Shop
            </Link>
          </div>
        </div>
        <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl shadow-wood/10">
          <Image
            src="https://i.ytimg.com/vi/McK0kbPZNoU/maxresdefault.jpg"
            alt="Jesper in the workshop"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
