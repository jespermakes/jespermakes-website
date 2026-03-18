import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-serif text-5xl md:text-6xl leading-tight text-wood mb-6">
              Build something{" "}
              <span className="text-amber italic">real.</span>
            </h1>
            <p className="text-lg text-wood-light/80 mb-8 leading-relaxed max-w-md">
              I&apos;m Jesper — a Danish woodworker who builds real furniture
              from real wood and shares every step with 351K subscribers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop/pallet-starter-kit"
                className="inline-block bg-amber hover:bg-amber-dark text-cream px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Get the Starter Kit — €35
              </Link>
              <a
                href="https://youtube.com/@jespermakes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-wood/20 hover:border-amber text-wood px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Watch on YouTube
              </a>
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

      {/* Featured Product */}
      <section className="bg-wood text-cream">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-video rounded-xl overflow-hidden order-2 md:order-1">
            <Image
              src="https://i.ytimg.com/vi/SycRO164gt8/maxresdefault.jpg"
              alt="Pallet Builder's Starter Kit"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-amber text-sm font-medium tracking-widest uppercase mb-3">
              Featured
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">
              The Pallet Builder&apos;s Starter Kit
            </h2>
            <p className="text-cream/70 mb-6 leading-relaxed">
              5 complete build guides written the way I actually build — rough
              starting point, real measurements, honest about what goes wrong
              and how to fix it.
            </p>
            <Link
              href="/shop/pallet-starter-kit"
              className="inline-block bg-amber hover:bg-amber-light text-wood px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Learn more →
            </Link>
          </div>
        </div>
      </section>

      {/* About brief */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-wood mb-6">
            Started with pallet wood.
            <br />
            Still building.
          </h2>
          <p className="text-wood-light/80 leading-relaxed mb-8">
            What started as breaking down pallets in a backyard turned into a
            workshop, a YouTube channel, and a community of people who want to
            make things with their hands. No fancy CNC machines — just good
            joinery, honest materials, and the patience to do it right.
          </p>
          <Link
            href="/about"
            className="text-amber hover:text-amber-dark font-medium transition-colors"
          >
            Read more about Jesper →
          </Link>
        </div>
      </section>
    </>
  );
}
