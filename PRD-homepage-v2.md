# Homepage Redesign v2

## Vision
The front page should feel **inviting and personal**, like walking into Jesper's workshop. NOT a storefront. NOT a product listing. The shop lives at /shop — the homepage is about the person, the craft, and the content.

## Branch
Work on branch `floki/homepage-redesign`. Reset it first: `git reset --hard main`

## Section Order (each section gets a distinct background color)

### 1. Hero (warm cream background — default bg)
- 2-column: text left, workshop photo right
- Headline: "Build something real."
- Subhead: "I'm Jesper — a Danish woodworker building real furniture from real wood. 351K people on YouTube watch every step."
- Two CTAs: "Watch on YouTube" (primary amber button) + "Browse the Shop" (outlined secondary)
- Image: `https://i.ytimg.com/vi/McK0kbPZNoU/maxresdefault.jpg`

### 2. About Me strip (dark wood background `bg-wood text-cream`)
- 2-column: portrait photo left, text right
- Use `/images/jesper-workshop-tools.jpg` for the portrait
- Text: "Started with pallet wood. Still building." + existing about paragraph
- Link: "Read more about Jesper →" → /about
- This should feel warm and personal

### 3. Latest from YouTube (light background, subtle contrast e.g. `bg-cream/50` with top/bottom border)
- Section title: "Latest builds"
- 3 most recent videos from YouTube RSS feed
- Each card: thumbnail, title, date, links to YouTube
- Use the YouTube RSS fetch from src/lib/youtube.ts (already created)
- If fetch fails, hide section entirely
- Cards in a 3-column grid on desktop, stacked on mobile

### 4. From the Blog (default background)
- Section title: "From the Workshop"
- Show 3 latest blog posts using `getAllBlogPosts()` from `@/data/blog-posts`
- Each card: hero image, title, description snippet, date
- Link: "Read all posts →" → /blog
- 3-column grid on desktop

### 5. Tools I Use (dark wood background `bg-wood text-cream`)
- Section title: "Tools I Actually Use"
- Short text: "Festool ambassador. Rubio Monocoat ambassador. Carhartt ambassador. Every tool on this list earned its place in my workshop."
- Show 4 tool category cards (Festool, Hand Tools, Finishing, Gardening & Outdoors) from `categories` in `@/data/tools`
- Each card: icon + title + description, link to `/tools/category/{slug}`
- Amber accent on hover
- Link: "See the full tool list →" → /tools

### 6. Newsletter (amber accent background `bg-amber/10` or similar warm tone)
- Headline: "Join 3,000+ makers"
- Reuse existing `<NewsletterForm />` from `src/app/newsletter-form.tsx`
- Make it feel like a standalone section, not an afterthought

## Architecture
- All sections as components in `src/components/home/`
- Main `page.tsx` composes them cleanly
- YouTube fetch in `src/lib/youtube.ts`
- NO shop products on the homepage. Zero. The shop has its own page.
- Keep existing Tailwind theme (wood, amber, cream, amber-dark, wood-light)

## Important
- The `products` array and "Featured" and "All Products" sections must be COMPLETELY REMOVED from page.tsx
- Do NOT show any products, prices, or "Coming Soon" badges on the homepage
- The page.tsx should import from @/data/blog-posts and @/data/tools for the blog and tools sections
- Keep font-serif for headings, font-sans for body
- Responsive: everything must work on mobile

## After coding
- Commit all changes
- Do NOT deploy (I will handle deployment)
