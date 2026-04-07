# PRD: Rubio Monocoat Product Pages

## Goal
Replace the two existing generic Rubio Monocoat tool entries with 4 rich product pages featuring color grids, Jesper's personal descriptions, and buy links.

## Pages to Create

### 1. `/tools/rubio-monocoat-oil-plus-2c`
**Description (from Jesper):** "I use Oil Plus 2C because it's the best choice for indoor wood protection. Wood gets protected while it still feels like wood, it's food safe, it makes the wood look good, and you can color the wood in any color you like, darker or lighter. I simply love it."

**Badge:** Ambassador

**Color Grid — 40 colors on oak:**
Affogato, Almond, Arabica, Ash Grey, Black, Bourbon, Castle Brown, Charcoal, Chocolate, Cocoa, Cortado, Cotton White, Dark Oak, Dark Roast, Dulce, Dunes, Fern, Golden Hour, Hazelnut, Honey, Light Roast, Linen, Macchiato, Midnight Sky, Mist, Mist 5%, Mocha, Natural, Oyster, Pure, Red Velvet, Shell Grey, Smoke, Smoke 5%, Super White, Vanilla, Vienna, Walnut, White, White 5%

Color grid design: Small rounded squares in a grid (5-6 per row on desktop, 3-4 on mobile). Each square shows an approximate color swatch. Below each swatch, the color name in small text. Use CSS background colors that approximate each finish color (they don't need to be pixel-perfect, just representative).

**Buy Links:**
- EU: `https://www.rubiomonocoat.com/en-US/products/interior` (placeholder until affiliate is set up)
- US: `https://www.rubiomonocoatusa.com/collections/oil-plus-2c`

### 2. `/tools/rubio-monocoat-durogrit`
**Description (from Jesper):** "A fantastic product when you want to protect wood for the outdoors. It's for raw wood, because it binds with the wood fibers, it's not just a surface. You can have a very close to natural color, or you can go crazy and make it bison brown, black, blue or white."

**Badge:** Ambassador

**Color Grid — 16 colors (two collections):**

Great Plains collection: Light Sand, Prairie Dust, Grassland Beige, Foxy Brown, Rocky Umber, Steppe Look, Bison Brown, Charred Black, Saddle Black

Salt Lakes collection: Sutton Grey, Atacama Grey, Tuz White, Utah Pink, Salinas Blue, Salt Lake Green, Rubio Monocoat Green

Group by collection with a subtle label.

**Buy Links:**
- EU: `https://www.rubiomonocoat.com/en-US/products/exterior` (placeholder)
- US: `https://www.rubiomonocoatusa.com/products/durogrit`

### 3. `/tools/rubio-monocoat-woodcream`
**Description (from Jesper):** "WoodCream is for restoration work, if you paint windows that already have a layer of paint."

**Badge:** Ambassador

**Buy Links:**
- EU: `https://www.rubiomonocoat.com/en-US/products/exterior` (placeholder)
- US: `https://www.rubiomonocoatusa.com/collections/woodcream`

### 4. `/tools/rubio-monocoat-care-kit`
**Name:** "Rubio Monocoat Care & Maintenance"

**Description:** "Everything you need to keep your Rubio Monocoat finishes looking their best. Maintenance oil for refreshing, cleaner for daily care, and surface prep for new applications."

**Badge:** Ambassador

**Products listed on this page (as a simple list, not separate pages):**
- Universal Maintenance Oil
- Surface Care
- Raw Wood Cleaner
- Limespot Remover

**Buy Links:**
- US: `https://www.rubiomonocoatusa.com/collections/clean-care`

## Data Changes in `src/data/tools.ts`

Remove the two existing Rubio entries:
- `rubio-monocoat-oil-plus-2c` (old version without colors)
- `rubio-monocoat-universal-maintenance-oil`

Add 4 new entries with a new optional field `colorGrid` on the Tool type:

```typescript
export type ColorSwatch = {
  name: string;
  hex: string;  // approximate CSS color
  collection?: string;  // e.g. "Great Plains" for DuroGrit
};

// Add to Tool type:
colorGrid?: ColorSwatch[];
```

## Individual Tool Page Changes (`src/app/tools/[slug]/page.tsx`)

If `tool.colorGrid` exists, render a color grid section between the description and buy links:
- Section heading: "Color Range" (or "Available Colors")
- Grid of small color swatches (48px squares on desktop, 36px on mobile)
- Each swatch: rounded-lg, the hex color as background, color name below in text-xs
- If swatches have `collection` field, group them with a subtle collection label
- Responsive: 6 columns desktop, 4 tablet, 3 mobile

## Color Hex Approximations

Oil Plus 2C (approximate hex values for the swatches):
- Pure: #D4B896
- Natural: #C4A67D
- White: #E8DFD0
- White 5%: #DDD4C5
- Super White: #F0EAE0
- Cotton White: #E5D8C4
- Linen: #D5C6AD
- Vanilla: #DBCAA5
- Mist: #C5B8A0
- Mist 5%: #D0C4AC
- Oyster: #BFB199
- Shell Grey: #B0A590
- Ash Grey: #9E9585
- Smoke: #8A8070
- Smoke 5%: #A09680
- Dunes: #B8A07A
- Honey: #C09850
- Golden Hour: #B88A40
- Almond: #A08060
- Hazelnut: #8A6A48
- Affogato: #7A5A38
- Light Roast: #9A7A58
- Macchiato: #8A6A45
- Cortado: #7A5A35
- Dulce: #9A7550
- Arabica: #6A4A28
- Mocha: #5A3A20
- Cocoa: #4A2A15
- Vienna: #6A4020
- Bourbon: #704020
- Dark Oak: #5A3818
- Castle Brown: #4A2810
- Dark Roast: #3A2010
- Chocolate: #3A1A08
- Charcoal: #3A3530
- Black: #1A1510
- Midnight Sky: #2A2530
- Walnut: #5A3A20
- Red Velvet: #6A2020
- Fern: #4A5A30

DuroGrit Great Plains:
- Light Sand: #D4C4A0
- Prairie Dust: #BCA878
- Grassland Beige: #A89468
- Foxy Brown: #8A6A40
- Rocky Umber: #6A4A28
- Steppe Look: #5A3A18
- Bison Brown: #4A2A10
- Charred Black: #2A2018
- Saddle Black: #1A1510

DuroGrit Salt Lakes:
- Sutton Grey: #9A9488
- Atacama Grey: #7A7568
- Tuz White: #D4CCC0
- Utah Pink: #C4A098
- Salinas Blue: #6A7A88
- Salt Lake Green: #5A7A58
- Rubio Monocoat Green: #3A5A38

## Design Guidelines
- Same warm cream/wood/amber aesthetic as the rest of the site
- Color swatches should have a subtle border (border-wood/10) so light colors don't disappear
- Ambassador badge on all 4 pages
- Keep the existing page layout structure (breadcrumb, hero, description, buy links)
- Color grid goes between description and buy links
- On the Oil Plus 2C page, add a note below the grid: "Colors shown are approximate. Results vary by wood species and preparation. Always test on a sample first."

## What NOT to do
- Don't add npm packages
- Don't change tailwind config
- Don't modify any other pages
- Don't create 40 separate pages for each color
- Don't use images for the swatches (CSS background colors only, fast loading)

## Validation
- `npm run build` must pass
- All 4 new pages render at /tools/rubio-monocoat-*
- Color grids display correctly
- Ambassador badges show
- Mobile responsive
