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
