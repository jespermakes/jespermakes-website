# DB Source of Truth Migration Instructions

Read PRD-db-migration.md for all source code.

## Current state
- Static: 20 blog posts, 86 tools
- DB: 18 blog posts, 73 tools
- Brief A columns (category_icon, long_description, etc.) confirmed present

## What to do (in order):

### 1. Create seed script (section 3 of PRD)
Create `src/scripts/seed-content-from-static-files.ts`
Remove the `import "dotenv/config"` line (we don't have dotenv).
Run it:
```bash
export POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
npx tsx src/scripts/seed-content-from-static-files.ts
```
Report results. The script should insert the missing posts and tools.

### 2. Replace public pages (sections 4-5 of PRD)
Replace these files with the code from the PRD:
- `src/app/blog/page.tsx` (section 4.1)
- `src/app/blog/[slug]/page.tsx` (section 4.2)  
- `src/app/tools/page.tsx` (section 5.1)
- `src/app/tools/[slug]/page.tsx` (section 5.2)
- `src/app/tools/category/[categorySlug]/page.tsx` (section 5.3)

### 3. Update homepage blog section (section 6)
Find the component that imports from `@/data/blog-posts` on the homepage.
Replace the static import with a DB query. The component needs to become async (server component).

### 4. Update sitemap if it exists (section 7)

### 5. Update any other imports of static files
Run:
```bash
grep -rn "from \"@/data/blog-posts\"\|from \"@/data/tools\"" src/ --include="*.tsx" --include="*.ts"
```
Any matches in PUBLIC pages need updating to DB queries. 
EXCEPTION: Do NOT touch `src/scripts/seed-content-from-static-files.ts` (it intentionally imports from static files).
EXCEPTION: Do NOT touch `src/app/plywood/page.tsx` (it has hardcoded product data, not imports from tools.ts).

### 6. Do NOT delete the static files
Keep `src/data/blog-posts.ts` and `src/data/tools.ts` as dead code. Safety net.

### 7. ESLint
- `// eslint-disable-next-line @next/next/no-img-element` before every `<img>` tag
- Use `&apos;` in JSX text
- No unused variables
- The `amber` accent was renamed to `forest`. Use `text-forest`, `bg-forest`, `border-forest` etc.
  BUT the PRD was written before the rename and uses `amber` in class names.
  Replace ALL `amber` references in the PRD code with `forest` equivalents:
  - `text-amber` → `text-forest`
  - `bg-amber` → `bg-forest`  
  - `border-amber` → `border-forest`
  - `amber-dark` → `forest-dark`
  - `amber-light` → `forest-light`
  - `hover:text-amber` → `hover:text-forest`
  - etc.

### 8. generateStaticParams
The current blog/tools pages use `generateStaticParams` for static generation.
The new DB-backed pages use `export const revalidate = 60` instead (ISR).
Remove any `generateStaticParams` exports from the replaced pages.
Also check if `next.config.js` or `next.config.ts` has `output: 'export'` — if so, that conflicts with dynamic DB reads. It shouldn't, but check.

### 9. After all changes
```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```
Must pass. Then:
```bash
git add -A
git commit -m "feat: public blog and tools pages read from Postgres"
git push origin floki/db-source-of-truth
```

Do NOT deploy. Do NOT run vercel --prod.
