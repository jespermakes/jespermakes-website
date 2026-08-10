import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | Jesper Makes",
  description:
    "That page is not here any more. The tools, the plans and the blog are.",
  robots: { index: false, follow: true },
};

/* A dead end used to be a bare Next.js 404. The site moved from Squarespace and
 * then Beacons, so some of the URLs that land here are old links from search
 * results or someone's bookmarks, so the visitor is real and came looking for
 * something specific. Give them the shelves instead of an error code. */

const destinations = [
  {
    href: "/tools",
    title: "Tools & Links",
    body: "Everything I actually use in the workshop, with honest notes on each one.",
  },
  {
    href: "/blog",
    title: "The blog",
    body: "Build guides and write-ups, with the measurements that matter.",
  },
  {
    href: "/cone-lamp",
    title: "Cone Lamp Designer",
    body: "Free. Set your dimensions, download the SVG, cut it tonight.",
  },
  {
    href: "/box-joint-jig",
    title: "Box Joint Jig Designer",
    body: "Free. Dial in the spacing for your saw and print the template.",
  },
  {
    href: "/shop",
    title: "The shop",
    body: "Plans, wall charts and the odd bit of merch.",
  },
  {
    href: "/about",
    title: "About",
    body: "Who I am, and how this went from pallet wood to a barn on Fyn.",
  },
];

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
      <p className="text-[10px] font-bold tracking-[2px] text-wood-light/[0.4] uppercase mb-4">
        404
      </p>
      <h1 className="font-serif text-4xl md:text-5xl text-wood mb-6">
        That page is not here.
      </h1>
      <div className="space-y-4 text-wood-light leading-relaxed mb-12">
        <p>
          Either it moved when the site did, or it never existed. Both happen.
          Nothing is broken on your end.
        </p>
        <p>
          If you followed a link from somewhere and it landed here,{" "}
          <Link href="/contact" className="text-forest hover:underline">
            tell me
          </Link>{" "}
          and I will point it at the right place.
        </p>
      </div>

      <h2 className="font-serif text-2xl text-wood mb-6">
        The things people usually want
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {destinations.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="group bg-white/60 rounded-xl p-5 border border-wood/5 hover:border-forest/20 transition-colors"
          >
            <h3 className="font-serif text-lg text-wood group-hover:text-forest transition-colors mb-1">
              {d.title}
            </h3>
            <p className="text-wood-light/70 text-sm leading-relaxed">
              {d.body}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
