# PRD: Rubio Guide at /rubio

Build an interactive Rubio Monocoat product recommender at `/rubio` on jespermakes.com.

## Important: Match Existing Codebase Conventions

Before writing any code, check how the existing codebase does things:
- Schema timestamps use `{ mode: "date" }` — e.g. `timestamp("created_at", { mode: "date" }).defaultNow().notNull()`
- Schema primary keys use `.defaultRandom().primaryKey()` order (not `.primaryKey().defaultRandom()`)
- Check `src/lib/db/schema.ts` for exact patterns
- Check existing API routes (e.g. `src/app/api/box-joint-jig/`) for patterns
- Check existing data files (e.g. `src/data/storyteller-data.ts`) for patterns

## Files to create/modify (in order)

### 1. Append to `src/lib/db/schema.ts`

Add this table at the end of the file. Match the exact timestamp/uuid conventions used by `boxJointJigEvents` and `coneLampEvents` in the same file:

```typescript
export const rubioGuideEvents = pgTable("rubio_guide_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  product: text("product"),
  species: text("species"),
  colorId: text("color_id"),
  colorLabel: text("color_label"),
  surfaceArea: real("surface_area"),
  unit: text("unit"),
  country: text("country"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
```

After adding, run:
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

The POSTGRES_URL env var should already be in `.env.local`. If drizzle-kit needs it, export it:
```bash
export POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
```

### 2. Create `src/data/rubio-guide-data.ts`

Complete data file with all product, species, colour, filter, and application guide content. Copy the FULL content below exactly. This is ~500 lines. Do NOT truncate or summarize.

```typescript
// ============================================================================
// Rubio Guide data — all product, species, colour, filter, and guide content
// Jesper edits this file to update picks, voice, and categorisation.
// ============================================================================

export type ProductKey = "oil2c" | "durogrit" | "woodcream";

export type ColorCategory =
  | "light"
  | "warm"
  | "dark"
  | "grey"
  | "great-plains"
  | "salt-lakes"
  | "scandinavian"
  | "traditional";

export interface Product {
  name: string;
  icon: string;
  line: string;
  desc: string;
  coverage: number;
  containers: Array<{ mL: number }>;
}

export interface Species {
  id: string;
  label: string;
}

export interface CalcSpecies {
  id: string;
  label: string;
  mult: number;
}

export interface Color {
  id: string;
  label: string;
  category: ColorCategory;
  jesper: boolean;
  approx: string;
}

export interface Filter {
  id: string;
  label: string;
}

export interface GuideStep {
  title: string;
  body: string;
}

// ============================================================================
// PRODUCTS
// ============================================================================

export const PRODUCTS: Record<ProductKey, Product> = {
  oil2c: {
    name: "Oil Plus 2C",
    icon: "🛡️",
    line: "Interior protection",
    desc: "A hardwax oil that colours and protects raw interior wood in one layer. Food-safe, durable, and forgiving. The right default for almost any indoor wood project.",
    coverage: 30,
    containers: [
      { mL: 100 },
      { mL: 130 },
      { mL: 350 },
      { mL: 1300 },
      { mL: 3500 },
    ],
  },
  durogrit: {
    name: "DuroGrit",
    icon: "🌳",
    line: "Exterior protection",
    desc: "A water-soluble oil with wood-fibre technology. Built for raw exterior wood: decks, siding, fences, garden furniture. No wipe-off, no lap marks, strong UV protection.",
    coverage: 10,
    containers: [{ mL: 1000 }, { mL: 2500 }],
  },
  woodcream: {
    name: "WoodCream",
    icon: "🏡",
    line: "Exterior renovation",
    desc: "A water-repellent wax cream for exterior vertical wood. The only Rubio product that works over previously-painted surfaces. Perfect for renovating old cladding, fences, and shed walls without sanding back to bare wood.",
    coverage: 15,
    containers: [{ mL: 1000 }, { mL: 2500 }],
  },
};

// ============================================================================
// SPECIES — for the colour browser
// ============================================================================

export const SPECIES_OIL2C: Species[] = [
  { id: "white-oak-solid", label: "White Oak" },
  { id: "red-oak", label: "Red Oak" },
  { id: "ash", label: "Ash" },
  { id: "beech", label: "Beech" },
  { id: "cedar", label: "Cedar" },
  { id: "hard-maple", label: "Hard Maple" },
  { id: "larch", label: "Larch" },
  { id: "merbau", label: "Merbau" },
  { id: "pine", label: "Pine" },
  { id: "teak", label: "Teak" },
  { id: "walnut", label: "Walnut" },
];

export const SPECIES_DUROGRIT: Species[] = [
  { id: "pine", label: "Pine" },
  { id: "douglas-fir", label: "Douglas Fir" },
  { id: "white-oak", label: "White Oak" },
  { id: "pressure-treated-pine", label: "Pressure Treated Pine" },
  { id: "cedar", label: "Cedar" },
  { id: "teak", label: "Teak" },
  { id: "thermo-treated-pine", label: "Thermo Treated Pine" },
  { id: "ipe", label: "Ipé" },
  { id: "cumaru", label: "Cumaru" },
];

// ============================================================================
// CALCULATOR SPECIES
// ============================================================================

export const CALC_SPECIES: Record<ProductKey, CalcSpecies[]> = {
  oil2c: [
    { id: "oak", label: "Oak (medium porosity)", mult: 1.0 },
    { id: "ash", label: "Ash (medium porosity)", mult: 0.95 },
    { id: "walnut", label: "Walnut (medium porosity)", mult: 1.0 },
    { id: "cherry", label: "Cherry (low porosity)", mult: 1.1 },
    { id: "maple", label: "Maple (low porosity)", mult: 1.2 },
    { id: "beech", label: "Beech (low porosity)", mult: 1.2 },
    { id: "birch", label: "Birch (low porosity)", mult: 1.1 },
    { id: "pine", label: "Pine (high porosity)", mult: 0.7 },
    { id: "larch", label: "Larch (high porosity)", mult: 0.75 },
    { id: "cedar", label: "Cedar (high porosity)", mult: 0.7 },
    { id: "spruce", label: "Spruce (high porosity)", mult: 0.7 },
    { id: "teak", label: "Teak (oily, use Pure or Natural)", mult: 1.0 },
  ],
  durogrit: [
    { id: "pine", label: "Pine", mult: 0.9 },
    { id: "douglas-fir", label: "Douglas Fir", mult: 0.9 },
    { id: "cedar", label: "Cedar", mult: 0.85 },
    { id: "white-oak", label: "White Oak", mult: 1.0 },
    { id: "teak", label: "Teak", mult: 1.1 },
    { id: "ipe", label: "Ipé", mult: 1.15 },
    { id: "cumaru", label: "Cumaru", mult: 1.1 },
    { id: "pressure-treated-pine", label: "Pressure Treated Pine", mult: 0.85 },
    { id: "thermo-treated-pine", label: "Thermo Treated Pine", mult: 1.0 },
  ],
  woodcream: [
    { id: "softwood", label: "Softwood (pine, spruce, cedar)", mult: 0.9 },
    { id: "hardwood", label: "Hardwood (oak, beech, etc)", mult: 1.0 },
    { id: "rough-sawn", label: "Rough-sawn wood (dilute with Softener)", mult: 0.7 },
  ],
};

// ============================================================================
// COLOURS
// ============================================================================

export const OIL2C_COLORS: Color[] = [
  { id: "pure", label: "Pure", category: "light", jesper: true, approx: "#E8D9BE" },
  { id: "natural", label: "Natural", category: "light", jesper: true, approx: "#DDC9A8" },
  { id: "cotton-white", label: "Cotton White", category: "light", jesper: false, approx: "#EADDC6" },
  { id: "super-white", label: "Super White", category: "light", jesper: false, approx: "#EFE6D5" },
  { id: "white", label: "White", category: "light", jesper: false, approx: "#E5D9C1" },
  { id: "white-5-percent", label: "White 5%", category: "light", jesper: false, approx: "#E1D1B4" },
  { id: "oyster", label: "Oyster", category: "light", jesper: false, approx: "#DCCDB3" },
  { id: "linen", label: "Linen", category: "light", jesper: false, approx: "#DFCEB2" },
  { id: "mist", label: "Mist", category: "grey", jesper: false, approx: "#C9BFB0" },
  { id: "mist-5-percent", label: "Mist 5%", category: "grey", jesper: false, approx: "#D3C9B6" },
  { id: "shell-grey", label: "Shell Grey", category: "grey", jesper: false, approx: "#BFB6A7" },
  { id: "ash-grey", label: "Ash Grey", category: "grey", jesper: true, approx: "#ACA699" },
  { id: "smoke", label: "Smoke", category: "grey", jesper: false, approx: "#8F867A" },
  { id: "smoke-5-percent", label: "Smoke 5%", category: "grey", jesper: false, approx: "#AFA796" },
  { id: "charcoal", label: "Charcoal", category: "dark", jesper: false, approx: "#554E44" },
  { id: "midnight-sky", label: "Midnight Sky", category: "dark", jesper: false, approx: "#3F3A34" },
  { id: "black", label: "Black", category: "dark", jesper: false, approx: "#2E2823" },
  { id: "dark-roast", label: "Dark Roast", category: "dark", jesper: false, approx: "#3E2D1F" },
  { id: "chocolate", label: "Chocolate", category: "dark", jesper: false, approx: "#4A3323" },
  { id: "cocoa", label: "Cocoa", category: "dark", jesper: false, approx: "#5C4229" },
  { id: "castle-brown", label: "Castle Brown", category: "dark", jesper: true, approx: "#5A3D2A" },
  { id: "walnut", label: "Walnut", category: "dark", jesper: true, approx: "#604530" },
  { id: "dark-oak", label: "Dark Oak", category: "dark", jesper: false, approx: "#6B4E33" },
  { id: "vienna", label: "Vienna", category: "warm", jesper: false, approx: "#7A5736" },
  { id: "bourbon", label: "Bourbon", category: "warm", jesper: false, approx: "#86623E" },
  { id: "arabica", label: "Arabica", category: "warm", jesper: false, approx: "#7D5B3C" },
  { id: "affogato", label: "Affogato", category: "warm", jesper: false, approx: "#8E6B48" },
  { id: "cortado", label: "Cortado", category: "warm", jesper: false, approx: "#9B7A54" },
  { id: "macchiato", label: "Macchiato", category: "warm", jesper: false, approx: "#A88D68" },
  { id: "mocha", label: "Mocha", category: "warm", jesper: false, approx: "#755640" },
  { id: "light-roast", label: "Light Roast", category: "warm", jesper: false, approx: "#AF916D" },
  { id: "hazelnut", label: "Hazelnut", category: "warm", jesper: true, approx: "#B59873" },
  { id: "almond", label: "Almond", category: "warm", jesper: false, approx: "#C6A983" },
  { id: "vanilla", label: "Vanilla", category: "warm", jesper: false, approx: "#D4B88D" },
  { id: "honey", label: "Honey", category: "warm", jesper: false, approx: "#C49A5E" },
  { id: "dulce", label: "Dulce", category: "warm", jesper: false, approx: "#BA8B58" },
  { id: "golden-hour", label: "Golden Hour", category: "warm", jesper: false, approx: "#C99A5C" },
  { id: "dunes", label: "Dunes", category: "warm", jesper: false, approx: "#C0A47A" },
  { id: "red-velvet", label: "Red Velvet", category: "warm", jesper: false, approx: "#7B3E2E" },
  { id: "fern", label: "Fern", category: "warm", jesper: false, approx: "#4F5A3C" },
];

export const DUROGRIT_COLORS: Color[] = [
  { id: "light-sand", label: "Light Sand", category: "great-plains", jesper: true, approx: "#D9C7A8" },
  { id: "prairie-dust", label: "Prairie Dust", category: "great-plains", jesper: false, approx: "#BFA581" },
  { id: "grassland-beige", label: "Grassland Beige", category: "great-plains", jesper: true, approx: "#A8906B" },
  { id: "foxy-brown", label: "Foxy Brown", category: "great-plains", jesper: false, approx: "#8F6B47" },
  { id: "rocky-umber", label: "Rocky Umber", category: "great-plains", jesper: false, approx: "#6D4E30" },
  { id: "steppe-look", label: "Steppe Look", category: "great-plains", jesper: false, approx: "#7A6551" },
  { id: "bison-brown", label: "Bison Brown", category: "great-plains", jesper: false, approx: "#5A3E28" },
  { id: "charred-black", label: "Charred Black", category: "great-plains", jesper: false, approx: "#2A2520" },
  { id: "saddle-black", label: "Saddle Black", category: "great-plains", jesper: false, approx: "#3A2E24" },
  { id: "sutton-grey", label: "Sutton Grey", category: "salt-lakes", jesper: true, approx: "#9A9289" },
  { id: "atacama-grey", label: "Atacama Grey", category: "salt-lakes", jesper: false, approx: "#787069" },
  { id: "tuz-white", label: "Tuz White", category: "salt-lakes", jesper: false, approx: "#D8CEBE" },
  { id: "utah-pink", label: "Utah Pink", category: "salt-lakes", jesper: false, approx: "#C4A595" },
  { id: "salinas-blue", label: "Salinas Blue", category: "salt-lakes", jesper: false, approx: "#7B8794" },
  { id: "salt-lake-green", label: "Salt Lake Green", category: "salt-lakes", jesper: false, approx: "#788876" },
  { id: "rubio-monocoat-green", label: "Rubio Monocoat Green", category: "salt-lakes", jesper: false, approx: "#4A5D42" },
];

export const WOODCREAM_COLORS: Color[] = [
  { id: "transparent-0", label: "Transparent #0", category: "grey", jesper: false, approx: "#DDCEAE" },
  { id: "misty-grey", label: "Misty Grey", category: "grey", jesper: false, approx: "#B8B5AC" },
  { id: "charming-grey", label: "Charming Grey", category: "grey", jesper: false, approx: "#A29E93" },
  { id: "dirty-grey", label: "Dirty Grey", category: "grey", jesper: false, approx: "#8A8377" },
  { id: "gravel-grey", label: "Gravel Grey", category: "grey", jesper: false, approx: "#6F6A62" },
  { id: "timeless-grey", label: "Timeless Grey", category: "grey", jesper: true, approx: "#5A564F" },
  { id: "green-grey", label: "Green Grey", category: "grey", jesper: false, approx: "#6E7366" },
  { id: "blue-grey", label: "Blue Grey", category: "grey", jesper: false, approx: "#6E7880" },
  { id: "bold-black", label: "Bold Black", category: "grey", jesper: false, approx: "#2E2C28" },
  { id: "snow-white", label: "Snow White", category: "scandinavian", jesper: false, approx: "#E8E1D3" },
  { id: "ice-blue", label: "Ice Blue", category: "scandinavian", jesper: false, approx: "#A8B5BC" },
  { id: "fjord-blue", label: "Fjord Blue", category: "scandinavian", jesper: false, approx: "#5A6B75" },
  { id: "aurora-blue", label: "Aurora Blue", category: "scandinavian", jesper: false, approx: "#3F5568" },
  { id: "navy-blue", label: "Navy Blue", category: "scandinavian", jesper: false, approx: "#2A3A4E" },
  { id: "quiet-green", label: "Quiet Green", category: "scandinavian", jesper: false, approx: "#7A8870" },
  { id: "country-green", label: "Country Green", category: "scandinavian", jesper: true, approx: "#5A6E52" },
  { id: "forest-green", label: "Forest Green", category: "scandinavian", jesper: false, approx: "#3E5240" },
  { id: "oslo-ochre", label: "Oslo Ochre", category: "scandinavian", jesper: false, approx: "#9E7E4A" },
  { id: "swedish-red", label: "Swedish Red", category: "scandinavian", jesper: true, approx: "#8E3A2E" },
  { id: "creamy-white", label: "Creamy White", category: "traditional", jesper: false, approx: "#E3D7BE" },
  { id: "soft-taupe", label: "Soft Taupe", category: "traditional", jesper: false, approx: "#B8A78E" },
  { id: "deep-taupe", label: "Deep Taupe", category: "traditional", jesper: false, approx: "#8A7962" },
  { id: "rich-almond", label: "Rich Almond", category: "traditional", jesper: false, approx: "#A88963" },
  { id: "salted-caramel", label: "Salted Caramel", category: "traditional", jesper: false, approx: "#9E6E43" },
  { id: "mocha-cream", label: "Mocha Cream", category: "traditional", jesper: false, approx: "#8B6A4F" },
  { id: "sweet-toffee", label: "Sweet Toffee", category: "traditional", jesper: false, approx: "#745539" },
  { id: "burned-chocolate", label: "Burned Chocolate", category: "traditional", jesper: false, approx: "#4A3728" },
];

// ============================================================================
// DUROGRIT RECOMMENDATION MATRIX
// ============================================================================

export const DUROGRIT_RECOMMENDATIONS: Record<
  string,
  Record<string, "good" | "bad">
> = {
  pine: {
    "light-sand": "good",
  },
  "douglas-fir": {
    "light-sand": "good",
  },
  "white-oak": {
    "prairie-dust": "good",
    "light-sand": "bad",
    "sutton-grey": "bad",
    "atacama-grey": "bad",
    "tuz-white": "bad",
    "utah-pink": "bad",
    "salinas-blue": "bad",
    "salt-lake-green": "bad",
  },
  "pressure-treated-pine": {
    "light-sand": "good",
  },
  cedar: {
    "prairie-dust": "good",
    "light-sand": "bad",
    "sutton-grey": "bad",
    "atacama-grey": "bad",
    "tuz-white": "bad",
    "utah-pink": "bad",
    "salinas-blue": "bad",
    "salt-lake-green": "bad",
  },
  teak: {
    "grassland-beige": "good",
    "sutton-grey": "bad",
    "atacama-grey": "bad",
    "tuz-white": "bad",
    "utah-pink": "bad",
    "salinas-blue": "bad",
    "salt-lake-green": "bad",
  },
  "thermo-treated-pine": {
    "rocky-umber": "good",
    "light-sand": "bad",
    "prairie-dust": "bad",
    "grassland-beige": "bad",
    "foxy-brown": "bad",
    "sutton-grey": "bad",
    "atacama-grey": "bad",
    "tuz-white": "bad",
    "utah-pink": "bad",
    "salinas-blue": "bad",
    "salt-lake-green": "bad",
  },
  ipe: {
    "foxy-brown": "good",
    "light-sand": "bad",
    "prairie-dust": "bad",
    "grassland-beige": "bad",
    "sutton-grey": "bad",
    "atacama-grey": "bad",
    "tuz-white": "bad",
    "utah-pink": "bad",
    "salinas-blue": "bad",
    "salt-lake-green": "bad",
  },
  cumaru: {
    "rocky-umber": "good",
    "light-sand": "bad",
    "prairie-dust": "bad",
    "grassland-beige": "bad",
    "foxy-brown": "bad",
    "sutton-grey": "bad",
    "atacama-grey": "bad",
    "tuz-white": "bad",
    "utah-pink": "bad",
    "salinas-blue": "bad",
    "salt-lake-green": "bad",
  },
};

// ============================================================================
// FILTERS
// ============================================================================

export const FILTERS: Record<ProductKey, Filter[]> = {
  oil2c: [
    { id: "all", label: "All colours" },
    { id: "jesper", label: "Jesper's picks" },
    { id: "light", label: "Light" },
    { id: "warm", label: "Warm" },
    { id: "dark", label: "Dark" },
    { id: "grey", label: "Grey" },
  ],
  durogrit: [
    { id: "all", label: "All colours" },
    { id: "jesper", label: "Jesper's picks" },
    { id: "great-plains", label: "Great Plains" },
    { id: "salt-lakes", label: "Salt Lakes" },
  ],
  woodcream: [
    { id: "all", label: "All colours" },
    { id: "jesper", label: "Jesper's picks" },
    { id: "grey", label: "Grey collection" },
    { id: "scandinavian", label: "Scandinavian" },
    { id: "traditional", label: "Traditional" },
  ],
};

// ============================================================================
// CDN IMAGE URL HELPER
// ============================================================================

export function getColorImageUrl(
  product: ProductKey,
  species: string | null,
  colorId: string
): string {
  const base = "https://www.rubiomonocoatusa.com/cdn/shop/files";
  if (product === "oil2c") {
    return `${base}/oil-plus-2c_${species ?? "white-oak-solid"}_${colorId}.jpg`;
  }
  if (product === "durogrit") {
    return `${base}/durogrit_${species ?? "pine"}_${colorId}.jpg`;
  }
  return `${base}/woodcream_pine_${colorId}.jpg`;
}

// ============================================================================
// APPLICATION GUIDES
// ============================================================================

export const GUIDES: Record<ProductKey, GuideStep[]> = {
  oil2c: [
    {
      title: "Sand the surface",
      body: `Finish with 100&ndash;150 grit. Don&apos;t go finer. The wood needs open pores for the oil to bond. A polished surface will reject the oil and leave a streaky result.<div class="pitfall"><strong>Common mistake:</strong> Sanding to 220 or higher. Your table will look beautiful raw, then the oil won&apos;t soak in. Stop at 150.</div>`,
    },
    {
      title: "Clean the surface",
      body: `Vacuum thoroughly, then wipe with Rubio <strong>Raw Wood Cleaner</strong> to remove residual dust. Let it dry completely before moving on. Any dust left in the grain will ruin the finish.`,
    },
    {
      title: "Mix Part A with Part B",
      body: `This is a two-component product. Mix at a <strong>3:1 ratio</strong> (three parts Oil, one part Accelerator) by volume. Stir well for 1&ndash;2 minutes. Once mixed, you have <strong>4&ndash;6 hours</strong> of working time.<div class="pitfall"><strong>Common mistake:</strong> Mixing too much. Work in batches sized for ~1 hour of application. Mixed oil that passes 6 hours will start curing in the container and go to waste.</div>`,
    },
    {
      title: "Apply the oil",
      body: `Work in zones of 5&ndash;10 m² (50&ndash;100 sq ft). Spread a small amount with the <strong>Rubio applicator pad</strong> or a plastic spreader. Work the oil into the wood surface, not just onto it. Let it react for at least 5 minutes while you periodically work it in with the pad.`,
    },
    {
      title: "Wipe off the excess",
      body: `Start wiping at <strong>15 minutes</strong>, finish within <strong>30 minutes</strong> maximum. Use clean terry cloths. The surface should feel completely dry to the touch when you&apos;re done. Not tacky, not oily.<div class="pitfall"><strong>Common mistake:</strong> Forgetting to wipe off. Any oil left on the surface after 30 minutes will never cure properly and leaves a sticky, shiny patch. Set a timer.</div>`,
    },
    {
      title: "Let it cure",
      body: `The surface feels dry in hours, but it&apos;s not fully cured. <strong>80% cured in 48 hours.</strong> <strong>Full cure in 5 days</strong> with Part B (21 days without). Don&apos;t put anything heavy on it, don&apos;t clean it with water, don&apos;t use the surface hard during that window. After 5 days, clean with water and Rubio Soap as needed.`,
    },
    {
      title: "Dispose of rags safely",
      body: `Oil-soaked cloths can <strong>spontaneously combust.</strong> Soak every used rag in water before disposal, or lay them flat outside to dry fully before binning them. Never ball up oily rags in a closed container. They can literally start a fire.`,
    },
  ],
  durogrit: [
    {
      title: "Prepare the wood",
      body: `New installed wood with natural extractives (oak, cedar, redwood) or hardwoods (ipé, teak) should weather <strong>4&ndash;6 weeks</strong> before applying. Pressure-treated wood needs <strong>6&ndash;12 months</strong> to dry out. Skipping this and the oil won&apos;t penetrate.<div class="pitfall"><strong>Common mistake:</strong> Applying on fresh treated wood. The water-repellent treatment blocks absorption. Wait, or the finish will fail in one season.</div>`,
    },
    {
      title: "Clean the surface",
      body: `Wet the wood with a fine mist of water. Scrub with <strong>Rubio Exterior Wood Cleaner</strong> and a stiff-bristle nylon brush. Rinse thoroughly with clean water until no foam remains. Let it dry completely.`,
    },
    {
      title: "Check the weather",
      body: `Apply only in <strong>frost-free, dry conditions</strong>. Don&apos;t apply if rain is expected within <strong>10 hours</strong>. Ideal temperature: 50&ndash;86°F (10&ndash;30°C). Hot sun slows working time. Apply in shade or dilute up to 20% with water.`,
    },
    {
      title: "Stir and apply",
      body: `Stir DuroGrit for a few minutes before use. Apply generously and evenly with a <strong>soft synthetic brush for waterborne products</strong>. Work in the direction of the boards. For horizontal deck boards: left to right. For vertical cladding: top to bottom.`,
    },
    {
      title: "Never stop mid-board",
      body: `Work in sections of 1&ndash;2 boards wide. Always finish a full board before stopping. Maintain a wet edge.<div class="pitfall"><strong>Common mistake:</strong> Stopping halfway across a board to take a break. The wet edge dries, and you&apos;ll see a visible lap line forever. Only stop at natural breaks: board ends, seams, stairs.</div>`,
    },
    {
      title: "Do not wipe off",
      body: `Unlike Oil Plus 2C, DuroGrit is NOT wiped off. Just apply evenly, then walk away and let it dry. Touch-up errors (brush marks, lap lines) on the wet surface within 15 minutes.`,
    },
    {
      title: "Let it dry and cure",
      body: `<strong>Dry in about 3 hours.</strong> Full cure in <strong>3 days</strong> at 20°C. Cool weather or high humidity slows this. Brushes clean with water. Check yearly after winter for dirt or green deposits. Low-pressure wash if needed.`,
    },
  ],
  woodcream: [
    {
      title: "Clean the surface",
      body: `For previously painted or stained wood, you do NOT need to sand back to bare wood. That&apos;s the whole point of WoodCream. But the existing surface must be <strong>clean, dry, and stable</strong>. Clean with <strong>Rubio Exterior Wood Cleaner</strong>, scrub, rinse with clean water, and let dry fully.`,
    },
    {
      title: "Remove anything flaking",
      body: `Scrape any actively flaking paint, then lightly sand those areas to a feathered edge. WoodCream adheres over stable painted surfaces, but it won&apos;t fix underlying failure. Whatever was lifting will keep lifting under the cream.<div class="pitfall"><strong>Common mistake:</strong> Painting WoodCream straight over peeling paint. You&apos;ll get a beautiful first summer, then a flaking mess the next.</div>`,
    },
    {
      title: "Stir well and consider dilution",
      body: `Stir WoodCream thoroughly. For rough-sawn wood or very dry surfaces (under 14% moisture), mix with <strong>WoodCream Softener</strong> for better application. Softener also slows drying in hot sun or gives a lighter, more transparent look.`,
    },
    {
      title: "Apply generously",
      body: `Use a soft synthetic brush. Apply evenly in the direction of the boards, working top to bottom for vertical boards. WoodCream is creamier than an oil. It stays where you put it, which is why it works on vertical surfaces without dripping.`,
    },
    {
      title: "One layer or two",
      body: `<strong>One layer</strong> gives a semi-transparent, slightly aged look. <strong>Two layers</strong> (with the second applied after the first dries) gives a more opaque, covering finish. Decide up front based on how much of the old surface you want to mask.`,
    },
    {
      title: "Let it cure",
      body: `Dries to touch in a few hours. Full protection kicks in over the following days. Protection lasts <strong>up to 10 years</strong> depending on exposure. Check yearly after winter. If the water-beading pearl effect has faded, clean with Exterior Wood Cleaner and reapply a dilute maintenance coat.`,
    },
  ],
};
```

### 3. Create `src/lib/rubio-guide-track.ts`

```typescript
export type RubioEventType =
  | "session_start"
  | "product_recommended"
  | "species_selected"
  | "color_selected"
  | "summary_viewed"
  | "guide_printed";

export interface RubioTrackData {
  eventType: RubioEventType;
  product?: string | null;
  species?: string | null;
  colorId?: string | null;
  colorLabel?: string | null;
  surfaceArea?: number | null;
  unit?: string | null;
}

export function trackRubioGuide(data: RubioTrackData): void {
  try {
    fetch("/api/rubio-guide/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  } catch {
    // Swallow any synchronous errors
  }
}
```

### 4. Create `src/app/api/rubio-guide/track/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rubioGuideEvents } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await auth();
    const country = request.headers.get("x-vercel-ip-country") || null;

    await db.insert(rubioGuideEvents).values({
      eventType: String(body.eventType || "unknown"),
      product: body.product ?? null,
      species: body.species ?? null,
      colorId: body.colorId ?? null,
      colorLabel: body.colorLabel ?? null,
      surfaceArea: typeof body.surfaceArea === "number" ? body.surfaceArea : null,
      unit: body.unit ?? null,
      country,
      userId: session?.user?.id ?? null,
    });
  } catch (err) {
    console.error("rubio-guide/track error:", err);
  }
  return NextResponse.json({ ok: true });
}
```

### 5. Create `src/app/rubio/page.tsx`

This is the big one (~1100 lines). It's a `"use client"` component. The COMPLETE code for this file is provided in the deployment brief file `FLOKI-RUBIO-GUIDE.md` under "File 5 of 5". Copy it exactly.

Key implementation notes:
- Use `"use client"` directive at the top
- Import from `@/data/rubio-guide-data` and `@/lib/rubio-guide-track`
- Use `next/link` for the Link component (NOT `next/navigation`)
- All state via `useState` hooks
- Use regular `<img>` tags for swatch images (NOT `next/image`) with an `{/* eslint-disable-next-line @next/next/no-img-element */}` comment
- Use `&apos;` for apostrophes in JSX text content, real `'` in JS strings
- The `SwatchImage` component handles CDN failures with a gradient fallback
- Tailwind classes use the project's custom tokens: `bg-cream`, `text-wood`, `text-wood-light`, `text-amber`, `text-amber-dark`, `bg-amber`, `bg-wood`, `font-serif`
- The `ApplicationGuide` component uses `dangerouslySetInnerHTML` for the guide step bodies (they contain HTML for pitfall callouts)
- The pitfall styling uses arbitrary Tailwind: `[&_.pitfall]:bg-[#E24B4A]/6` etc.

IMPORTANT: The page.tsx file is very long. Here is the COMPLETE source. Copy ALL of it:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PRODUCTS,
  SPECIES_OIL2C,
  SPECIES_DUROGRIT,
  CALC_SPECIES,
  OIL2C_COLORS,
  DUROGRIT_COLORS,
  WOODCREAM_COLORS,
  DUROGRIT_RECOMMENDATIONS,
  FILTERS,
  GUIDES,
  getColorImageUrl,
  type ProductKey,
  type Color,
  type Species,
} from "@/data/rubio-guide-data";
import { trackRubioGuide } from "@/lib/rubio-guide-track";

type StepId =
  | "intro"
  | "location"
  | "interior"
  | "exterior"
  | "exterior-orientation"
  | "product"
  | "color"
  | "summary";

// ============================================================================
// Helpers
// ============================================================================

function shadeColor(hex: string, pct: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + pct));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + pct));
  const b = Math.max(0, Math.min(255, (num & 0xff) + pct));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function SwatchImage({
  url,
  approx,
  label,
}: {
  url: string;
  approx: string;
  label: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        className="w-full aspect-square block"
        style={{
          background: `linear-gradient(135deg, ${approx}, ${shadeColor(approx, -10)})`,
        }}
        aria-label={label}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={label}
      loading="lazy"
      onError={() => setErrored(true)}
      className="w-full aspect-square object-cover block"
    />
  );
}

// ============================================================================
// Main component
// ============================================================================

export default function RubioGuidePage() {
  const [step, setStep] = useState<StepId>("intro");
  const [history, setHistory] = useState<StepId[]>(["intro"]);
  const [product, setProduct] = useState<ProductKey | null>(null);
  const [orientation, setOrientation] = useState<"horizontal" | "vertical" | null>(null);
  const [species, setSpecies] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [colorLabel, setColorLabel] = useState<string | null>(null);
  const [unit, setUnit] = useState<"m2" | "ft2">("m2");
  const [area, setArea] = useState<number>(10);
  const [calcSpecies, setCalcSpecies] = useState<string>("");
  const [colorFilter, setColorFilter] = useState<string>("all");

  useEffect(() => {
    trackRubioGuide({ eventType: "session_start" });
  }, []);

  useEffect(() => {
    if (product) {
      setCalcSpecies(CALC_SPECIES[product][0].id);
    }
  }, [product]);

  useEffect(() => {
    setColorFilter("all");
  }, [product]);

  // --------------------------------------------------------------------------
  // Navigation
  // --------------------------------------------------------------------------

  function goTo(next: StepId) {
    setHistory((h) => [...h, next]);
    setStep(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    setHistory((h) => {
      const newHistory = h.slice(0, -1);
      const prev = newHistory[newHistory.length - 1] || "intro";
      setStep(prev);
      return newHistory;
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function resetAll() {
    setStep("intro");
    setHistory(["intro"]);
    setProduct(null);
    setOrientation(null);
    setSpecies(null);
    setColor(null);
    setColorLabel(null);
    setUnit("m2");
    setArea(10);
    setCalcSpecies("");
    setColorFilter("all");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // --------------------------------------------------------------------------
  // Step choice handlers
  // --------------------------------------------------------------------------

  function chooseLocation(loc: "interior" | "exterior") {
    goTo(loc === "interior" ? "interior" : "exterior");
  }

  function chooseInteriorSurface(_s: string) {
    setProduct("oil2c");
    trackRubioGuide({ eventType: "product_recommended", product: "oil2c" });
    goTo("product");
  }

  function chooseExteriorCondition(c: "raw" | "painted") {
    if (c === "raw") {
      goTo("exterior-orientation");
    } else {
      setProduct("woodcream");
      trackRubioGuide({ eventType: "product_recommended", product: "woodcream" });
      goTo("product");
    }
  }

  function chooseOrientation(o: "horizontal" | "vertical") {
    setOrientation(o);
    setProduct("durogrit");
    trackRubioGuide({ eventType: "product_recommended", product: "durogrit" });
    goTo("product");
  }

  function pickSpecies(sp: string) {
    setSpecies(sp);
    trackRubioGuide({
      eventType: "species_selected",
      product,
      species: sp,
    });
  }

  function pickColor(c: Color) {
    setColor(c.id);
    setColorLabel(c.label);
    trackRubioGuide({
      eventType: "color_selected",
      product,
      species,
      colorId: c.id,
      colorLabel: c.label,
    });
  }

  function viewSummary() {
    trackRubioGuide({
      eventType: "summary_viewed",
      product,
      species,
      colorId: color,
      colorLabel,
      surfaceArea: area,
      unit,
    });
    goTo("summary");
  }

  function onPrint() {
    trackRubioGuide({
      eventType: "guide_printed",
      product,
      species,
      colorId: color,
      colorLabel,
    });
    if (typeof window !== "undefined") window.print();
  }

  // --------------------------------------------------------------------------
  // Calculator derived values
  // --------------------------------------------------------------------------

  const currentProduct = product ? PRODUCTS[product] : null;
  const area_m2 = unit === "m2" ? area : area / 10.764;
  const currentCalcSpecies =
    product && calcSpecies
      ? CALC_SPECIES[product].find((s) => s.id === calcSpecies) ?? null
      : null;
  const mult = currentCalcSpecies?.mult ?? 1.0;
  const adjustedCoverage = currentProduct ? currentProduct.coverage * mult : 0;
  const needed_mL =
    adjustedCoverage > 0 ? (area_m2 / adjustedCoverage) * 1000 * 1.1 : 0;
  const containerChoice = (() => {
    if (!currentProduct) return null;
    for (const c of currentProduct.containers) {
      if (c.mL >= needed_mL) return c;
    }
    return currentProduct.containers[currentProduct.containers.length - 1];
  })();
  const containerLabel = containerChoice
    ? containerChoice.mL >= 1000
      ? `${(containerChoice.mL / 1000).toFixed(1)} L`
      : `${containerChoice.mL} mL`
    : "—";
  const speciesLabelForCalcNote =
    currentCalcSpecies?.label.split(" (")[0].toLowerCase() ?? "wood";

  // --------------------------------------------------------------------------
  // Colour / species data for current product
  // --------------------------------------------------------------------------

  const colorSet: Color[] =
    product === "oil2c"
      ? OIL2C_COLORS
      : product === "durogrit"
        ? DUROGRIT_COLORS
        : product === "woodcream"
          ? WOODCREAM_COLORS
          : [];

  const filteredColors = colorSet.filter((c) => {
    if (colorFilter === "all") return true;
    if (colorFilter === "jesper") return c.jesper;
    return c.category === colorFilter;
  });

  const speciesListForPicker: Species[] =
    product === "oil2c"
      ? SPECIES_OIL2C
      : product === "durogrit"
        ? SPECIES_DUROGRIT
        : [];

  const recs =
    product === "durogrit" && species
      ? DUROGRIT_RECOMMENDATIONS[species] ?? {}
      : {};

  const showSpeciesPicker = product !== "woodcream";
  const colorPickerVisible = product === "woodcream" || species !== null;

  function whyExplanation(): string {
    if (product === "oil2c") {
      return "Because you're working indoors on raw wood. Oil Plus 2C is Rubio's flagship interior hardwax oil. One layer, colours and protects at the same time, food-safe when fully cured. DuroGrit and WoodCream are exterior products that won't work here (WoodCream is wax-based and only for vertical exterior, DuroGrit contains biocides you don't want inside).";
    }
    if (product === "durogrit") {
      const where =
        orientation === "horizontal"
          ? "horizontal surfaces like decking"
          : "vertical surfaces like cladding or fencing";
      return `Because you're on raw exterior wood, and DuroGrit is built exactly for this: ${where}. WoodCream is the alternative for exteriors, but it's specifically for renovating previously painted surfaces. Since your wood is raw, DuroGrit is the right call.`;
    }
    if (product === "woodcream") {
      return "Because you're working on previously painted wood outdoors. WoodCream is the only Rubio product that adheres to old paint without sanding back to bare wood. DuroGrit and Oil Plus 2C both need raw wood to bond, so they'd fail on your surface. WoodCream is built for renovation work.";
    }
    return "";
  }

  const speciesDisplayLabel = (() => {
    if (product === "oil2c")
      return SPECIES_OIL2C.find((s) => s.id === species)?.label ?? "—";
    if (product === "durogrit")
      return SPECIES_DUROGRIT.find((s) => s.id === species)?.label ?? "—";
    if (product === "woodcream") return "Any (applied over existing paint)";
    return "—";
  })();

  // --------------------------------------------------------------------------
  // Progress bar
  // --------------------------------------------------------------------------

  function ProgressBar({ current }: { current: 1 | 2 | 3 | 4 }) {
    return (
      <div className="flex gap-2 mb-10 max-w-md">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={
              "flex-1 h-[3px] rounded-full " +
              (n < current
                ? "bg-wood"
                : n === current
                  ? "bg-amber"
                  : "bg-wood/10")
            }
          />
        ))}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 pb-24">
        {step === "intro" && (
          <section>
            <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-6">
              The Rubio Guide
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-wood mb-4 font-medium">
              Find the right Rubio Monocoat for your project.
            </h1>
            <p className="text-lg text-wood-light/70 max-w-2xl leading-relaxed mb-8">
              Picking the right Rubio product shouldn&apos;t require reading three
              technical data sheets. Answer four questions, and I&apos;ll tell you
              which product to buy, how much you need, what colour works on
              your wood, and exactly how to apply it.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
              <FeatureRow num={1} title="Which product" body="Interior, exterior, new wood, painted wood. One right answer for your project." />
              <FeatureRow num={2} title="How much" body="Real coverage math adjusted for wood porosity, not a generic estimate." />
              <FeatureRow num={3} title="What colour" body="Browse real Rubio swatches on your actual wood species, not on generic oak." />
              <FeatureRow num={4} title="How to apply it" body="Step by step, with the mistakes beginners make flagged as pitfalls." />
            </div>

            <button
              className="inline-flex items-center gap-2 bg-wood text-cream rounded-xl px-5 py-3 text-sm font-semibold hover:bg-wood-light transition-colors"
              onClick={() => goTo("location")}
            >
              Start the guide →
            </button>
          </section>
        )}

        {step === "location" && (
          <section>
            <ProgressBar current={1} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-6">
              Step 1 of 4
            </p>
            <h2 className="font-serif text-3xl text-wood mb-3 font-medium leading-tight">
              Where is the project?
            </h2>
            <p className="text-wood-light/60 text-sm mb-8">
              The single most important question. Interior and exterior
              products are fundamentally different and can&apos;t be swapped.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <OptionButton
                icon="🏠"
                title="Interior"
                body="Indoors. Furniture, floors, cabinets, countertops, shelves. Protected from weather."
                onClick={() => chooseLocation("interior")}
              />
              <OptionButton
                icon="🌳"
                title="Exterior"
                body="Outdoors. Decking, siding, cladding, fences, garden furniture. Exposed to weather."
                onClick={() => chooseLocation("exterior")}
              />
            </div>
          </section>
        )}

        {step === "interior" && (
          <section>
            <ProgressBar current={2} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-6">
              Step 2 of 4
            </p>
            <h2 className="font-serif text-3xl text-wood mb-3 font-medium leading-tight">
              What are you finishing?
            </h2>
            <p className="text-wood-light/60 text-sm mb-8">
              This doesn&apos;t change the product. For indoor raw wood, Oil Plus
              2C is always the answer. But it helps me give you better colour
              and coverage advice.
            </p>
            <div className="grid grid-cols-1 gap-4 mb-8">
              <OptionButton icon="🪑" title="Furniture or cabinetry" body="Tables, chairs, cabinets, shelving, decorative pieces." onClick={() => chooseInteriorSurface("furniture")} />
              <OptionButton icon="⬜" title="Floor" body="Hardwood or solid-plank flooring." onClick={() => chooseInteriorSurface("floor")} />
              <OptionButton icon="🧺" title="Countertop or serving board" body="Kitchen counter, charcuterie board, serving surface." onClick={() => chooseInteriorSurface("countertop")} />
              <OptionButton icon="📐" title="Walls or ceiling" body="Wood-panelled walls, ceilings, interior cladding." onClick={() => chooseInteriorSurface("wall")} />
            </div>
            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button className="text-wood-light/60 hover:text-wood px-5 py-3 text-sm font-semibold" onClick={goBack}>
                ← Back
              </button>
            </div>
          </section>
        )}

        {step === "exterior" && (
          <section>
            <ProgressBar current={2} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-6">
              Step 2 of 4
            </p>
            <h2 className="font-serif text-3xl text-wood mb-3 font-medium leading-tight">
              Is the wood raw, or already painted?
            </h2>
            <p className="text-wood-light/60 text-sm mb-8">
              This is the question that splits DuroGrit from WoodCream. Get it
              right or the finish will fail.
            </p>
            <div className="grid grid-cols-1 gap-4 mb-8">
              <OptionButton icon="🪵" title="Raw or unfinished wood" body="New wood, or weathered wood sanded back to bare. Never been painted." onClick={() => chooseExteriorCondition("raw")} />
              <OptionButton icon="🎨" title="Previously painted or stained" body="Old paint or stain you can't sand back to bare wood. Renovation work." onClick={() => chooseExteriorCondition("painted")} />
            </div>
            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button className="text-wood-light/60 hover:text-wood px-5 py-3 text-sm font-semibold" onClick={goBack}>
                ← Back
              </button>
            </div>
          </section>
        )}

        {step === "exterior-orientation" && (
          <section>
            <ProgressBar current={2} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-6">
              Step 2 of 4
            </p>
            <h2 className="font-serif text-3xl text-wood mb-3 font-medium leading-tight">
              Vertical or horizontal surface?
            </h2>
            <p className="text-wood-light/60 text-sm mb-8">
              DuroGrit handles both, but this affects durability expectations
              and maintenance frequency.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <OptionButton icon="⬛" title="Horizontal" body="Decking, outdoor furniture tops, steps. Takes foot traffic and full sun." onClick={() => chooseOrientation("horizontal")} />
              <OptionButton icon="▮" title="Vertical" body="Siding, cladding, fencing, shed walls. Sheds water, less mechanical wear." onClick={() => chooseOrientation("vertical")} />
            </div>
            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button className="text-wood-light/60 hover:text-wood px-5 py-3 text-sm font-semibold" onClick={goBack}>
                ← Back
              </button>
            </div>
          </section>
        )}

        {step === "product" && currentProduct && (
          <section>
            <ProgressBar current={3} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-amber uppercase mb-6">
              Your product
            </p>

            <div className="bg-white border border-wood/8 rounded-[20px] p-8 mb-6">
              <div className="flex gap-6 items-start mb-6 pb-6 border-b border-wood/8">
                <div className="text-3xl w-16 h-16 bg-amber/12 rounded-2xl flex items-center justify-center text-amber flex-shrink-0">
                  {currentProduct.icon}
                </div>
                <div>
                  <div className="text-amber text-sm font-semibold tracking-wider uppercase mb-2">
                    {currentProduct.line}
                  </div>
                  <h2 className="font-serif text-2xl text-wood mb-1 font-medium">
                    {currentProduct.name}
                  </h2>
                  <p className="text-wood-light/75 leading-relaxed">
                    {currentProduct.desc}
                  </p>
                </div>
              </div>

              <div className="bg-amber/8 border border-amber/18 rounded-xl px-5 py-4 mb-6">
                <div className="text-[10px] font-bold tracking-[0.15em] text-amber mb-1.5 uppercase">
                  Why this one
                </div>
                <p className="text-wood-light text-sm leading-relaxed">
                  {whyExplanation()}
                </p>
              </div>

              <h3 className="font-serif text-xl text-wood font-medium mb-3">
                Let&apos;s estimate how much you need
              </h3>
              <div className="bg-white border border-wood/8 rounded-2xl p-6">
                <div className="flex gap-4 items-center mb-4 flex-wrap">
                  <label className="font-medium min-w-[180px] text-wood text-sm">
                    Surface area
                  </label>
                  <input
                    type="number"
                    value={area}
                    min="0.1"
                    step="0.1"
                    onChange={(e) =>
                      setArea(parseFloat(e.target.value) || 0)
                    }
                    className="flex-1 min-w-[140px] bg-white border border-wood/15 rounded-[10px] px-3.5 py-2.5 text-wood outline-none focus:border-amber"
                  />
                  <div className="inline-flex bg-wood/6 rounded-[10px] p-[3px]">
                    <button
                      className={
                        "px-3.5 py-1.5 text-[13px] font-semibold rounded-lg " +
                        (unit === "m2"
                          ? "bg-white text-wood shadow-sm"
                          : "text-wood-light")
                      }
                      onClick={() => setUnit("m2")}
                    >
                      m²
                    </button>
                    <button
                      className={
                        "px-3.5 py-1.5 text-[13px] font-semibold rounded-lg " +
                        (unit === "ft2"
                          ? "bg-white text-wood shadow-sm"
                          : "text-wood-light")
                      }
                      onClick={() => setUnit("ft2")}
                    >
                      ft²
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 items-center mb-4 flex-wrap">
                  <label className="font-medium min-w-[180px] text-wood text-sm">
                    Wood species
                  </label>
                  <select
                    value={calcSpecies}
                    onChange={(e) => setCalcSpecies(e.target.value)}
                    className="flex-1 min-w-[140px] bg-white border border-wood/15 rounded-[10px] px-3.5 py-2.5 text-wood outline-none focus:border-amber"
                  >
                    {product &&
                      CALC_SPECIES[product].map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="bg-amber/8 border border-amber/20 rounded-xl px-6 py-5 mt-4">
                  <div className="text-[10px] font-bold tracking-[0.15em] text-amber mb-2 uppercase">
                    You&apos;ll need
                  </div>
                  <div className="font-serif text-3xl text-wood font-medium leading-tight mb-1">
                    {containerLabel}
                  </div>
                  <div className="text-sm text-wood-light">
                    Needed: ~{Math.round(needed_mL)} mL. A {containerLabel} can
                    covers you with a buffer.
                  </div>
                  <div className="text-xs text-wood-light mt-3 leading-relaxed">
                    Based on ~{adjustedCoverage.toFixed(1)} m² per litre for{" "}
                    {speciesLabelForCalcNote}. Includes a 10% buffer for
                    real-world application.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button
                className="text-wood-light/60 hover:text-wood px-5 py-3 text-sm font-semibold"
                onClick={goBack}
              >
                ← Back
              </button>
              <button
                className="inline-flex items-center gap-2 bg-wood text-cream rounded-xl px-5 py-3 text-sm font-semibold hover:bg-wood-light"
                onClick={() => goTo("color")}
              >
                Pick a colour →
              </button>
            </div>
          </section>
        )}

        {step === "color" && product && (
          <section>
            <ProgressBar current={4} />
            <p className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-6">
              Step 4 of 4
            </p>
            <h2 className="font-serif text-3xl text-wood mb-3 font-medium leading-tight">
              Pick your colour.
            </h2>
            <p className="text-wood-light/60 text-sm mb-6">
              {product === "woodcream"
                ? "WoodCream is an opaque wax-based cream. Rubio shows all its colours on pine, because the wood underneath shows through much less than with penetrating oils, so species matters less."
                : "Colours look dramatically different on different woods. Tell me your species and I'll show real Rubio swatches on that species."}
            </p>

            {showSpeciesPicker && (
              <div>
                <h3 className="font-serif text-xl text-wood font-medium mb-2 mt-6">
                  Your wood
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                  {speciesListForPicker.map((sp) => (
                    <button
                      key={sp.id}
                      className={
                        "rounded-xl p-4 text-sm font-medium text-center transition-all " +
                        (species === sp.id
                          ? "border-2 border-wood bg-white shadow-[0_0_0_3px_rgba(44,24,16,0.08)]"
                          : "border border-wood/10 bg-white/60 hover:border-amber hover:bg-white")
                      }
                      onClick={() => pickSpecies(sp.id)}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colorPickerVisible && (
              <div>
                <div className="flex items-center justify-between mb-4 mt-8 flex-wrap gap-2">
                  <h3 className="font-serif text-xl text-wood font-medium">
                    {product === "woodcream"
                      ? "WoodCream colours"
                      : `Colours on ${speciesDisplayLabel}`}
                  </h3>
                </div>
                <div className="flex gap-2 mb-6 flex-wrap">
                  {FILTERS[product].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setColorFilter(f.id)}
                      className={
                        "px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all " +
                        (colorFilter === f.id
                          ? "bg-wood text-cream border border-wood"
                          : "border border-wood/15 bg-white text-wood-light hover:border-wood")
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {product === "durogrit" && species && (
                  <div className="flex gap-5 items-center text-xs text-wood-light/60 mb-6 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full inline-block bg-[#4A7C59]"></span>
                      Recommended for a natural look
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full inline-block bg-[#A32D2D]"></span>
                      Not recommended for this species
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-8">
                  {filteredColors.map((c) => {
                    const rec = recs[c.id] ?? null;
                    const isSelected = color === c.id;
                    const isBad = rec === "bad";
                    return (
                      <button
                        key={c.id}
                        onClick={() => pickColor(c)}
                        className={
                          "relative rounded-[10px] overflow-hidden bg-white/50 text-left transition-all " +
                          (isSelected
                            ? "border-2 border-wood shadow-[0_0_0_3px_rgba(44,24,16,0.15)]"
                            : "border-2 border-transparent hover:border-amber")
                        }
                      >
                        {c.jesper && (
                          <span className="absolute top-1.5 left-1.5 bg-wood/85 text-cream text-[9px] font-bold px-[7px] py-[3px] rounded-full tracking-wide z-[2]">
                            JESPER
                          </span>
                        )}
                        {rec === "good" && (
                          <span
                            className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white z-[2] bg-[#4A7C59]"
                            title="Recommended for a natural look"
                          >
                            ✓
                          </span>
                        )}
                        {rec === "bad" && (
                          <span
                            className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white z-[2] bg-[#A32D2D]"
                            title="Not recommended for this species"
                          >
                            !
                          </span>
                        )}
                        <div className={isBad ? "opacity-55" : ""}>
                          <SwatchImage
                            url={getColorImageUrl(product, species, c.id)}
                            approx={c.approx}
                            label={`Rubio ${currentProduct?.name} ${c.label}`}
                          />
                        </div>
                        <div className="px-2 pt-2 pb-2.5 text-xs text-center text-wood-light font-medium leading-tight">
                          {c.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button
                className="text-wood-light/60 hover:text-wood px-5 py-3 text-sm font-semibold"
                onClick={goBack}
              >
                ← Back
              </button>
              <button
                disabled={!color}
                onClick={viewSummary}
                className="inline-flex items-center gap-2 bg-wood text-cream rounded-xl px-5 py-3 text-sm font-semibold hover:bg-wood-light disabled:opacity-40 disabled:cursor-not-allowed"
              >
                See your full plan →
              </button>
            </div>
          </section>
        )}

        {step === "summary" && product && currentProduct && (
          <section>
            <p className="text-[10px] font-bold tracking-[0.15em] text-amber uppercase mb-6">
              Your plan
            </p>
            <h2 className="font-serif text-3xl text-wood mb-6 font-medium leading-tight">
              Everything you need to know.
            </h2>

            <div className="bg-white border border-wood/8 rounded-2xl p-6 mb-6">
              <SummaryRow k="Product" v={currentProduct.name} />
              <SummaryRow k="Colour" v={colorLabel ?? "—"} />
              <SummaryRow k="Species" v={speciesDisplayLabel} />
              <SummaryRow
                k="Area"
                v={`${area} ${unit === "m2" ? "m²" : "ft²"}`}
              />
              <SummaryRow k="You'll need" v={containerLabel} last />
            </div>

            <h3 className="font-serif text-xl text-wood font-medium mb-4 mt-8">
              How to apply it
            </h3>
            <ApplicationGuide product={product} />

            <div className="flex justify-between items-center mt-8 gap-4 flex-wrap">
              <button
                className="border border-wood/15 text-wood-light/60 hover:border-wood/30 px-5 py-3 rounded-xl text-sm font-semibold"
                onClick={resetAll}
              >
                Start over
              </button>
              <button
                className="inline-flex items-center gap-2 bg-wood text-cream rounded-xl px-5 py-3 text-sm font-semibold hover:bg-wood-light"
                onClick={onPrint}
              >
                Print or save as PDF
              </button>
            </div>

            <div className="mt-10 pt-6 border-t border-wood/8 text-sm text-wood-light/70 leading-relaxed">
              <p>
                A note from Jesper: I&apos;m a Rubio Monocoat ambassador, which
                means I work with them and use their finishes. But I only
                recommend what I actually use. If you buy through{" "}
                <Link
                  href="/tools"
                  className="text-amber hover:text-amber-dark underline"
                >
                  my tool recommendations
                </Link>
                , you support the channel at no cost to you.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Small presentational components
// ============================================================================

function FeatureRow({
  num,
  title,
  body,
}: {
  num: number;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="bg-wood/6 text-wood w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-[13px] flex-shrink-0 font-serif">
        {num}
      </div>
      <div>
        <h3 className="font-serif text-[17px] mb-1 text-wood font-medium">
          {title}
        </h3>
        <p className="text-sm text-wood-light/70 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function OptionButton({
  icon,
  title,
  body,
  onClick,
}: {
  icon: string;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white/60 border border-wood/10 rounded-2xl p-6 text-left cursor-pointer transition-all hover:border-amber hover:bg-white/90 flex gap-4 items-start"
    >
      <div className="text-2xl w-10 h-10 bg-amber/12 rounded-[10px] flex items-center justify-center text-amber flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-serif text-xl text-wood font-medium mb-1">
          {title}
        </h3>
        <p className="text-wood-light/65 text-sm leading-relaxed">{body}</p>
      </div>
    </button>
  );
}

function SummaryRow({
  k,
  v,
  last,
}: {
  k: string;
  v: string;
  last?: boolean;
}) {
  return (
    <div
      className={
        "flex justify-between items-start py-2.5 gap-4 " +
        (last ? "" : "border-b border-wood/6")
      }
    >
      <span className="text-[13px] text-wood-light/55 uppercase tracking-[0.1em] font-semibold min-w-[110px]">
        {k}
      </span>
      <span className="text-wood font-medium text-right flex-1">{v}</span>
    </div>
  );
}

function ApplicationGuide({ product }: { product: ProductKey }) {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const guide = GUIDES[product];
  return (
    <div>
      {guide.map((step, i) => {
        const open = openIndex === i;
        return (
          <div
            key={i}
            className="bg-white border border-wood/8 rounded-2xl mb-2.5 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(open ? -1 : i)}
              className="w-full py-4 px-5 bg-transparent text-base font-medium text-wood text-left flex justify-between items-center cursor-pointer gap-4 hover:bg-wood/[0.02]"
            >
              <span className="bg-amber/15 text-amber-dark w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 font-serif">{step.title}</span>
              <span
                className={
                  "text-wood-light/40 transition-transform " +
                  (open ? "rotate-180" : "")
                }
              >
                ▼
              </span>
            </button>
            <div
              className={
                "overflow-hidden transition-all " +
                (open ? "max-h-[1400px]" : "max-h-0")
              }
            >
              <div
                className="px-5 pb-5 pl-[3.75rem] text-[15px] text-wood-light/80 leading-relaxed [&_strong]:text-wood [&_.pitfall]:bg-[#E24B4A]/6 [&_.pitfall]:border-l-4 [&_.pitfall]:border-[#E24B4A]/50 [&_.pitfall]:px-4 [&_.pitfall]:py-3 [&_.pitfall]:rounded-r-lg [&_.pitfall]:mt-3 [&_.pitfall_strong]:text-[#A32D2D]"
                dangerouslySetInnerHTML={{ __html: step.body }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

## After all files are created

### Type check
```bash
npx tsc --noEmit
```
Must pass with zero errors. Fix any issues before proceeding.

### Commit and push
```bash
git add -A
git commit -m "Add Rubio Guide at /rubio"
git push origin floki/rubio-guide
```

Do NOT deploy to production. Do NOT run `vercel --prod`. Just commit and push to the branch.

## Checklist
- [ ] Schema table appended matching existing conventions
- [ ] drizzle-kit generate + push successful
- [ ] Data file created with all 83 colours, 3 products, species lists, guides
- [ ] Tracking helper created
- [ ] API route created
- [ ] Page component created (full ~1100 lines, not truncated)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Committed and pushed to `floki/rubio-guide` branch
