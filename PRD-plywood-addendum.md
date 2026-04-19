# FLOKI-WISA-PLYWOOD-CONTENT-ADDENDUM.md

**This is an addendum to `FLOKI-WISA-PLYWOOD-CONTENT.md` adding a comprehensive "Where to buy WISA" section to the `/plywood` hub page. Apply this on top of the original brief.**

**What changes:** the "Where to buy WISA" subsection inside the Beginner's Guide on `/plywood/page.tsx` (a single paragraph in the original brief) is replaced by a new, much larger dedicated section — a country-by-country distributor directory — that sits just above the "Blog post CTA" section. Everything else in the original brief stays the same.

**Why this is its own file:** the distributor data is the biggest content change and the most likely to need updates over time. Keeping it in a clearly-named constant with its own file notes makes future maintenance obvious.

---

## Research caveat (Jesper should read before sending to Floki)

This list was compiled from web research in April 2026 based on publicly visible stockists who currently list WISA products on their sites, plus the WISA articles that name regional sales managers and partners. Every entry I've included has a working site that visibly stocks or represents WISA plywood — none are guessed.

However:

1. **WISA's own dropdown at `wisaplywood.com/buy-and-contact` is authoritative and always current.** I couldn't scrape it (it's JavaScript-rendered and the list didn't appear in search results). The page always links to it as the fallback, which covers countries I haven't listed and keeps the page useful even as distributors come and go.
2. **I may have missed some excellent distributors** in each country, especially for countries where searches returned fewer results (Italy, Spain, Poland, Norway). Check with WISA's ambassador contact — they'll have the full master list and may want specific partners featured.
3. **Some listed distributors stock only a subset of the WISA range.** For a page aimed at makers, that's fine (they just need to be able to source birch or spruce panels), but if someone's looking for a specialty product like SpruceFR or Multiwall, the WISA distributor finder is the better route.

If there are specific partners WISA wants featured that I haven't listed, edit them in. Otherwise this is a solid, accurate starting list covering most of the major markets Jesper's audience lives in.

---

## Step A — Add the distributor data constant

Near the top of `src/app/plywood/page.tsx`, just below the existing `wisaProducts` constant, add this new constant. This keeps the data separate from the rendering logic so future updates don't need to touch JSX.

```tsx
type Distributor = {
  name: string;
  url: string;
  note?: string;
};

type CountryDistributors = {
  country: string;
  flag: string; // 2-letter ISO code for the flag — e.g. "DK" for Denmark
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
        note: "UPM has a mill in Otepää, Estonia. Puumerkki operates across all three Baltic countries.",
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
```

---

## Step B — Replace the "Where to buy WISA" subsection

In the original brief, the Beginner's Guide section ended with a short paragraph "Where to buy WISA" that pointed to WISA's distributor finder. **Delete that entire subsection** (the one starting `<h3>Where to buy WISA</h3>`) and replace it with nothing — the section gets promoted to its own major section below.

Then, just above the "Blog post CTA" section (the one with `bg-amber/10`), insert this new dedicated section:

```tsx
{/* Where to buy WISA — country by country */}
<section className="max-w-5xl mx-auto px-6 py-16 border-t border-wood/10">
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
              <p className="text-[10px] font-bold tracking-[0.15em] text-amber mb-2">
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
                      className="text-wood hover:text-amber font-medium text-sm"
                    >
                      {d.name} →
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
      Open WISA&apos;s official distributor finder →
    </a>
  </div>
</section>
```

---

## Step C — Small copy change in the hero

In the hero section of `/plywood`, update the intro subheadline to mention the distributor guide, so people landing from a "where can I buy this?" intent aren't buried three scrolls down. Replace the current lead paragraph with:

```tsx
<p className="text-lg md:text-xl text-wood-light/70 max-w-2xl leading-relaxed mb-8">
  For three years I built with pallets. Then I started using plywood
  seriously, and a lot of things got easier. This page is my
  beginner&apos;s guide to the material, the three WISA panels I use, and
  where to buy them in your country.
</p>
```

And add a third button to the hero button group, directly after the existing "See the three panels I use" button:

```tsx
<a
  href="#where-to-buy"
  className="border border-wood/15 text-wood-light rounded-xl px-5 py-3 text-sm font-semibold hover:border-wood/30 transition-colors"
>
  Where to buy →
</a>
```

And add `id="where-to-buy"` to the new distributor section's outer `<section>` tag so the button anchor works:

```tsx
<section id="where-to-buy" className="max-w-5xl mx-auto px-6 py-16 border-t border-wood/10">
```

---

## Notes for Floki

1. **No new dependencies.** Everything uses existing Tailwind classes and design tokens.

2. **Flag rendering.** The `flag` field is a 2-letter country code shown as text (like `DK`, `GB`). If the existing site has a flag icon component or a country flag emoji convention that renders more nicely, swap that in. Emoji flags are an option (🇩🇰, 🇬🇧, 🇺🇸) but they render inconsistently across operating systems — text codes are the safe default.

3. **External links.** All distributor links open in a new tab (`target="_blank" rel="noopener noreferrer"`). This is deliberate — we're sending people off-site and they should be able to get back easily.

4. **Layout scales.** The distributor grid uses `grid-cols-1 md:grid-cols-2`. On mobile it's one column, on desktop it's two. Even with 15+ countries this reads cleanly.

5. **Future-proofing.** If WISA adds a direct-to-consumer storefront, or if specific ambassador-preferred distributors get named, all updates happen inside the `wisaDistributors` constant. No JSX changes needed.

6. **Sort order.** Countries within each region are roughly ordered by market size / Jesper's audience density, not alphabetically. Finland is first in Nordics (home market), UK is first in Western Europe (largest English-speaking audience), US is first in North America, Australia first in APAC. Tweak if Jesper wants a different order.

---

## Notes for Jesper

**Before sending to Floki, scan this list for:**

1. **Accuracy.** I've verified every listed distributor visibly stocks WISA on their website. But if you know a listed distributor has since dropped WISA, or you know of a better-fit distributor for a given country, edit the list directly.

2. **Ambassador partners.** If WISA has specific partners they want featured (the kind of preferred-partner relationship that might come with ambassador deal perks), get a list from them and drop those in. They may want their strategic partners — like Puumerkki in Finland or DMK in Australia — called out explicitly with logos eventually. For v1, the plain text list is fine.

3. **Countries where I said "use WISA's finder" but you know a specific distributor.** Those gaps (Norway, Spain, Italy, Poland, New Zealand, Canada) would be worth filling if you have the contacts.

4. **The "Where to buy →" button in the hero.** Makes the page useful for the people who Google "where can I buy WISA plywood" — they hit your page and get a direct path without reading the whole guide. That's a better SEO signal and a better visitor experience.

**Likely v1.1 improvements** (not in this brief, parked for later):
- Logo badges for the 3-4 biggest regional distributors (Puumerkki, DMK, Plywood and Door, maybe Dispano).
- A proper country selector / search input if the list grows past 30 entries.
- Localised subpages (`/plywood/dk`, `/plywood/uk`) with market-specific distributor emphasis. Probably overkill for v1.

---

*Addendum prepared for Floki. Apply on top of the original `FLOKI-WISA-PLYWOOD-CONTENT.md` brief. Both files ship together as a single deploy.*
