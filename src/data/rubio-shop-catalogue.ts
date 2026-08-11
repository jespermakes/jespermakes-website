/**
 * The curated Rubio shop catalogue.
 *
 * Every handle here was checked against both live product feeds
 * (rubiomonocoatusa.com/products.json and rubiomonocoat.co.uk/products.json)
 * rather than matched by title. Automatic matching was tried and rejected: it
 * paired "Cotton Tote" with "Cotton White" and "Wood Pen" with "WoodPrep",
 * and a wrong handle means a dead buy button.
 *
 * euHandle: null means the product genuinely is not carried in Europe. The only
 * one today is Matcha Green, which is a US creator colour.
 *
 * Voice rule: first person only where Jesper has actually said it about a
 * product he uses. Everything else is plain description. Listing a product is
 * already an implicit recommendation, inventing a personal anecdote on top of
 * that would not be.
 */

export interface CatalogueEntry {
  slug: string;
  title: string;
  blurb: string;
  category: CategoryKey;
  usHandle: string | null;
  euHandle: string | null;
  sortOrder: number;
  featured?: boolean;
  videoEmbedUrl?: string;
  jesperNote?: string;
  longDescription?: string;
}

export type CategoryKey = "signature" | "interior" | "exterior" | "prep" | "care" | "colour" | "tools";

export const CATEGORIES: Array<{ key: CategoryKey; label: string; blurb: string }> = [
  { key: "signature", label: "My own colour", blurb: "The one Rubio and I made together." },
  { key: "interior", label: "Inside", blurb: "Raw wood indoors. Furniture, floors, counters, anything you touch." },
  { key: "exterior", label: "Outside", blurb: "Decking, cladding, fences. Weather is the enemy here." },
  { key: "prep", label: "Before you finish", blurb: "The steps people skip and then regret." },
  { key: "care", label: "Keeping it alive", blurb: "A finish is not a one-off. This is the boring part that makes it last." },
  { key: "colour", label: "Choosing a colour", blurb: "Colour on a screen lies. These do not." },
  { key: "tools", label: "Applying it", blurb: "Pads, holders, and the can opener you will wish you had bought." },
];

export const CATALOGUE: CatalogueEntry[] = [
  {
    slug: "matcha-green",
    title: 'Oil Plus 2C "Matcha Green"',
    blurb: "My own colour. A limited run of Oil Plus 2C that Rubio and I made together, 390 mL only.",
    category: "signature",
    usHandle: "oil-plus-2c-matcha-green-by-jesper-makes",
    euHandle: null,
    sortOrder: 1,
    featured: true,
    videoEmbedUrl: "https://www.instagram.com/p/DRFFW_iCNzz/embed",
    jesperNote:
      "Do, or do not. There is no try. That is what I was thinking about when we picked this green. Treat the wood with care and respect, and treat people the same way.",
    longDescription: [
      "Rubio Monocoat asked me to make a colour. That is not a thing I expected to ever be asked.",
      "",
      "Matcha Green is Oil Plus 2C in a green that came out of the same place the rest of my work comes from. Green for growth, for nature, for the reason I started making things in the first place. Rubio's own green stands for more or less the same, which is probably why the whole thing felt easy.",
      "",
      "It behaves like any other Oil Plus 2C. One coat, bonded to the wood fibre, no film sitting on top, food safe once cured. The only difference is the colour, and the fact that there is not much of it.",
      "",
      "390 mL only, limited run, final sale. Sold through Rubio USA.",
    ].join("\n"),
  },

  // ---------------------------------------------------------------- interior
  {
    slug: "oil-plus-2c",
    title: "Oil Plus 2C",
    blurb:
      "The one I reach for indoors. One coat, bonds to the wood fibre instead of sitting on top, food safe once cured, and it comes in about forty colours.",
    category: "interior",
    usHandle: "oil-plus-2c-390ml",
    euHandle: "oil-plus-2c",
    sortOrder: 10,
    featured: true,
  },
  {
    slug: "sheenplus",
    title: "SheenPlus",
    blurb: "A topcoat for Oil Plus 2C when a surface needs more sheen or a bit more wear resistance than the oil alone gives.",
    category: "interior",
    usHandle: "sheenplus",
    euHandle: "sheenplus",
    sortOrder: 12,
  },
  {
    slug: "precolour",
    title: "Precolour",
    blurb: "Goes on before the oil to push the wood darker or change its base tone. Lets you hit colours the oil cannot reach on its own.",
    category: "interior",
    usHandle: "precolor-easy",
    euHandle: "precolour",
    sortOrder: 14,
  },

  // ---------------------------------------------------------------- exterior
  {
    slug: "durogrit",
    title: "DuroGrit",
    blurb:
      "Exterior, and it is the one I trust on raw wood outside. Binds with the fibre rather than filming over it, so it wears instead of peeling.",
    category: "exterior",
    usHandle: "durogrit",
    euHandle: "durogrit-1",
    sortOrder: 20,
    featured: true,
  },
  {
    slug: "woodcream",
    title: "WoodCream",
    blurb:
      "For exterior wood that already has a coating on it. The only one in the range that will go over old paint without sanding back to bare.",
    category: "exterior",
    usHandle: "woodcream",
    euHandle: "woodcream",
    sortOrder: 22,
  },
  {
    slug: "woodcream-softener",
    title: "WoodCream Softener",
    blurb: "Thins WoodCream for spray application or for getting into rough sawn timber.",
    category: "exterior",
    usHandle: "woodcream-softener",
    euHandle: "woodcream-softener",
    sortOrder: 24,
  },
  {
    slug: "hybrid-wood-protector",
    title: "Hybrid Wood Protector",
    blurb: "Exterior protection for vertical wood where you want the grain to stay visible and the finish to grey down evenly.",
    category: "exterior",
    usHandle: "hybrid-wood-protector",
    euHandle: "hybrid-wood-protector",
    sortOrder: 26,
  },

  // -------------------------------------------------------------------- prep
  {
    slug: "pre-aging",
    title: "Pre-Aging",
    blurb: "Ages new wood on purpose, so a repair or an addition stops looking newer than everything around it.",
    category: "prep",
    usHandle: "pre-aging",
    euHandle: "pre-aging",
    sortOrder: 30,
  },
  {
    slug: "tannin-remover",
    title: "Tannin Remover",
    blurb: "Pulls the dark tannin staining out of oak and other high-tannin woods before you put any finish near them.",
    category: "prep",
    usHandle: "tannin-remover",
    euHandle: "tannin-remover",
    sortOrder: 32,
  },
  {
    slug: "woodfiller-quick",
    title: "Woodfiller Quick",
    blurb: "Mix it with sanding dust from the actual piece so the filler takes the oil roughly the way the wood around it does.",
    category: "prep",
    usHandle: "woodfiller-quick",
    euHandle: "woodfiller-quick",
    sortOrder: 34,
  },

  // -------------------------------------------------------------------- care
  {
    slug: "universal-maintenance-oil",
    title: "Universal Maintenance Oil",
    blurb: "Refreshes an existing Oil Plus 2C finish without redoing it. This is what keeps a floor going for years.",
    category: "care",
    usHandle: "universal-maintenance-oil",
    euHandle: "universal-maintenance-oil",
    sortOrder: 40,
  },
  {
    slug: "soap",
    title: "Universal Soap",
    blurb: "The everyday cleaner for oiled surfaces. Ordinary household cleaner strips the oil, this does not.",
    category: "care",
    usHandle: "soap",
    euHandle: "universal-soap",
    sortOrder: 42,
  },
  {
    slug: "surface-care",
    title: "Surface Care",
    blurb: "Spray-on care for tables and counters that see daily use. Quick job, and it puts a little oil back each time.",
    category: "care",
    usHandle: "surface-care-spray",
    euHandle: "surface-care",
    sortOrder: 44,
  },
  {
    slug: "deep-cleaner",
    title: "Deep Cleaner",
    blurb: "For when a surface has gone past what soap will fix, but you do not want to sand it back and start again.",
    category: "care",
    usHandle: "deep-cleaner",
    euHandle: "deep-cleaner",
    sortOrder: 46,
  },
  {
    slug: "exterior-wood-cleaner",
    title: "Exterior Wood Cleaner",
    blurb: "Strips grey, algae and general weathering off exterior wood so a new finish has clean fibre to bond to.",
    category: "care",
    usHandle: "exterior-wood-cleaner",
    euHandle: "exterior-wood-cleaner-efficient-cleaning-of-exterior-wood",
    sortOrder: 48,
  },
  {
    slug: "exterior-soap-ecospray",
    title: "Exterior Soap Ecospray",
    blurb: "Routine cleaning for a finished deck or cladding. Use it and you put off the big restoration job.",
    category: "care",
    usHandle: "exterior-soap-ecospray",
    euHandle: "exterior-soap-ecospray",
    sortOrder: 50,
  },

  // ------------------------------------------------------------------ colour
  {
    slug: "oil-plus-2c-colour-fan",
    title: "Oil Plus 2C Colour Fan",
    blurb:
      "Real oiled samples on real wood. Colour on a screen is a guess, and this is the single cheapest way to stop guessing.",
    category: "colour",
    usHandle: "oil-plus-2c-paper-fan-deck",
    euHandle: "colour-fan",
    sortOrder: 60,
  },

  // ------------------------------------------------------------------- tools
  {
    slug: "application-pads",
    title: "Application Pads",
    blurb: "The red pads for spreading Oil Plus 2C. Cheap, and they matter more than people expect.",
    category: "tools",
    usHandle: "red-applicator-pad",
    euHandle: "application-pads-red",
    sortOrder: 70,
  },
  {
    slug: "applicator-holder",
    title: "Applicator Holder",
    blurb: "Holds the pad so you are not pressing oil into your palm for an hour.",
    category: "tools",
    usHandle: "applicator-handle",
    euHandle: "scrubby-holder",
    sortOrder: 72,
  },
  {
    slug: "microfiber-pad-set",
    title: "Microfiber Pad Set",
    blurb: "For working oil into larger surfaces evenly, and for buffing off the excess before it sets.",
    category: "tools",
    usHandle: "microfiber-bristle-pad-set",
    euHandle: "microfiber-pad-set",
    sortOrder: 74,
  },
  {
    slug: "can-opener",
    title: "Can Opener",
    blurb: "Opens a Rubio tin without wrecking the lid, so the tin actually reseals and the oil keeps.",
    category: "tools",
    usHandle: "wide-lip-can-opener",
    euHandle: "can-opener",
    sortOrder: 76,
  },
];

/** Guide product key -> shop slug, so the guide can end on a real buy button. */
export const GUIDE_PRODUCT_TO_SLUG: Record<string, string> = {
  oil2c: "oil-plus-2c",
  durogrit: "durogrit",
  woodcream: "woodcream",
};
