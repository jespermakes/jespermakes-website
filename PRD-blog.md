# PRD: Blog Infrastructure for jespermakes.com

## Goal
Add a markdown-based blog to jespermakes.com that drives organic search traffic and funnels readers to the shop. This is the single biggest gap in the site's revenue engine.

## Tech Stack
- Next.js 14.2.35 (App Router) with React 18
- Already has: `react-markdown` in dependencies
- Tailwind CSS with custom colors: cream (#FAF7F2), wood (#2C1810), wood-light (#4A3228), amber (#C17F3C)
- Fonts: Playfair Display (serif headings), Inter (sans body)
- Existing patterns: see `src/app/page.tsx`, `src/app/tools/[slug]/page.tsx` for layout patterns

## Requirements

### 1. Blog Data Structure
Create `src/data/blog-posts.ts` with an array of blog post objects:
```ts
interface BlogPost {
  slug: string;
  title: string;
  description: string; // SEO meta description
  content: string; // Markdown content
  publishedAt: string; // ISO date
  updatedAt?: string;
  author: string;
  tags: string[];
  heroImage?: string; // URL
  heroImageAlt?: string;
}
```

### 2. Blog Listing Page (`/blog`)
- Route: `src/app/blog/page.tsx`
- Grid of blog post cards (similar to shop grid)
- Each card: hero image, title, description snippet, date, tags
- Sorted newest first
- SEO metadata: title "Blog — Jesper Makes", description about woodworking tips

### 3. Blog Post Page (`/blog/[slug]`)
- Route: `src/app/blog/[slug]/page.tsx`
- Use `react-markdown` to render content
- Style markdown with Tailwind prose-like styles (DON'T add @tailwindcss/typography plugin, just write the CSS classes manually in a wrapper div)
- Hero image at top
- Title, date, author, tags
- "Back to blog" link
- CTA box at bottom linking to shop ("Browse our woodworking plans and files →")
- JSON-LD Article structured data
- OpenGraph metadata with hero image
- generateStaticParams for all slugs
- generateMetadata for dynamic SEO

### 4. Sitemap Integration
Update `src/app/sitemap.ts` to include:
- `/blog` page (priority 0.8)
- All individual blog posts (priority 0.7)

### 5. Navigation
Add "Blog" link to the header nav in `src/app/layout.tsx`, between "Tools" and the account links.

### 6. First Blog Post
Write ONE excellent SEO blog post targeting: **"how to build with pallet wood"**

This is a high-volume keyword that directly connects to our Pallet Starter Kit product.

The post should:
- Be 1200-1500 words
- Title: "How to Build with Pallet Wood: A Complete Beginner's Guide"
- Cover: finding pallets, what to look for, tools needed, safety, basic project ideas
- Naturally mention Jesper's experience (started with pallet wood in 2020)
- Include internal link to `/shop/pallet-starter-kit` (mention "The Pallet Builder's Starter Kit")
- Include internal link to `/tools` (mention the tools hub)
- Include a mention of the YouTube channel for video guides
- Tone: practical, honest, no fluff. Like Jesper talking to you in the workshop
- Use short paragraphs, headers for scannability
- Tags: ["pallet wood", "beginner", "woodworking", "guide"]

### 7. Second Blog Post
Write another post targeting: **"best wood for beginners"**

- 1000-1200 words
- Title: "Best Wood for Beginners: What to Buy (and What to Avoid)"
- Cover common species, where to buy, what to avoid, cost considerations
- Link to `/tools` for tool recommendations
- Link to `/shop/workshop-wall-charts` for the cheat sheets
- Tone: same as above
- Tags: ["wood", "beginner", "woodworking", "guide"]

## Styling Guidelines
- Match existing site aesthetic exactly
- Use `font-serif` (Playfair Display) for headings
- Use `font-sans` (Inter) for body text
- Colors: wood for text, amber for accents/links, cream for backgrounds
- Blog content wrapper: max-w-3xl, good line height, proper heading sizes
- Responsive: looks good on mobile

## What NOT to do
- Don't install any new npm packages
- Don't modify the Tailwind config
- Don't use MDX or any file-based blog system — keep it simple with data in .ts files
- Don't add a CMS
- Don't touch any existing pages except sitemap.ts and layout.tsx (nav link)
