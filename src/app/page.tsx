import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

const products = [
  {
    href: "/shop/pallet-starter-kit",
    image: "https://i.ytimg.com/vi/SycRO164gt8/maxresdefault.jpg",
    title: "The Pallet Builder\u2019s Starter Kit",
    subtitle: "5 build guides + tool recommendations",
    comingSoon: true,
  },
  {
    href: "/shop/cone-lamp-laser",
    image: "/images/products/cone-lamp-laser-1.jpg",
    title: "Cone Lamp Laser File",
    subtitle: "SVG laser cut file \u2014 all parts included",
    price: "\u20ac5",
  },
  {
    href: "/shop/cone-lamp-3dprint",
    image: "/images/cone-lamp-3dprint/hero-firewood.jpg",
    title: "Cone Lamp 3D Print Files",
    subtitle: "STL files + PDF instruction guide",
    price: "\u20ac5",
  },
];

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
                href="/shop"
                className="inline-block bg-amber hover:bg-amber-dark text-cream px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse the Shop
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

      {/* Featured Products — Cone Lamps */}
      <section className="bg-wood text-cream">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
          <p className="text-amber text-sm font-medium tracking-widest uppercase mb-3">
            Featured
          </p>
          <h2 className="font-serif text-3xl md:text-4xl mb-10">
            The Cone Lamp
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            <Link href="/shop/cone-lamp-laser" className="group block">
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                <Image
                  src="/images/products/cone-lamp-laser-1.jpg"
                  alt="Cone Lamp Laser File"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-serif text-xl group-hover:text-amber transition-colors mb-1">
                Cone Lamp Laser File
              </h3>
              <p className="text-cream/60 text-sm mb-2">
                SVG laser cut file — all parts included
              </p>
              <p className="text-amber font-medium">€5</p>
            </Link>
            <Link href="/shop/cone-lamp-3dprint" className="group block">
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                <Image
                  src="/images/cone-lamp-3dprint/hero-firewood.jpg"
                  alt="Cone Lamp 3D Print Files"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-serif text-xl group-hover:text-amber transition-colors mb-1">
                Cone Lamp 3D Print Files
              </h3>
              <p className="text-cream/60 text-sm mb-2">
                STL files + PDF instruction guide
              </p>
              <p className="text-amber font-medium">€5</p>
            </Link>
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="max-w-5xl mx-auto px-6 py-20 md:py-24">
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-10">
          All Products
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const content = (
              <>
                <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-lg shadow-wood/5 group-hover:shadow-xl transition-shadow bg-wood/5">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.comingSoon && (
                    <div className="absolute inset-0 bg-wood/60 flex items-center justify-center">
                      <span className="bg-amber text-cream px-4 py-2 rounded-lg font-medium text-sm">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-xl text-wood group-hover:text-amber transition-colors mb-1">
                  {product.title}
                </h3>
                <p className="text-wood-light/60 text-sm mb-2">
                  {product.subtitle}
                </p>
                {product.price && (
                  <p className="text-amber font-medium">{product.price}</p>
                )}
              </>
            );

            return product.comingSoon ? (
              <div key={product.href} className="group block">
                {content}
              </div>
            ) : (
              <Link key={product.href} href={product.href} className="group block">
                {content}
              </Link>
            );
          })}
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

      <NewsletterForm />
    </>
  );
}
