# PRD: Individual Tool Pages

## Goal
Convert the flat `/tools` page into a data-driven system where each tool has its own dedicated page at `/tools/[slug]`. The `/tools` index becomes a category-grouped grid linking to individual pages.

## Current State
- `src/app/tools/page.tsx` has a hardcoded `categories` array with all tools inline
- No individual tool pages exist
- No buy links on most tools
- Design system: Tailwind with custom colors (cream, wood, wood-light, amber), Playfair Display serif, Inter sans

## Architecture

### Data Layer: `src/data/tools.ts`
Export a typed array of tools and a helper to look up by slug.

```typescript
export type BuyLink = {
  label: string;        // e.g. "Amazon US", "Amazon EU", "Festool.com"
  url: string;
  region?: "us" | "eu" | "global";
  badge?: string;       // e.g. "Best Price"
};

export type Tool = {
  slug: string;              // URL slug: "festool-domino-df-500"
  name: string;              // Display name
  description: string;       // Short description (for the grid card)
  longDescription?: string;  // Extended description (for the individual page, optional for now)
  category: string;          // "Power Tools", "Finishing", etc.
  categoryIcon: string;      // emoji
  image?: string;            // Path to tool image in /public/images/tools/[slug].jpg (optional, added later by Jesper)
  badge?: "Ambassador";      // Ambassador badge
  buyLinks: BuyLink[];       // Multiple buy links (can be empty for now)
  youtubeVideos?: string[];  // YouTube video IDs where this tool appears (optional, added later)
};

export const tools: Tool[] = [
  // Migrate ALL existing tools from the current page.tsx categories array
  // Keep the exact same names, descriptions, and badge values
  // Add slug for each (kebab-case of the name)
  // buyLinks: [] for now (Jesper is gathering affiliate info)
];

export const categories = [
  { title: "Power Tools", icon: "⚡", description: "The tools I reach for every day in the shop." },
  { title: "Finishing", icon: "🎨", description: "What I use to protect and bring out the beauty of the wood." },
  { title: "3D Printing & Laser", icon: "🖨️", description: "My digital fabrication tools for the more creative builds." },
  { title: "Workshop Essentials", icon: "🔧", description: "The unglamorous stuff that makes everything else work." },
  { title: "Camera & Content", icon: "📷", description: "What I use to film the videos." },
];

export function getToolBySlug(slug: string): Tool | undefined { ... }
export function getToolsByCategory(category: string): Tool[] { ... }
```

### Index Page: `src/app/tools/page.tsx`
Rewrite to import from `src/data/tools.ts`. Display a category-grouped grid of tool cards. Each card links to `/tools/[slug]`.

Card design:
- Tool image placeholder (gray rounded rectangle with tool icon if no image yet)
- Tool name (serif heading)
- Ambassador badge if applicable
- Short description
- "View details →" link
- Keep the same warm cream/wood/amber aesthetic as the rest of the site

Keep the existing intro text and the "Missing something?" CTA section at the bottom.

### Individual Tool Page: `src/app/tools/[slug]/page.tsx`
Dynamic route using `generateStaticParams()` for static generation.

Layout:
- Breadcrumb: Tools → [Category] → [Tool Name]
- Hero section: Tool image (left) + details (right) on desktop, stacked on mobile
  - If no image yet, show a styled placeholder with the category icon
  - Tool name (large serif heading)
  - Ambassador badge if applicable
  - Category tag
  - Long description (falls back to short description if longDescription is not set)
- Buy Links section: Grid of buy link buttons styled as cards
  - Each shows: store label, region flag emoji (🇺🇸/🇪🇺/🌍), and links out with rel="noopener noreferrer"
  - If no buy links yet, show a subtle "Links coming soon" message (don't hide the section)
  - Affiliate disclosure line at bottom of this section
- Related Videos section (only if youtubeVideos is set, otherwise skip the section entirely)
- Back to all tools link at the bottom

### SEO
- `generateMetadata()` on each tool page:
  - title: `[Tool Name] — Tools — Jesper Makes`
  - description: the tool's short description
- Add canonical URLs
- The index page metadata stays as-is

## Design Guidelines
- Match existing site aesthetic exactly: cream backgrounds, wood text, amber accents
- Use the same rounded-xl cards, hover transitions, and spacing as the shop and current tools page
- Ambassador badge styling: keep the existing amber pill style
- Responsive: works on mobile and desktop
- No new dependencies needed — just Tailwind + Next.js

## What NOT to do
- Don't add any new npm packages
- Don't change the site layout, nav, footer, or any other pages
- Don't modify tailwind.config.ts
- Don't create API routes — this is all static/SSG
- Don't hardcode affiliate links — leave buyLinks arrays empty, Jesper will provide them
- Don't add placeholder images — just show a styled placeholder div when image is missing
- Don't touch the shop pages or any other section of the site
- Don't over-engineer: no CMS, no database, no admin panel. Just TypeScript data + Next.js pages.

## Files to Create/Modify
1. CREATE `src/data/tools.ts` — tool data + helpers
2. REWRITE `src/app/tools/page.tsx` — grid index using data from tools.ts  
3. CREATE `src/app/tools/[slug]/page.tsx` — individual tool page

## Validation
- `npm run build` must pass with zero errors
- All existing tools from the current page must appear on the new index
- Each tool's individual page must be accessible at `/tools/[slug]`
- The Ambassador badges must render correctly
- Mobile responsive (check with browser resize)
- No visual regressions on the tools index compared to current (same info, better layout)
