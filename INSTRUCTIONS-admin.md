# Admin Backend Build Instructions

Read PRD-admin-backend.md for the complete source code.

## Critical Schema Notes

### blogPosts and toolItems DO NOT EXIST YET
They need to be created fresh. Use the "creating fresh" shapes from section 2.3 of the PRD.

### purchases table uses `purchasedAt` not `createdAt`
The dashboard queries reference `purchases.createdAt` but the actual column is `purchasedAt`. Fix all references.

### purchases.amount is integer (cents)
The `/100` math in the dashboard is correct.

### users table has `newsletterSubscribed` boolean
Already exists. The subscribers page query is correct.

### Existing admin pages
- `/admin/title-lab` exists (standalone client component, no layout wrapper)
- `/admin/images` exists with `ImageLibraryClient.tsx`

### The admin layout will wrap ALL /admin/* pages
This means `/admin/title-lab` and `/admin/images` will ALSO get the sidebar. That's fine and intended. But check that `ImageLibraryClient.tsx` still renders correctly inside the new layout (it should, since the layout just adds a sidebar and wraps children).

## File Creation Order

1. Schema changes (blogPosts + toolItems tables) in `src/lib/db/schema.ts`
2. Run drizzle-kit generate (needs PTY for interactive prompts — use tmux)
3. Run drizzle-kit push (same PTY issue)
4. `src/lib/admin/auth.ts`
5. `src/components/admin/stat-card.tsx`
6. `src/components/admin/sidebar.tsx`
7. `src/components/admin/image-picker.tsx`
8. `src/components/admin/blog-editor.tsx`
9. `src/components/admin/tool-editor.tsx`
10. `src/app/admin/layout.tsx`
11. `src/app/admin/page.tsx` (dashboard)
12. All blog admin pages
13. All tools admin pages
14. Orders page
15. Subscribers page + export API route
16. Blog API routes
17. Tools API routes
18. Migration script for linking images

## ESLint Rules
- `&apos;` in JSX text
- No unused variables
- `// eslint-disable-next-line @next/next/no-img-element` before `<img>` tags

## Important Adjustments

### 1. Dashboard — fix purchases.createdAt → purchasedAt
Everywhere the dashboard references `purchases.createdAt`, change to `purchases.purchasedAt`.

### 2. Admin layout — don't break existing admin pages
The existing `/admin/title-lab/page.tsx` is a standalone "use client" component. The existing `/admin/images/page.tsx` imports `ImageLibraryClient`. Both need to work inside the new layout. Check after building.

### 3. The existing `/admin/images/page.tsx` has its own auth check
```typescript
if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
  redirect("/login?callbackUrl=/admin/images");
}
```
This is redundant with the new layout auth check but harmless. Leave it.

### 4. Drizzle interactive prompts
If `npx drizzle-kit generate` or `npx drizzle-kit push` needs interactive prompts (column renames, drops), you can run the SQL directly instead:
```sql
CREATE TABLE IF NOT EXISTS blog_posts (...);
CREATE TABLE IF NOT EXISTS tool_items (...);
```
Use the node approach:
```javascript
const { sql } = require('@vercel/postgres');
await sql`CREATE TABLE IF NOT EXISTS ...`;
```

### 5. Public rendering updates (section 10)
The brief says to update public blog/tool pages to join through heroImageId. BUT the current public pages read from `src/data/blog-posts.ts` and `src/data/tools.ts` (static TypeScript arrays), NOT from the database. 

DO NOT change the public rendering. The admin backend writes to the DB; the public site reads from the static TS files. These are separate systems. The public rendering migration (DB-backed blog/tools) is a future project.

Skip section 10 entirely. Skip section 2.4 (the image linking script) since there's no DB content to link yet.

## After all files are created

```bash
npx tsc --noEmit 2>&1 | grep -v ".next/types"
```
Must pass clean. Then:
```bash
git add -A
git commit -m "feat: rebuild admin backend with image library integration and soft deletes"
git push origin floki/admin-backend-v2
```

Do NOT deploy. Do NOT run vercel --prod.
