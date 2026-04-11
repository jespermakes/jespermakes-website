# PRD: Homepage Redesign — jespermakes.com

## Goal
Convert YouTube viewers into shop customers and newsletter subscribers. Make the page feel like a workshop, not a storefront.

## Branch
Work on branch `floki/homepage-redesign` (already exists, reset to main first with `git checkout floki/homepage-redesign && git reset --hard main`).

## Architecture
All sections should be individual React components in `src/components/home/` (Hero.tsx, LatestVideos.tsx, ShopGrid.tsx, AboutStrip.tsx). The Newsletter component already exists at `src/app/newsletter-form.tsx` — reuse it, don't recreate.

The main `src/app/page.tsx` should import and compose these components. Keep it clean.

## Section Order (top to bottom)

### 1. Hero — keep, minor tweak
- Headline: `Build something real.`
- Subhead: `I'm Jesper — a Danish woodworker building real furniture from real wood. 351K people on YouTube watch every step.`
- Primary CTA: `Browse the Shop` → /shop
- Secondary CTA: `Watch on YouTube` → https://youtube.com/@jespermakes
- Background image: keep the current YouTube thumbnail (`https://i.ytimg.com/vi/McK0kbPZNoU/maxresdefault.jpg`)
- Keep the existing 2-column grid layout (text left, image right)
- **Remove** any Blog or Tools CTAs that were added in the previous attempt

### 2. Latest from YouTube — NEW section
- Section title: `Latest builds`
- Fetch 3 most recent videos from the @jespermakes YouTube channel
- Use YouTube RSS feed: `https://www.youtube.com/feeds/videos.xml?channel_id=UCfWG0EmAsK_kI6GJohKDHVg` (keyless, no API key needed)
- Parse the XML feed server-side in a utility function in `src/lib/youtube.ts`
- Cache with Next.js `revalidate: 21600` (6 hours) — use `fetch` with `next: { revalidate: 21600 }` or use `unstable_cache` from next/cache
- Each card shows: video thumbnail (use `https://i.ytimg.com/vi/{VIDEO_ID}/maxresdefault.jpg`), title, publish date, click-through opens YouTube
- Extract video ID from the feed's `<yt:videoId>` tag
- **Fallback**: if fetch fails or returns empty, hide the entire section (don't render broken cards)
- Date format: `formatDate()` same style as blog (en-GB, day month year)
- No new npm dependencies — use built-in `fetch` + basic XML string parsing (regex or DOMParser is fine, or a simple parser that extracts title/id/date from the Atom feed entries)

### 3. Shop the plans & files — replaces current Featured + All Products
- Section title: `Plans, files & gear`
- **Remove the separate "Featured" cone lamp section entirely** — it's redundant
- Single grid showing all products once:
  - Cone Lamp Laser File — €5 → /shop/cone-lamp-laser
  - Cone Lamp 3D Print Files — €5 → /shop/cone-lamp-3dprint
  - Workshop Tee — €35 → /shop/workshop-tee
  - Workshop Wall Charts — €15 → /shop/workshop-wall-charts
  - Pallet Builder's Starter Kit — "Coming Soon" badge, no price, no link (just a div, not a Link)
- CTA below grid: `See everything in the shop →` → /shop
- Keep existing card styling (image, title, subtitle, price)

### 4. About strip — keep, rework to 2-column
- Keep the current copy: "Started with pallet wood. Still building." + the paragraph below
- Desktop: 2-column layout — portrait image left (`/images/jesper-workshop-tools.jpg` already exists in public), text right
- Mobile: stacked (image on top, text below)
- Keep the `Read more about Jesper →` link to /about

### 5. Newsletter — keep, strengthen
- Headline: `Join 3,000+ makers`
- Keep the existing `<NewsletterForm />` component
- Keep existing copy style
- **Do not** add "Trusted by makers in 40+ countries" unless we can verify it

## What to Remove
- The separate "Featured" cone lamp section (Section in current page with dark bg `bg-wood text-cream`)
- The current "All Products" section (replaced by unified ShopGrid)
- Any tool categories or blog sections from the previous redesign attempt on this branch
- Do NOT remove or modify any files under `src/data/` (blog-posts.ts, tools.ts are fine as-is)

## Technical Notes
- No new npm dependencies
- Keep the existing Tailwind color/type system (wood, amber, cream, etc.)
- Keep the font-serif for headings pattern
- Keep using next/image `<Image>` for optimized images
- YouTube fetch: since this is a server component page, the fetch can happen directly in the page or in a server component. Use a simple async function.
- Page should work with JS disabled for everything except the newsletter form

## Files to Create/Modify
- CREATE: `src/components/home/Hero.tsx`
- CREATE: `src/components/home/LatestVideos.tsx`
- CREATE: `src/components/home/ShopGrid.tsx`
- CREATE: `src/components/home/AboutStrip.tsx`
- CREATE: `src/lib/youtube.ts`
- MODIFY: `src/app/page.tsx` (rewrite to compose the new components)

## Acceptance Criteria
- [ ] No product appears twice on the page
- [ ] YouTube section shows 3 real recent videos or is hidden entirely on failure
- [ ] All sections render correctly on mobile and desktop
- [ ] Page builds without TypeScript errors
- [ ] Existing color/type system preserved
- [ ] Newsletter form works as before
