import Image from "next/image";
import Link from "next/link";

export function AboutSection() {
  return (
    <section className="bg-wood text-cream">
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl shadow-black/30">
          <Image
            src="/images/jesper-workshop-tools.jpg"
            alt="Jesper in the workshop"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-serif text-3xl md:text-4xl mb-6">
            Started with pallet wood.
            <br />
            Still building.
          </h2>
          <p className="text-cream/70 leading-relaxed mb-8">
            What started as breaking down pallets in a backyard turned into a
            workshop, a YouTube channel, and a community of people who want to
            make things with their hands. No fancy CNC machines — just good
            joinery, honest materials, and the patience to do it right.
          </p>
          <Link
            href="/about"
            className="text-forest hover:text-forest-light font-medium transition-colors"
          >
            Read more about Jesper →
          </Link>
        </div>
      </div>
    </section>
  );
}
