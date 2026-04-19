# Build Instructions for Image Library

Read PRD-image-library.md for the COMPLETE source code of every file. Create all files exactly as specified there with these critical adjustments:

## Codebase Convention Adjustments

### 1. Schema file (`src/lib/db/schema.ts`)

The brief uses `sql` from `drizzle-orm` for array defaults. You MUST add `sql` to the imports:

```typescript
import { sql } from "drizzle-orm";
```

Add this at the top of the file, alongside the existing imports. Keep ALL existing imports and exports.

The existing schema uses `{ mode: "date" }` on timestamps. The brief's `images` table uses `{ withTimezone: true }` instead — that's fine, keep the brief's version since it's a new table with different requirements.

The brief uses `.primaryKey().defaultRandom()` order — but the existing codebase uses `.defaultRandom().primaryKey()`. **Match the existing codebase**: use `.defaultRandom().primaryKey()`.

### 2. Route params pattern

The brief uses `{ params }: { params: { id: string } }` for dynamic routes. In Next.js 15+ (which this project uses), params is a Promise. Check how other dynamic routes in the project handle params. If they use the sync pattern, keep it. If they await params, do that instead.

Check: `src/app/api/downloads/[slug]/route.ts` or similar for the pattern.

### 3. ESLint rules

- Use `&apos;` for apostrophes in JSX text content
- Add `// eslint-disable-next-line @next/next/no-img-element` before any `<img>` tags
- Prefix unused function params with `_` (e.g. `_req` not `_request`)
- Remove any unused variables/imports

### 4. The `image-size` import

`image-size` returns a function, not an object with methods. Use it as:
```typescript
import imageSize from "image-size";
// then: const size = imageSize(buffer);
```

### 5. File creation order

1. `src/data/image-tag-vocabulary.ts`
2. `src/lib/db/schema.ts` (append images table + add sql import)
3. Run: `npx drizzle-kit generate && npx drizzle-kit push` (POSTGRES_URL should be in .env.local)
4. `src/lib/image-ai.ts`
5. `src/lib/image-library.ts`
6. `src/app/api/admin/images/route.ts`
7. `src/app/api/admin/images/[id]/route.ts`
8. `src/app/api/admin/images/[id]/regenerate/route.ts`
9. `src/app/api/admin/images/vocabulary/route.ts`
10. `src/app/admin/images/page.tsx`
11. `src/app/admin/images/ImageLibraryClient.tsx`
12. `src/scripts/migrate-existing-images.ts`

### 6. Type check and commit

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```

Must pass with zero errors (ignore .next/types errors, those are pre-existing stale cache).

Then:
```bash
git add -A
git commit -m "Add Image Library admin tool at /admin/images"
git push origin floki/image-library
```

Do NOT deploy to production. Do NOT run the migration script. Just commit and push.

### 7. Important: the `inArray` import

The `findImages` helper uses `inArray` from `drizzle-orm`. Make sure it's imported:
```typescript
import { and, or, eq, ilike, sql, desc, inArray } from "drizzle-orm";
```

### 8. The `images` type export

The brief exports `Image` and `NewImage` types from schema.ts. Make sure these don't conflict with any existing exports. If there's already an `Image` type, rename to `SiteImage` or similar.
