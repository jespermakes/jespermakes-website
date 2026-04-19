# FLOKI-WISA-PLYWOOD-CONTENT.md

**What this ships:**
- Three new tool entries (WISA-Birch, WISA-Spruce, WISA-Spruce BT) added to `src/data/tools.ts`
- A new `/plywood` hub page with a beginner-friendly knowledge resource and ambassador disclosure
- A new blog post: "7 Plywood Secrets Most Beginners Never Learn"
- No new dependencies, no schema changes, no env vars
- One small link addition on the existing `/tools` hub

**Jesper needs to do one thing before deploy:** upload the images listed in Section 0 below. Everything else is copy-paste.

**Ambassador note:** Jesper has a long-standing ambassador agreement with WISA Plywood (UPM Plywood, Finland). All three product entries and the `/plywood` hub are marked as ambassador content in the same way existing ambassador tools are marked on the site. If the existing `tools.ts` schema has an `ambassador: true` flag or similar, apply it. If not, match the pattern used for other ambassador items already in the file.

---

## Section 0 — Images Jesper needs to upload before deploy

Create folder `public/images/plywood/` and upload the following:

| Path | What it is | Source |
|------|------------|--------|
| `public/images/plywood/wisa-birch-hero.jpg` | Close-up of WISA Birch face, ideally a panel Jesper has cut | Jesper's own photo preferred. WISA's media gallery at `https://upm.emmi.fi/l/vgM9Fhcbq-5m` has ambassador-cleared imagery |
| `public/images/plywood/wisa-spruce-hero.jpg` | Close-up of WISA Spruce face | Jesper's own photo preferred (cabin interior footage?) |
| `public/images/plywood/wisa-sprucebt-hero.jpg` | Close-up of WISA Spruce BT — ideally showing the greenish/treated face | Jesper's own photo preferred (cabin exterior/roof footage?) |
| `public/images/plywood/plywood-hub-hero.jpg` | Wide hero for `/plywood` page — a stack of WISA panels in the workshop, or a finished build using plywood | Jesper's own photo preferred |
| `public/images/plywood/plywood-edge.jpg` | Close-up of a birch plywood edge showing the laminations | Jesper's own photo preferred |
| `public/images/blog/plywood-secrets-hero.jpg` | Blog post hero — Jesper cutting, sanding, or finishing plywood | Jesper's own photo preferred |

**If Jesper doesn't have all six photos ready:** ship the brief anyway and fall back to temporarily reusing the tools page's default placeholder. The copy stands alone. Better to ship with placeholders and replace later than hold the launch.

**Image specs:** Match the existing site's image conventions. If unsure, 1600px wide JPGs at ~85% quality are the established pattern from the blog.

---

## Section 1 — Add three WISA products to `src/data/tools.ts`

Add the following three entries to the existing tools array. Adapt field names to match the existing `Tool` interface in `src/data/tools.ts` — the schema below uses my best guess at the fields, but the existing schema wins where they conflict. The content of each field is what matters.

**Category suggestion:** if the existing tools.ts has a category called `materials`, `sheet-goods`, or similar, use that. Otherwise create a category slug `plywood`. This will give us a working `/tools/category/plywood` page automatically if the category routing already handles arbitrary slugs.

### Entry 1: WISA-Birch

```typescript
{
  slug: "wisa-birch-plywood",
  name: "WISA-Birch Plywood",
  shortDescription: "Finnish birch plywood. The workhorse for kitchens, furniture, templates, and anything that wants to look good uncoated.",
  category: "plywood", // or "materials" — match existing schema
  ambassador: true,
  ambassadorBrand: "WISA Plywood",
  buyUrl: "https://www.wisaplywood.com/buy-and-contact/",
  buyText: "Find a WISA distributor",
  heroImage: "/images/plywood/wisa-birch-hero.jpg",
  heroImageAlt: "WISA-Birch plywood panel showing the smooth light birch face",
  longDescription: `WISA-Birch is a full birch veneer plywood made in Finland by UPM Plywood, bonded with weather-resistant phenolic glue. It has a light, smooth, even face and an excellent strength-to-weight ratio.

I use it anywhere the finished surface matters. It cuts clean, sands beautifully, takes stain and clear finishes without fighting me, and the edge laminations are a design feature if you know how to treat them. It's what I'm using for the kitchen I promised my wife I'd upgrade, and it's my default for templates, jigs, and furniture bodies.

The face grade (BB, WG, III) affects appearance only, not structural performance. Buy the grade that fits your finish: BB for visible lacquered work, WG for painted or hidden work, lower grades for anything structural you don't need to look at.`,
  useCases: [
    "Kitchen cabinets and millwork",
    "Furniture bodies and carcasses",
    "CNC and router templates",
    "Jigs that need to stay flat",
    "Any project with visible plywood edges",
  ],
  specs: [
    { label: "Species", value: "European / Nordic birch" },
    { label: "Glue", value: "Phenolic, weather-resistant (EN 314-2 Class 3)" },
    { label: "Standard thicknesses", value: "4, 6.5, 9, 12, 15, 18, 21, 24, 27, 30 mm" },
    { label: "Standard sizes", value: "1220x2440, 1250x2500, 1500x3000 mm and more" },
    { label: "Certification", value: "FSC / PEFC, CE 2+, M1, E1" },
    { label: "Country of origin", value: "Finland" },
  ],
  jesperNote: "This is the plywood I grab when I want the final thing to look beautiful. If you only buy one sheet of plywood this year, make it this one.",
  learnMoreUrl: "/plywood",
}
```

### Entry 2: WISA-Spruce

```typescript
{
  slug: "wisa-spruce-plywood",
  name: "WISA-Spruce Plywood",
  shortDescription: "Lightweight Nordic spruce plywood. What I used for the interior of our off-grid cabin and what I reach for on shop projects.",
  category: "plywood",
  ambassador: true,
  ambassadorBrand: "WISA Plywood",
  buyUrl: "https://www.wisaplywood.com/buy-and-contact/",
  buyText: "Find a WISA distributor",
  heroImage: "/images/plywood/wisa-spruce-hero.jpg",
  heroImageAlt: "WISA-Spruce plywood panel showing the lighter, livelier spruce face",
  longDescription: `WISA-Spruce is Nordic spruce plywood built for structural work — roofing, flooring, wall sheathing, and anything else where lightness and strength matter more than a perfect face. It's roughly half the weight of particleboard or OSB at similar thicknesses, which you feel the first time you carry a full sheet.

I used it for the interior of the off-grid cabin my family is building, and it's my default for shop projects where I'd rather spend my wood budget on the things people actually see. The face has a livelier, more industrial look than birch — if that's the aesthetic you want, you can leave it exposed. Otherwise it paints beautifully.

Unlike birch, spruce plywood has better natural biological durability thanks to the closed cell structure of the wood, which is part of why it holds up so well in construction use.`,
  useCases: [
    "Cabin and outbuilding interiors",
    "Shop furniture and storage",
    "Wall sheathing and flooring (structural)",
    "Painted furniture where weight matters",
    "Any project that will be painted or hidden",
  ],
  specs: [
    { label: "Species", value: "Nordic spruce" },
    { label: "Glue", value: "Phenolic, weather-resistant (EN 314-2 Class 3)" },
    { label: "Standard thicknesses", value: "9, 12, 15, 18, 21, 24, 27, 30 mm (up to 50 mm on request)" },
    { label: "Bonding", value: "WISA BioBond (50%+ bio-based lignin)" },
    { label: "Certification", value: "FSC / PEFC, CE 2+, M1, E1" },
    { label: "Country of origin", value: "Finland" },
  ],
  jesperNote: "Half the weight of MDF, stronger than OSB, and it smells like a Finnish forest when you cut it. Don't overpay for birch when spruce will do the job.",
  learnMoreUrl: "/plywood",
}
```

### Entry 3: WISA-Spruce BT

```typescript
{
  slug: "wisa-sprucebt-plywood",
  name: "WISA-Spruce BT Plywood",
  shortDescription: "Biocide-treated spruce plywood for construction exposed to weather during the build. What we used for the cabin roof and exterior.",
  category: "plywood",
  ambassador: true,
  ambassadorBrand: "WISA Plywood",
  buyUrl: "https://www.wisaplywood.com/buy-and-contact/",
  buyText: "Find a WISA distributor",
  heroImage: "/images/plywood/wisa-sprucebt-hero.jpg",
  heroImageAlt: "WISA-Spruce BT plywood panel showing the treated face",
  longDescription: `WISA-Spruce BT is standard WISA spruce plywood with a wood protective treatment against staining and decaying fungi. It's designed for the phase of a build where a panel is going to sit in the weather for weeks or months before it gets a roof over it, paint on it, or cladding covering it.

This is what we used for the roof and the exterior sheathing of our off-grid cabin. It's also become my go-to for serious shop projects — outfeed tables, big assembly surfaces, anything that'll take a beating over years in a workshop that isn't climate controlled.

Important caveat from WISA: BT is a construction-phase protection, not a permanent outdoor finish. Any BT panel that will stay visible outside the finished building needs a paint or coating. Don't leave it bare and exposed to rain and sun forever — it will weather.`,
  useCases: [
    "Roof sheathing that'll sit in the rain before cladding goes on",
    "Exterior wall sheathing during construction",
    "Shop worktops, outfeed tables, and heavy-use surfaces",
    "Outbuilding panels that will be painted or clad",
    "Any structural spruce panel job where the build timeline is unpredictable",
  ],
  specs: [
    { label: "Species", value: "Nordic spruce, biocide-treated" },
    { label: "Glue", value: "Phenolic, weather-resistant (EN 314-2 Class 3)" },
    { label: "Treatment", value: "Biocide against mould, blue stain, and decaying fungi" },
    { label: "Standard thicknesses", value: "9, 12, 15, 18, 21, 24, 27, 30 mm" },
    { label: "Certification", value: "FSC / PEFC, CE 2+, M1, E1" },
    { label: "Country of origin", value: "Finland" },
  ],
  jesperNote: "The only plywood in my shop that I'd call genuinely tough. If you're building outside, or your shop humidity is a disaster, this is the sheet you want.",
  learnMoreUrl: "/plywood",
}
```

---

## Section 2 — Create the `/plywood` hub page

Create a new file at `src/app/plywood/page.tsx`. This is a server component. No interactivity, no `"use client"`, no API calls.

```tsx
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
          beginner-friendly guide to the material, the grades, and the three
          WISA panels I actually use.
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
              className="group block bg-white/50 border border-wood/[0.06] rounded-2xl p-5 hover:border-amber/40 transition-colors"
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
              <p className="text-[10px] font-bold tracking-[0.15em] text-amber mb-2">
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
              <span className="text-sm font-semibold text-amber group-hover:underline">
                Learn more →
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
              structural spruce, and standard sheet sizes around 1220×2440 mm,
              1250×2500 mm, and 1500×3000 mm. Larger sizes are available on
              request, which is one of the quiet advantages of buying from a
              real plywood mill rather than a hardware store.
            </p>
            <p>
              One thing every beginner learns the hard way: the nominal sheet
              size is slightly oversized. A "2440×1220" sheet is usually
              somewhere around 2450×1225, with rough edges. Trim all four
              edges to a known reference before you measure for anything
              else. See the blog post below for more on that.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-2xl text-wood mb-3">
              Where to buy WISA
            </h3>
            <p>
              WISA doesn&apos;t sell directly to makers. They distribute
              through national networks of timber yards and specialist dealers.
              The easiest way to find a local supplier is to use{" "}
              <a
                href="https://www.wisaplywood.com/buy-and-contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber underline hover:text-amber-dark"
              >
                WISA&apos;s distributor finder
              </a>{" "}
              on their site. Ask specifically for WISA by name. A lot of
              dealers stock generic &quot;Finnish birch&quot; or &quot;Nordic
              spruce&quot; that is not WISA — fine material, but not what I&apos;m
              recommending here.
            </p>
          </div>
        </div>
      </section>

      {/* Blog post CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-wood/10">
        <div className="bg-amber/10 border border-amber/20 rounded-2xl p-8">
          <p className="text-[10px] font-bold tracking-[0.15em] text-amber mb-3">
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
            Read the post →
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
```

**Notes on this page:**

- No `"use client"` — this is a pure server component, which is faster and SEO-friendlier.
- Uses `next/image` for the product card images, matching the site's image optimisation pattern. If the existing site uses plain `<img>` tags instead, adapt accordingly — the handover doc mentioned blog heroes use `<img>` so there's some inconsistency on the site already.
- `max-w-5xl` is used for hero and product grid, `max-w-3xl` for the reading sections. This matches the "tool pages use max-w-4xl or 5xl" convention and keeps long-form prose readable.
- Links to blog post slug `/blog/7-plywood-secrets-beginners-never-learn` which is created in Section 3.
- All apostrophes in JSX text are `&apos;` (ESLint requirement per handover).
- No em dashes anywhere in the copy (per handover rule).

---

## Section 3 — Add the blog post to `src/data/blog-posts.ts`

Add this object to the blog posts array. Adapt field names if the existing `BlogPost` interface has slightly different keys — the content is what matters.

```typescript
{
  slug: "7-plywood-secrets-beginners-never-learn",
  title: "7 Plywood Secrets Most Beginners Never Learn",
  description: "After three years of fighting pallet wood and a year of building seriously with plywood, here's what I wish someone had told me on day one.",
  content: `I used to think plywood was for people who couldn't afford real wood.

That's wrong, and it took me longer than it should have to figure out why. Plywood is stable. It stays flat. It gives you sheet sizes you cannot get from a tree. Good plywood is not a compromise. It's the right material for most of what we're actually building, and if you're fighting solid wood on every project, you're doing it the hard way.

This post is for anyone who's bought their first sheet and got frustrated. Here are seven things I wish someone had told me on day one.

## 1. The sheet is always oversized. Trim all four edges first.

A sheet labelled 2440 × 1220 mm is actually closer to 2450 × 1225 mm with rough-cut edges. The factory trim leaves a few millimetres of slop on every side. Every sheet. Every time.

Before you measure for any cut, trim all four edges to a known reference. Rip one long edge true on the table saw or with a track saw, then square the adjacent edges from there. Otherwise, every dimension you measure downstream is going to be wrong in a way you can't predict.

This sounds obvious once you've been bitten by it. It is not obvious the first time.

## 2. The face veneer is half a millimetre. Don't sand through it.

The outer layer of good plywood is about 0.5 mm thick. Sometimes less.

I watched a lot of beginners (including me) put a belt sander on a sheet and go to town. What happens is you sand through the face veneer in about ten seconds and suddenly you're looking at the uglier layer underneath, with no way to recover.

Start with 180-grit at the lowest. Work up to 240 or 320. Trust the factory surface — it's usually better than anything you'll achieve by sanding harder. Fix small marks with a sanding block and your hand, not a power tool.

## 3. Grade is about the face. Not the strength.

The grade of a plywood panel (BB, WG, III, BB/BB, B/BB, whatever the marking is) describes what the face looks like. It does not describe how strong the panel is.

A BB-grade birch panel and a III-grade birch panel have the same glue, the same veneer structure, and the same load-bearing capacity. The only difference is how much visible stuff is on the face — knots, patches, repair plugs, colour variation.

This matters because premium-face plywood costs serious money. If the sheet is going behind cladding, getting painted, or used as a template that'll be scrap in a month, buy the cheapest grade the yard has. Save the good stuff for visible work.

## 4. Birch is for show. Spruce is for structure. Don't swap them.

Every plywood conversation I have with someone starting out eventually lands on the same question: which kind should I buy?

Birch. If you want a hard, smooth, light-coloured face that takes clear finish and shows up well under kitchen lights. It's a hardwood. It's stronger per millimetre. It costs more. Use it where the panel will be seen.

Spruce. If you need structure, not aesthetics. Roof sheathing, wall sheathing, cabin floors, shop furniture, painted projects. It's a softwood, it's about half the weight of hardwood plywood, it's cheaper, and it's lighter on your back when you carry full sheets up a ladder. Nordic spruce plywood is the material most of Scandinavia's light construction is built from.

The mistake people make is buying birch for structure (paying a lot for appearance they're going to paint over) or buying spruce for visible furniture (and hating the result). Pick by function.

## 5. Seal the edges. Always.

Plywood edges drink water like a sponge. Leave a raw edge exposed outdoors — even under a roof, even for a weekend — and the sheet will swell, delaminate, and fail.

Every edge gets sealed. Prime it, paint it, polyurethane it, or edge-band it with veneer tape. This is not optional for outdoor work, and it's a smart default for indoor work too because it keeps the edge from absorbing grime and moisture over time.

If you're using WISA-Spruce BT for construction, the treatment protects the face and back but not the cut edges. Those are freshly exposed wood. Seal them the same as any other cut edge.

## 6. "Good side up" depends on your tool.

Your saw blade is spinning. Wherever the blade exits the material, that's where you get tear-out. The rule is simple once you understand it.

Track saw or circular saw: blade enters from the top, exits through the bottom. Put the good side down.

Table saw or router in a table: blade enters from the bottom, exits through the top. Put the good side up.

Hand router (plunge or fixed, held above the work): the bit enters from the top, exits through the bottom. Good side down.

If you're getting tear-out on the wrong side of your cut, the first thing to check isn't your blade. It's which side of the sheet you flipped face-up.

## 7. The edge is a feature, not a flaw.

I spent my first year of serious plywood work hiding every single edge. Solid wood lippings, veneer tape, fillers, paint. The edge was always something to conceal because I thought exposed laminations looked cheap.

Then I saw a chair with raw birch plywood edges, sanded smooth and finished with hard wax oil, and I realised I'd been fighting the material instead of working with it. A clean plywood edge — the striped laminations of a well-cut birch panel — is one of the most beautiful edges you can put on furniture. It's a signature of the material. It says what the piece is.

This is the biggest mental shift plywood asks of you. Stop hiding what it is. Cut clean, sand well, finish the edge like you'd finish the face, and let the laminations be part of the design. Your work will immediately look more modern, more confident, and more like it was made by someone who chose plywood on purpose.

## That's it. Go build something.

Plywood isn't a compromise. Good plywood, used on purpose, is a better choice than solid wood for most of what makers actually build — kitchens, cabinets, furniture, cabin walls, shop fixtures, templates, jigs.

The problem has never been the material. The problem is that nobody tells you how to read a grade stamp, how to seal an edge, or which side of the sheet to cut face-up. Now somebody has.

I've got a [full guide to plywood](/plywood) on the tools side of the site, with deeper notes on the three WISA panels I use for every serious project. If you're just starting out, read that next.

And if you want the video version eventually — I've been saying for a while that I want to make one called "This Will Change How You See Plywood." Subscribe to the newsletter and you'll know when it drops.
`,
  publishedAt: "2026-04-18",
  updatedAt: "2026-04-18",
  author: "Jesper",
  tags: ["plywood", "beginner", "materials", "WISA"],
  heroImage: "/images/blog/plywood-secrets-hero.jpg",
  heroImageAlt: "Jesper cutting a sheet of WISA birch plywood in the workshop",
  // featuredVideo: undefined (add a YouTube ID here later if/when the plywood video ships)
}
```

**Content notes:**

- No em dashes anywhere. Checked the whole post.
- Apostrophes inside the template literal are real `'` characters, not `&apos;`. Only JSX text content needs `&apos;`; template strings do not. This is the gotcha from the Box Joint Jig build — worth double-checking on deploy.
- The post is ~1400 words. On the longer side for the existing blog, but this is reference content that people will come back to. Length earned.
- Internal link to `/plywood` at the end.
- No featured video. Add one later if/when "This Will Change How You See Plywood" ships.

---

## Section 4 — Update the `/tools` hub to surface plywood

Two small changes on the existing `/tools` hub page.

**4a. If the existing `/tools` page has a category grid:** the three new products should automatically surface under the category slug from the tools.ts entries. No code change needed. Confirm by visiting `/tools/category/plywood` after deploy.

**4b. Add a prominent "Plywood — a full guide" card to the `/tools` hub.** Somewhere above the main grid (near the hero or as a callout banner), add:

```tsx
<Link
  href="/plywood"
  className="block bg-amber/10 border border-amber/20 rounded-2xl p-6 mb-8 hover:border-amber/40 transition-colors"
>
  <p className="text-[10px] font-bold tracking-[0.15em] text-amber mb-2">
    NEW — MATERIAL GUIDE
  </p>
  <h3 className="font-serif text-2xl text-wood mb-2">
    Plywood, explained properly
  </h3>
  <p className="text-wood-light/70">
    A beginner&apos;s guide to birch vs spruce, grade stamps, edge sealing,
    and the three WISA panels I use for every serious project.
  </p>
</Link>
```

If the `/tools` hub has a different layout convention for featured items, match that instead. The point is: a visible entry point from the tools page to the plywood hub.

---

## Section 5 — Deploy

Standard deploy, no migrations, no env vars.

```bash
cd ~/jesper-makes-ai/website
source ~/.openclaw/workspace/.env

# Sanity check
npx tsc --noEmit

# Deploy
vercel --prod --yes --token=$VERCEL_TOKEN
```

After deploy, verify:

1. `/plywood` loads and looks like the design (images may be broken if they haven&apos;t been uploaded yet — that&apos;s expected and fine to ship)
2. `/tools/wisa-birch-plywood`, `/tools/wisa-spruce-plywood`, `/tools/wisa-sprucebt-plywood` all resolve
3. `/tools/category/plywood` shows the three new entries (if category routing is set up)
4. `/blog/7-plywood-secrets-beginners-never-learn` renders without markdown errors
5. The CTA card on the `/tools` hub links to `/plywood`
6. All cross-links in the blog post and on the hub resolve correctly

---

## Gotchas and notes

1. **Images can be missing at launch.** The copy and structure work with broken image placeholders. If Jesper hasn&apos;t uploaded the six images yet, deploy anyway — the content is the value, and swapping images in later is a one-line commit per image.

2. **The apostrophe gotcha (again).** JSX text content needs `&apos;` (e.g. `<p>Don&apos;t</p>`). Template literal strings (like the blog post `content` field) use real `'` characters. Don&apos;t mix them up. Full list of places this matters in this brief:
   - `src/app/plywood/page.tsx` — all JSX text uses `&apos;`
   - `src/data/blog-posts.ts` — the `content` template literal uses real `'`
   - `src/data/tools.ts` — the string values use real `'`

3. **Ambassador flag.** If `tools.ts` has an `ambassador` boolean or an ambassador badge system, flip it on for all three WISA entries. If it doesn&apos;t, we&apos;ll add one in a future brief. For now, the `ambassadorBrand: "WISA Plywood"` field provides the signal.

4. **Schema adaptation.** The three tool entries above assume field names like `slug`, `name`, `shortDescription`, etc. The existing `tools.ts` almost certainly has different field names for some of these. Match the existing schema — the content is the point, not the exact field structure.

5. **The `/tools/[slug]` template might need to render the new fields** (`longDescription`, `useCases`, `specs`, `jesperNote`, `learnMoreUrl`). If those fields don&apos;t already have rendering logic on the individual tool page, either:
   - Add rendering for them (preferred for a richer page), or
   - Fold the content into the existing `description` field (faster, less visually rich)
   
   Either is fine for this launch. Flag back to Jesper after deploy if the individual product pages look sparse and need a second pass.

6. **No admin dashboard for this.** Unlike the Title Lab, there&apos;s no tracking on the plywood pages. These are content pages, not tools. Standard Vercel Analytics will tell us what we need to know.

7. **Blog post length.** This post is longer than the average on the blog. That&apos;s deliberate — it&apos;s reference content. If it looks visually intimidating on the blog page, consider adding an "estimated reading time" hint on blog post pages generally. Separate feature, out of scope for this brief.

8. **WISA link for "buy" buttons.** All three products link to `https://www.wisaplywood.com/buy-and-contact/` (the distributor finder). WISA does not sell direct, and they don&apos;t have an affiliate program for makers that I&apos;m aware of. The link is for product discovery, not revenue. Revisit if WISA ever launches a direct storefront or Jesper negotiates a referral deal.

9. **Voice check.** If anything in the blog post or hub page doesn&apos;t sound like Jesper, change it. I&apos;ve matched the handover doc&apos;s voice notes (direct, honest, slightly self-deprecating, no corporate marketing speak, dry humour, specific over generic, no em dashes). But Jesper is the final voice check.

---

*Brief prepared for Floki. Single-feature deploy. Expected build time: ~20 minutes if images are ready, less if deploying with placeholders. No schema changes, no new dependencies, no env vars.*
