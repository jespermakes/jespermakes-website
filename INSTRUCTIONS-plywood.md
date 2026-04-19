# WISA Plywood Build Instructions

Read PRD-plywood.md (main brief) and PRD-plywood-addendum.md (distributor directory) for all content.

## Existing Schema (MUST MATCH)

### Tool type in `src/data/tools.ts`:
```typescript
export type Tool = {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  categoryIcon: string;
  image?: string;
  badge?: "Ambassador";
  buyLinks: BuyLink[];
  youtubeVideos?: string[];
  colorGrid?: ColorSwatch[];
  productList?: string[];
  gallery?: string[];
};
```

### BlogPost type in `src/data/blog-posts.ts`:
```typescript
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  heroImage?: string;
  heroImageAlt?: string;
  featuredVideo?: string;
}
```

### Categories in `src/data/tools.ts`:
```typescript
export type Category = {
  title: string;
  slug: string;
  icon: string;
  description: string;
};
```

## What to build (in order):

### 1. Add "Plywood" category to `src/data/tools.ts`
Add to the `categories` array:
```typescript
{
  title: "Plywood",
  slug: "plywood",
  icon: "🪵",
  description: "The three WISA panels I use for every serious project. Finnish-made, ambassador-approved.",
},
```

### 2. Add three WISA tool entries to `src/data/tools.ts`
Map the brief's content to the EXISTING Tool type. Key mappings:
- `shortDescription` → `description`
- `heroImage` → `image`
- `ambassador: true` → `badge: "Ambassador"`
- `ambassadorBrand` → NOT a field, skip it
- `buyUrl/buyText` → `buyLinks: [{ label: "Find a WISA distributor", url: "https://www.wisaplywood.com/buy-and-contact/", region: "global" }]`
- `category` → `"Plywood"` (matches the category title)
- `categoryIcon` → `"🪵"`
- Keep `longDescription` from the brief (it IS rendered on the tool page)
- `useCases`, `specs`, `jesperNote`, `learnMoreUrl` → These fields don't exist on the Tool type. Add them as OPTIONAL fields to the Tool type, then render them on the tool detail page `src/app/tools/[slug]/page.tsx`.

### 3. Update Tool type to support new fields
Add these optional fields to the Tool type:
```typescript
useCases?: string[];
specs?: { label: string; value: string }[];
jesperNote?: string;
learnMoreUrl?: string;
```

### 4. Update tool detail page `src/app/tools/[slug]/page.tsx`
After the existing description/longDescription section, render:
- `useCases` as a bullet list if present
- `specs` as a definition list or table if present  
- `jesperNote` as a styled callout quote if present
- `learnMoreUrl` as a "Learn more" link if present
Use the site's existing Tailwind classes (bg-cream, text-wood, font-serif, etc.)

### 5. Create `/plywood` hub page at `src/app/plywood/page.tsx`
Use the code from PRD-plywood.md Section 2 BUT:
- Apply the distributor addendum from PRD-plywood-addendum.md:
  - Remove the "Where to buy WISA" subsection from the beginner's guide
  - Add the `wisaDistributors` constant and the full distributor section BEFORE the blog CTA
  - Update the hero lead paragraph and add the "Where to buy" button
  - Add `id="where-to-buy"` to the distributor section
- Use `next/image` for the product cards (as the brief specifies)
- Images won't exist yet - that's fine, they'll 404 gracefully with next/image

### 6. Add blog post to `src/data/blog-posts.ts`
Use the content from PRD-plywood.md Section 3. Match the existing BlogPost interface exactly.
- Use `publishedAt: "2026-04-19"` (today)
- Content uses real `'` in template literals, NOT `&apos;`

### 7. Add plywood callout to `/tools` page
In `src/app/tools/page.tsx`, add the callout card from Section 4 of the brief.
Place it between the intro hero section and the category grid. Use a Link component.

### 8. Create placeholder images directory
```bash
mkdir -p public/images/plywood
```
The images don't exist yet. Create empty placeholder files so the paths exist:
```bash
touch public/images/plywood/.gitkeep
```

## ESLint rules:
- `&apos;` for apostrophes in JSX text (NOT in template literal strings)
- No unused variables
- `// eslint-disable-next-line @next/next/no-img-element` before any `<img>` tags

## After all changes:
```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```
Must pass. Then:
```bash
git add -A
git commit -m "Add WISA plywood content: hub page, blog post, tool entries, distributor guide"
git push origin floki/plywood-content
```

Do NOT deploy. Do NOT run vercel --prod.
