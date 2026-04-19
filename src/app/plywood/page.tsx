import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plywood | Jesper Makes",
  description:
    "A maker's guide to plywood. What it is, which kind to buy, and the three WISA panels I use for every serious project.",
  openGraph: {
    title: "Plywood | Jesper Makes",
    description:
      "A maker's guide to plywood. What it is, which kind to buy, and the three WISA panels I use for every serious project.",
    images: ["/images/plywood/plywood-hub-hero.jpg"],
  },
};

const wisaProducts = [
  {
    slug: "wisa-birch-plywood",
    label: "PANEL 01",
    name: "WISA-Birch",
    oneLiner: "Hardwood beauty, structural strength.",
    useFor: "Kitchens. Furniture. Templates. Anything that will be seen.",
    image: "/images/plywood/wisa-birch-hero.jpg",
  },
  {
    slug: "wisa-spruce-plywood",
    label: "PANEL 02",
    name: "WISA-Spruce",
    oneLiner: "Lightweight Nordic softwood. Structural workhorse.",
    useFor: "Cabin interiors. Shop projects. Painted builds.",
    image: "/images/plywood/wisa-spruce-hero.jpg",
  },
  {
    slug: "wisa-sprucebt-plywood",
    label: "PANEL 03",
    name: "WISA-Spruce BT",
    oneLiner: "Biocide-treated spruce for weather-exposed builds.",
    useFor: "Roofs. Exteriors during construction. Heavy-use shop surfaces.",
    image: "/images/plywood/wisa-sprucebt-hero.jpg",
  },
];

type Distributor = {
  name: string;
  url: string;
  note?: string;
};

type CountryDistributors = {
  country: string;
  flag: string;
  distributors: Distributor[];
  note?: string;
};

type Region = {
  region: string;
  countries: CountryDistributors[];
};

const wisaDistributors: Region[] = [
  {
    region: "Nordics & Baltics",
    countries: [
      {
        country: "Finland",
        flag: "FI",
        note: "UPM Plywood's home market. The deepest selection of WISA products anywhere.",
        distributors: [
          {
            name: "Puumerkki",
            url: "https://www.puumerkki.fi/",
            note: "UPM's strategic partner. 11 terminals across Finland.",
          },
          {
            name: "UPM Plywood (direct)",
            url: "https://www.wisaplywood.com/buy-and-contact/",
          },
        ],
      },
      {
        country: "Denmark",
        flag: "DK",
        distributors: [
          {
            name: "DLH",
            url: "https://dlh.com/produkter/konstruktion/upmplywood/",
          },
          { name: "STARK", url: "https://www.stark.dk/f/krydsfiner_maerke~wisa" },
          {
            name: "Bygma",
            url: "https://www.bygma.dk/leverandoerer/upm-plywood/",
          },
          {
            name: "Krydsfiner-Handelen",
            url: "https://krydsfiner.dk/konstruktions-krydsfiner-wisa-spruce/",
          },
        ],
      },
      {
        country: "Sweden",
        flag: "SE",
        note: "Served by Puumerkki's Nordic and Baltic network. WISA-Wall Ergo is the market-specific spruce product.",
        distributors: [
          { name: "Puumerkki (Nordic network)", url: "https://www.puumerkki.fi/" },
          {
            name: "WISA distributor finder",
            url: "https://www.wisaplywood.com/buy-and-contact/",
            note: "Use the country dropdown for Swedish retailers.",
          },
        ],
      },
      {
        country: "Norway",
        flag: "NO",
        note: "Use WISA's distributor finder — their dropdown has the current Norwegian retailers.",
        distributors: [
          {
            name: "WISA distributor finder",
            url: "https://www.wisaplywood.com/no/kontakt/",
          },
        ],
      },
      {
        country: "Estonia, Latvia, Lithuania",
        flag: "EU",
        note: "UPM has a mill in Otep\u00e4\u00e4, Estonia. Puumerkki operates across all three Baltic countries.",
        distributors: [
          { name: "Puumerkki (Baltics)", url: "https://www.puumerkki.fi/" },
        ],
      },
    ],
  },
  {
    region: "Western Europe",
    countries: [
      {
        country: "United Kingdom",
        flag: "GB",
        note: "Strong UK market with WISA-Sprucefloor as the market-specific T&G product.",
        distributors: [
          {
            name: "Peter Benson Plywood",
            url: "https://www.pbplywood.com/",
          },
          {
            name: "Chiltern Timber / Lords Builders Merchants",
            url: "https://www.chilterntimber.co.uk/product/plywood-wisa-spruce-plywood/",
          },
          { name: "Creffields (Timber & Boards)", url: "https://www.creffields.co.uk/" },
          { name: "SL Hardwoods", url: "https://www.slhardwoods.co.uk/" },
          { name: "Fulham Timber", url: "https://fulhamtimber.co.uk/" },
          { name: "Green Barn Timbers", url: "https://www.greenbarntimbers.co.uk/" },
          { name: "Kellaway Building Supplies", url: "https://www.kellaway.co.uk/" },
        ],
      },
      {
        country: "Ireland",
        flag: "IE",
        distributors: [
          { name: "Timber Ireland", url: "https://www.timberireland.ie/" },
          { name: "Morgans Timber (Dublin)", url: "https://morgans.ie/" },
          { name: "Brooks (Brooksonline)", url: "https://brooksonline.ie/timber/plywood" },
        ],
      },
      {
        country: "Germany",
        flag: "DE",
        note: "WISA sells 'Fichte Sperrholz' (spruce) and 'Birken-Multiplex' (birch) through a deep network of holz merchants.",
        distributors: [
          { name: "Roggemann (wholesale)", url: "https://www.roggemann.de/" },
          { name: "Becher Holz", url: "https://shop.becher-holz.de/" },
          { name: "Holz Steinwandel", url: "https://www.steinwandel.de/" },
          { name: "Embacher Holz", url: "https://www.embacher-holz.shop/" },
          { name: "Geyer Holz", url: "https://www.geyer-holz.de/" },
          { name: "ZEG Holz", url: "https://www.zeg-holz.de/" },
          { name: "Erfurt Holz", url: "https://erfurtholz.de/" },
        ],
      },
      {
        country: "Netherlands",
        flag: "NL",
        note: "Benelux is WISA's biggest spruce market. UPM's regional sales manager is based in the Netherlands.",
        distributors: [
          { name: "Leeuwerik", url: "https://www.leeuwerik.nl/merken/wisaplywood" },
          {
            name: "WISA distributor finder (NL)",
            url: "https://www.wisaplywood.com/nl/contacten/",
          },
        ],
      },
      {
        country: "Belgium & Luxembourg",
        flag: "BE",
        note: "Covered by the same UPM regional sales network as the Netherlands. Use WISA's finder for Benelux retailers.",
        distributors: [
          {
            name: "WISA distributor finder",
            url: "https://www.wisaplywood.com/buy-and-contact/",
          },
        ],
      },
      {
        country: "France",
        flag: "FR",
        note: "Large French merchant chains all stock WISA.",
        distributors: [
          {
            name: "Dispano",
            url: "https://www.dispano.fr/",
            note: "30,000+ products in stock, national delivery.",
          },
          { name: "Samse (Groupe Samse)", url: "https://www.samse.fr/" },
          { name: "Socobois", url: "https://www.socobois.fr/" },
        ],
      },
      {
        country: "Spain",
        flag: "ES",
        note: "Distributed via LNG vessel from Finland to Spanish ports. Use WISA's Spanish site for current retailers.",
        distributors: [
          {
            name: "WISA distributor finder (ES)",
            url: "https://www.wisaplywood.com/es/contacto/",
          },
        ],
      },
      {
        country: "Italy",
        flag: "IT",
        note: "Distributed across Italy. Use WISA's distributor finder for regional specialists.",
        distributors: [
          {
            name: "WISA distributor finder",
            url: "https://www.wisaplywood.com/buy-and-contact/",
          },
        ],
      },
      {
        country: "Poland & Central Europe",
        flag: "PL",
        note: "UPM's LNG shipping route includes Poland. Austria and Switzerland buy through the German distribution network.",
        distributors: [
          {
            name: "WISA distributor finder",
            url: "https://www.wisaplywood.com/buy-and-contact/",
          },
        ],
      },
    ],
  },
  {
    region: "North America",
    countries: [
      {
        country: "United States",
        flag: "US",
        note: "Plywood and Door has been the main WISA-Birch importer into the US for decades.",
        distributors: [
          {
            name: "Plywood and Door (USA)",
            url: "http://www.pdusa.com/products/wisabirch.htm",
            note: "Primary US importer of Finnish birch plywoods.",
          },
        ],
      },
      {
        country: "Canada",
        flag: "CA",
        note: "WISA is less widely distributed in Canada than the US. Contact Plywood and Door USA or WISA's Finland office for Canadian sourcing.",
        distributors: [
          {
            name: "WISA distributor finder",
            url: "https://www.wisaplywood.com/buy-and-contact/",
          },
        ],
      },
    ],
  },
  {
    region: "Asia-Pacific",
    countries: [
      {
        country: "Australia",
        flag: "AU",
        note: "DMK has been representing WISA in Australia for more than 40 years. Branches in Sydney, Brisbane and Gold Coast.",
        distributors: [
          {
            name: "DMK Forest Products",
            url: "https://dmkforestproducts.com.au/",
            note: "Exclusive Australian WISA Birch distributor since the 1980s.",
          },
        ],
      },
      {
        country: "New Zealand",
        flag: "NZ",
        note: "Often served via DMK Forest Products in Australia, or direct via WISA's Finland office for project-scale orders.",
        distributors: [
          {
            name: "WISA distributor finder",
            url: "https://www.wisaplywood.com/buy-and-contact/",
          },
        ],
      },
    ],
  },
];

export default function PlywoodHubPage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-6">
          MATERIAL GUIDE
        </p>
        <h1 className="font-serif text-4xl md:text-6xl leading-tight text-wood mb-6">
          Don&apos;t call it a compromise.
        </h1>
        <p className="text-lg md:text-xl text-wood-light/70 max-w-2xl leading-relaxed mb-8">
          For three years I built with pallets. Then I started using plywood
          seriously, and a lot of things got easier. This page is my
          beginner&apos;s guide to the material, the three WISA panels I use, and
          where to buy them in your country.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/blog/7-plywood-secrets-beginners-never-learn"
            className="bg-wood text-cream rounded-xl px-5 py-3 text-sm font-semibold hover:bg-wood-light transition-colors"
          >
            Read the 7 plywood secrets
          </Link>
          <a
            href="#products"
            className="border border-wood/15 text-wood-light rounded-xl px-5 py-3 text-sm font-semibold hover:border-wood/30 transition-colors"
          >
            See the three panels I use
          </a>
          <a
            href="#where-to-buy"
            className="border border-wood/15 text-wood-light rounded-xl px-5 py-3 text-sm font-semibold hover:border-wood/30 transition-colors"
          >
            Where to buy &rarr;
          </a>
        </div>
        <p className="text-xs text-wood-light/40 mt-8 max-w-2xl">
          Ambassador disclosure: I have a long-standing ambassador partnership
          with WISA Plywood (UPM Plywood, Finland). They send me panels, I build
          real things with them, and I only recommend products after I&apos;ve
          cut, sanded, and finished them myself.
        </p>
      </section>

      {/* The story section */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-wood/10">
        <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-4">
          WHY PLYWOOD
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-6">
          I used to think plywood was for people who couldn&apos;t afford real
          wood.
        </h2>
        <div className="text-wood-light/80 space-y-5 text-lg leading-relaxed">
          <p>
            That&apos;s wrong, and it took me years to figure out why. Solid
            wood is beautiful, but it moves. It warps, twists, cups, and
            argues with you every step of the way. I spent my first few years
            fighting pallet wood that had other ideas about where it wanted to
            be.
          </p>
          <p>
            Plywood is stable. It stays flat. It gives you sheet sizes you
            cannot get from a tree. It lets you build kitchens, cabinets, and
            cabin roofs that will still be flat in twenty years. And good
            plywood (emphasis on good) is not a compromise at all. It&apos;s a
            smarter material choice for most of what we&apos;re actually
            building.
          </p>
          <p>
            This page is what I wish someone had handed me when I started.
          </p>
        </div>
      </section>

      {/* The three panels */}
      <section
        id="products"
        className="max-w-5xl mx-auto px-6 py-16 border-t border-wood/10"
      >
        <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-4">
          THE THREE PANELS I USE
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-10">
          One for show, one for structure, one for weather.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {wisaProducts.map((p) => (
            <Link
              key={p.slug}
              href={`/tools/${p.slug}`}
              className="group block bg-white/50 border border-wood/[0.06] rounded-2xl p-5 hover:border-forest/40 transition-colors"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-wood/5 mb-5 relative">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-2">
                {p.label}
              </p>
              <h3 className="font-serif text-2xl text-wood mb-2">{p.name}</h3>
              <p className="text-wood-light/70 mb-4 leading-snug">
                {p.oneLiner}
              </p>
              <p className="text-xs uppercase tracking-wider text-wood-light/40 mb-2">
                I use it for
              </p>
              <p className="text-sm text-wood-light/80 mb-5">{p.useFor}</p>
              <span className="text-sm font-semibold text-forest group-hover:underline">
                Learn more &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Beginner's guide section */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-wood/10">
        <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-4">
          A BEGINNER&apos;S GUIDE
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-10">
          The stuff no one tells you on your first sheet.
        </h2>

        <div className="space-y-12 text-wood-light/80 text-lg leading-relaxed">
          <div>
            <h3 className="font-serif text-2xl text-wood mb-3">
              What plywood actually is
            </h3>
            <p>
              Plywood is thin sheets of wood (veneers) glued together with the
              grain of each layer rotated 90 degrees from the one next to it.
              That cross-grain construction is what makes plywood almost
              indestructibly stable. Solid wood moves with humidity because wood
              expands and contracts along one axis more than the others.
              Cross-banded plywood has its axes fighting each other in every
              layer, so nothing ever wins. The sheet stays flat.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-2xl text-wood mb-3">
              Birch vs spruce — the one decision that matters
            </h3>
            <p className="mb-4">
              WISA makes plywood from two species. They are not interchangeable
              and they are priced differently for good reasons.
            </p>
            <p className="mb-4">
              <strong className="text-wood">Birch</strong> is a hardwood. The
              face is smooth, hard, and light-coloured. It takes stain and
              clear finish beautifully. It&apos;s stronger per millimetre, so
              thinner panels work for the same load. It costs more. Use it
              where the panel will be seen or where you need maximum strength
              in minimum thickness.
            </p>
            <p>
              <strong className="text-wood">Spruce</strong> is a softwood. The
              face has more visible growth, character, and occasional knots.
              It&apos;s about half the weight of hardwood alternatives. It
              paints well. It costs less. Use it for walls, roofs, floors,
              shop projects, and anything that&apos;ll be hidden or painted.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-2xl text-wood mb-3">
              Grades — what they actually mean
            </h3>
            <p className="mb-4">
              The grade of a plywood panel (BB, WG, III, and so on) describes
              what the face looks like, not how strong the panel is. A lower
              grade panel has the same glue, the same cross-banded structure,
              and the same load-bearing capacity as a higher grade panel. The
              only difference is visible knots, patches, and surface defects.
            </p>
            <p>
              This means you should almost never pay for a higher grade than
              you need. If the sheet will be painted, hidden behind cladding,
              or used as a template that gets thrown away, buy the cheapest
              grade. Save the premium-faced stuff for work that will be seen.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-2xl text-wood mb-3">
              Thickness and sizing
            </h3>
            <p className="mb-4">
              WISA panels come in thicknesses from 4 mm up to 50 mm for
              structural spruce, and standard sheet sizes around 1220x2440 mm,
              1250x2500 mm, and 1500x3000 mm. Larger sizes are available on
              request, which is one of the quiet advantages of buying from a
              real plywood mill rather than a hardware store.
            </p>
            <p>
              One thing every beginner learns the hard way: the nominal sheet
              size is slightly oversized. A &quot;2440x1220&quot; sheet is usually
              somewhere around 2450x1225, with rough edges. Trim all four
              edges to a known reference before you measure for anything
              else. See the blog post below for more on that.
            </p>
          </div>
        </div>
      </section>

      {/* Where to buy WISA — country by country */}
      <section id="where-to-buy" className="max-w-5xl mx-auto px-6 py-16 border-t border-wood/10">
        <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-4">
          WHERE TO BUY
        </p>
        <h2 className="font-serif text-3xl md:text-4xl text-wood mb-6 max-w-3xl">
          Finding WISA plywood in your country.
        </h2>
        <p className="text-wood-light/80 text-lg leading-relaxed mb-10 max-w-3xl">
          WISA doesn&apos;t sell directly to makers. They distribute through a
          network of national timber yards and specialist dealers. Here are the
          distributors I know of in each country. If yours isn&apos;t listed, use
          WISA&apos;s official distributor finder at the bottom &mdash; their
          dropdown is always up to date.
        </p>

        <div className="space-y-12">
          {wisaDistributors.map((region) => (
            <div key={region.region}>
              <h3 className="font-serif text-2xl text-wood mb-6">{region.region}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {region.countries.map((c) => (
                  <div
                    key={c.country}
                    className="bg-white/50 border border-wood/[0.06] rounded-2xl p-5"
                  >
                    <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-2">
                      {c.flag} &nbsp; {c.country.toUpperCase()}
                    </p>
                    {c.note ? (
                      <p className="text-sm text-wood-light/60 italic mb-3 leading-relaxed">
                        {c.note}
                      </p>
                    ) : null}
                    <ul className="space-y-2">
                      {c.distributors.map((d) => (
                        <li key={d.name}>
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-wood hover:text-forest font-medium text-sm"
                          >
                            {d.name} &rarr;
                          </a>
                          {d.note ? (
                            <span className="block text-xs text-wood-light/50 mt-0.5">
                              {d.note}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Fallback CTA */}
        <div className="mt-12 bg-wood/[0.03] border border-wood/[0.08] rounded-2xl p-6 max-w-3xl">
          <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-2">
            COUNTRY NOT LISTED?
          </p>
          <p className="text-wood-light/80 leading-relaxed mb-4">
            WISA distributes in dozens of countries I haven&apos;t had a chance to
            list here. Their official distributor finder has the current list for
            every market they serve.
          </p>
          <a
            href="https://www.wisaplywood.com/buy-and-contact/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-wood text-cream rounded-xl px-5 py-3 text-sm font-semibold hover:bg-wood-light transition-colors inline-block"
          >
            Open WISA&apos;s official distributor finder &rarr;
          </a>
        </div>
      </section>

      {/* Blog post CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-wood/10">
        <div className="bg-forest/10 border border-forest/20 rounded-2xl p-8">
          <p className="text-[10px] font-bold tracking-[0.15em] text-forest mb-3">
            NEW ON THE BLOG
          </p>
          <h2 className="font-serif text-2xl md:text-3xl text-wood mb-4">
            7 plywood secrets most beginners never learn
          </h2>
          <p className="text-wood-light/80 mb-6 leading-relaxed">
            A year into working seriously with plywood, here&apos;s what I wish
            someone had told me on day one. Real mistakes, real fixes, no
            filler.
          </p>
          <Link
            href="/blog/7-plywood-secrets-beginners-never-learn"
            className="bg-wood text-cream rounded-xl px-5 py-3 text-sm font-semibold hover:bg-wood-light transition-colors inline-block"
          >
            Read the post &rarr;
          </Link>
        </div>
      </section>

      {/* A note from Jesper */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-wood/10">
        <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-4">
          A NOTE FROM JESPER
        </p>
        <div className="bg-white/50 border border-wood/[0.06] rounded-2xl p-8 text-wood-light/80 leading-relaxed">
          <p className="mb-4">
            I have a video on my channel titled &quot;This Will Change How You
            See Wood.&quot; I made it to push back against the idea that wood
            is only beautiful when it&apos;s expensive hardwood with a perfect
            grain.
          </p>
          <p className="mb-4">
            I think plywood needs the same treatment. It&apos;s not a
            compromise. It&apos;s not a shortcut. It&apos;s a material with its
            own logic and its own beauty, and the sooner you stop fighting
            that, the better your work will get.
          </p>
          <p>
            Thanks for reading. Go build something.
          </p>
        </div>
      </section>
    </main>
  );
}
