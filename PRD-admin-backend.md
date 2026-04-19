# FLOKI-ADMIN-BACKEND-V2.md

Rebuild of the admin backend that got lost in the plywood incident. This version integrates with the image library (no more parallel image stores), soft-deletes everything, and is gated by the new deploy safeguards.

**Preflight reminder:** before you do anything in this brief, run the session-start protocol from `CLAUDE.md`:
1. `git status`
2. `git log --oneline -10`
3. `git fetch origin && git log origin/main --oneline -10`
4. Report state to Jesper, wait for his confirmation before writing any files.

**Deploy is via git push only.** You run `./scripts/preflight.sh`, commit, push, wait, run `./scripts/postflight.sh`. No `vercel --prod` from CLI.

---

## 1. What this ships

### Pages (all under `/admin/*`, gated by `ADMIN_EMAIL`)

| Path | Purpose |
|------|---------|
| `/admin` | Dashboard — revenue, subscriber count, recent activity, links |
| `/admin/blog` | Blog post list — all posts, filter by status |
| `/admin/blog/new` | Create new blog post |
| `/admin/blog/[id]` | Edit existing blog post |
| `/admin/tools` | Tool list — all tools, grouped by category |
| `/admin/tools/[id]` | Edit existing tool |
| `/admin/orders` | Last 100 purchases |
| `/admin/subscribers` | Newsletter subscriber list + CSV export |

Plus deep links to `/admin/title-lab` and `/admin/images` (both already built).

### API routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/admin/blog` | POST | Create blog post |
| `/api/admin/blog/[id]` | PATCH, DELETE | Update / soft-delete blog post |
| `/api/admin/tools/[id]` | PATCH, DELETE | Update / soft-delete tool |
| `/api/admin/subscribers/export` | GET | CSV download |

Notice there's no `/api/admin/upload` anymore — all image upload flows through `/api/admin/images` (the image library upload endpoint that already exists).

### New shared component

`src/components/admin/image-picker.tsx` — modal that lists the image library, lets you pick one or upload a new one. Used by both the blog editor (hero image + inline body images) and the tool editor. This replaces every file input in v1.

### Schema changes

- `blogPosts.hidden` — new boolean, default false. For soft delete.
- `toolItems.hidden` — new boolean, default false. For soft delete.
- `blogPosts.heroImageId` — new uuid nullable, fk to `images.id`. New posts reference library entries by ID; old posts keep `heroImage` string as fallback.
- `toolItems.imageId` — same pattern as above.

---

## 2. Schema migration

Edit `src/lib/db/schema.ts`. Assumes `blogPosts` and `toolItems` tables already exist from v1 or prior deploys. If they don't exist yet, the migration also needs to create them — see section 2.3 below.

### 2.1 Add columns

Add to the existing `blogPosts` table definition:

```typescript
heroImageId: uuid("hero_image_id").references(() => images.id, { onDelete: "set null" }),
hidden: boolean("hidden").notNull().default(false),
```

Add to the existing `toolItems` table definition:

```typescript
imageId: uuid("image_id").references(() => images.id, { onDelete: "set null" }),
hidden: boolean("hidden").notNull().default(false),
```

### 2.2 Export new type aliases (if not already)

Make sure these exist in the schema file for consumption elsewhere:

```typescript
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type ToolItem = typeof toolItems.$inferSelect;
export type NewToolItem = typeof toolItems.$inferInsert;
```

### 2.3 Verify blogPosts and toolItems exist

Before generating the migration, check if `blogPosts` and `toolItems` actually exist in the schema. If they don't (they may have been part of the lost backend), you'll need to create them fresh.

If creating fresh, use these shapes:

```typescript
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  content: text("content").notNull().default(""),
  author: text("author").notNull().default("Jesper"),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  heroImage: text("hero_image"),
  heroImageId: uuid("hero_image_id").references(() => images.id, { onDelete: "set null" }),
  heroImageAlt: text("hero_image_alt"),
  featuredVideo: text("featured_video"),
  status: text("status").notNull().default("draft"),
  hidden: boolean("hidden").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const toolItems = pgTable("tool_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  categorySlug: text("category_slug").notNull(),
  description: text("description").notNull().default(""),
  image: text("image"),
  imageId: uuid("image_id").references(() => images.id, { onDelete: "set null" }),
  buyLinks: jsonb("buy_links").notNull().default(sql`'{}'::jsonb`),
  ambassadorBadge: boolean("ambassador_badge").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

Make sure these imports exist at the top of `schema.ts`:

```typescript
import { sql } from "drizzle-orm";
import { pgTable, uuid, text, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
```

### 2.4 Data migration for existing blog/tool rows

If `blogPosts` and `toolItems` tables already have data with legacy `heroImage`/`image` string paths pointing at library-indexed files, populate the new `*ImageId` columns so future renders can join through cleanly.

Create `src/scripts/link-existing-content-images.ts`:

```typescript
import "dotenv/config";
import { db } from "../lib/db";
import { blogPosts, toolItems, images } from "../lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

async function run() {
  const allImages = await db.select().from(images);
  const byUrl = new Map<string, string>();
  for (const img of allImages) {
    byUrl.set(img.url, img.id);
  }

  console.log(`Image library has ${allImages.length} rows`);

  const posts = await db
    .select()
    .from(blogPosts)
    .where(and(isNull(blogPosts.heroImageId)));

  let postsLinked = 0;
  for (const post of posts) {
    if (post.heroImage && byUrl.has(post.heroImage)) {
      const imageId = byUrl.get(post.heroImage)!;
      await db.update(blogPosts).set({ heroImageId: imageId }).where(eq(blogPosts.id, post.id));
      postsLinked++;
    }
  }

  const tools = await db
    .select()
    .from(toolItems)
    .where(and(isNull(toolItems.imageId)));

  let toolsLinked = 0;
  for (const tool of tools) {
    if (tool.image && byUrl.has(tool.image)) {
      const imageId = byUrl.get(tool.image)!;
      await db.update(toolItems).set({ imageId }).where(eq(toolItems.id, tool.id));
      toolsLinked++;
    }
  }

  console.log(`Linked ${postsLinked} blog posts, ${toolsLinked} tools to image library`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Run this locally after the schema push, before visiting the admin pages:

```bash
POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
export POSTGRES_URL
npx tsx src/scripts/link-existing-content-images.ts
```

### 2.5 Generate and push

```bash
npx drizzle-kit generate
POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
export POSTGRES_URL
npx drizzle-kit push
```

Review what it proposes to alter before confirming. If it tries to drop any column that should persist, abort and report to Jesper.

---

## 3. Admin auth helper

If `src/lib/admin/auth.ts` doesn't exist (it was in the lost backend), create it now. All admin API routes and pages use this.

```typescript
import { auth } from "@/lib/auth";

export async function isAdmin() {
  const session = await auth();
  return !!(session?.user?.email && session.user.email === process.env.ADMIN_EMAIL);
}

export async function checkAdminApi() {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false as const, error: "Unauthorized", status: 401 };
  }
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    return { ok: false as const, error: "Forbidden", status: 403 };
  }
  return { ok: true as const, session };
}
```

---

## 4. Admin layout and sidebar

### 4.1 `src/app/admin/layout.tsx`

```typescript
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = {
  title: "Admin · Jesper Makes",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto flex">
        <AdminSidebar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
```

### 4.2 `src/components/admin/sidebar.tsx`

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

const DEEP_DIVES = [
  { href: "/admin/title-lab", label: "Title Lab stats" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <aside className="w-60 shrink-0 border-r border-wood/[0.08] min-h-[calc(100vh-64px)] px-4 py-6">
      <div className="text-[10px] font-bold tracking-[0.18em] text-wood-light/40 uppercase mb-4 px-3">
        Admin
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "px-3 py-2 rounded-lg bg-wood/[0.08] text-wood font-semibold text-sm"
                  : "px-3 py-2 rounded-lg text-wood-light/70 hover:text-wood hover:bg-wood/[0.04] text-sm"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 px-3">
        <div className="text-[10px] font-bold tracking-[0.18em] text-wood-light/40 uppercase mb-2">
          Deep dives
        </div>
        {DEEP_DIVES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-lg text-wood-light/70 hover:text-wood hover:bg-wood/[0.04] text-sm"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
```

No Events link. No /admin/upload. Images is a first-class admin area now.

---

## 5. The Image Picker (the crown jewel)

This component replaces every file input in v1. Both editors use it. Create `src/components/admin/image-picker.tsx`:

```typescript
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Image } from "@/lib/db/schema";

interface ImagePickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (image: Image) => void;
  initialQuery?: string;
}

export function ImagePicker({ open, onClose, onPick, initialQuery = "" }: ImagePickerProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query, open]);

  const fetchImages = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    const res = await fetch(`/api/admin/images?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setImages(data.images);
    }
    setLoading(false);
  }, [debounced, open]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/images", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        onPick(data.image);
        onClose();
      }
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-wood/40 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-cream border border-wood/10 rounded-2xl max-w-5xl w-full mt-8 mb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 p-5 border-b border-wood/8">
          <div>
            <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
              Pick an image
            </div>
            <div className="font-serif text-xl text-wood mt-0.5">
              From the library, or upload a new one
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-wood text-cream rounded-xl px-4 py-2 text-xs font-semibold hover:bg-wood-light disabled:opacity-50"
            >
              {uploading ? "Uploading & tagging…" : "+ Upload new"}
            </button>
            <button
              onClick={onClose}
              className="text-sm text-wood-light/60 hover:text-wood px-2"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-5">
          <input
            type="text"
            placeholder="Search by filename, description, tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-white border border-wood/12 rounded-xl px-4 py-2.5 text-sm text-wood placeholder:text-wood-light/40 focus:outline-none focus:border-wood/30 mb-4"
          />

          {loading && !images.length && (
            <div className="text-center py-12 text-sm text-wood-light/40">Loading…</div>
          )}

          {!loading && !images.length && (
            <div className="text-center py-12 text-sm text-wood-light/50">
              No images match. Upload one above.
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => {
                  onPick(img);
                  onClose();
                }}
                className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-amber transition-all text-left"
                title={img.description ?? img.filename}
              >
                <img
                  src={img.url}
                  alt={img.description ?? img.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {!img.reviewed && (
                  <span
                    className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber rounded-full border-2 border-white"
                    title="Unreviewed — tags may be inaccurate"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-[10px] text-white/90 line-clamp-2 leading-snug">
                    {img.description || img.filename}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Design notes:**

- Clicks through the `/api/admin/images` endpoint that already exists, so no new backend needed for browsing.
- Upload button posts to the existing `/api/admin/images` POST endpoint, which already auto-tags via AI and creates a library row. The picker receives the new row back and hands it to the caller. Every image enters the library, no exceptions.
- Amber dot on unreviewed images signals "tags may be inaccurate" — matches the pattern in `/admin/images`.
- Matches the existing admin aesthetic: cream background, wood text, warm amber hovers.

---

## 6. Blog editor (updated)

`src/components/admin/blog-editor.tsx`. Replaces v1 entirely. Keep the markdown preview, slug auto-gen, and draft/publish flow; swap the image flows for the picker; support image IDs.

```typescript
"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { ImagePicker } from "@/components/admin/image-picker";
import type { Image } from "@/lib/db/schema";

export interface BlogEditorInitialValues {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  content?: string;
  tags?: string[];
  heroImageId?: string | null;
  heroImage?: string | null;
  heroImageAlt?: string | null;
  featuredVideo?: string | null;
  status?: "draft" | "published";
  initialHeroImage?: Image | null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogEditor({ initial }: { initial: BlogEditorInitialValues }) {
  const router = useRouter();
  const isNew = !initial.id;

  const [slug, setSlug] = useState(initial.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [title, setTitle] = useState(initial.title ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [content, setContent] = useState(initial.content ?? "");
  const [tags, setTags] = useState((initial.tags ?? []).join(", "));
  const [heroImage, setHeroImage] = useState<Image | null>(initial.initialHeroImage ?? null);
  const [heroImageAlt, setHeroImageAlt] = useState(initial.heroImageAlt ?? "");
  const [featuredVideo, setFeaturedVideo] = useState(initial.featuredVideo ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState<"hero" | "body" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slugTouched && isNew) setSlug(slugify(newTitle));
  };

  const handleHeroPick = (img: Image) => {
    setHeroImage(img);
    if (!heroImageAlt && img.description) setHeroImageAlt(img.description);
  };

  const handleBodyPick = (img: Image) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const alt = img.description || img.filename.replace(/\.[^.]+$/, "");
    const snippet = `\n![${alt}](${img.url})\n`;
    const newText = content.slice(0, start) + snippet + content.slice(end);
    setContent(newText);
    setTimeout(() => {
      ta.focus();
      const cursor = start + snippet.length;
      ta.setSelectionRange(cursor, cursor);
    }, 0);
  };

  const save = async (publishOverride?: "draft" | "published") => {
    setError(null);
    setSaving(true);

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim(),
      content,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      heroImageId: heroImage?.id ?? null,
      heroImage: heroImage?.url ?? null,
      heroImageAlt: heroImageAlt.trim() || null,
      featuredVideo: featuredVideo.trim() || null,
      status: publishOverride ?? status,
    };

    if (!payload.slug) {
      setError("Slug is required");
      setSaving(false);
      return;
    }
    if (!payload.title) {
      setError("Title is required");
      setSaving(false);
      return;
    }

    try {
      const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${initial.id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        setError(err.error || "Save failed");
        setSaving(false);
        return;
      }
      const data = await res.json();
      if (publishOverride) setStatus(publishOverride);
      if (isNew && data.post?.id) {
        router.push(`/admin/blog/${data.post.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial.id) return;
    const ok = window.confirm(
      `Hide "${title || "this post"}"? It won't be visible on the site, but can be restored.`
    );
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/blog/${initial.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/blog");
      } else {
        setError("Hide failed");
      }
    } catch {
      setError("Hide failed");
    }
  };

  return (
    <div className="max-w-[1400px]">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="font-serif text-2xl font-normal text-wood m-0 mr-auto">
          {isNew ? "New post" : "Edit post"}
        </h1>
        {!isNew && status === "published" && slug && (
          <a
            href={`/blog/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-wood-light/60 hover:text-wood px-3 py-2"
          >
            View on site ↗
          </a>
        )}
        <button
          onClick={() => save("draft")}
          disabled={saving}
          className="border border-wood/[0.18] text-wood-light rounded-xl py-2 px-4 text-sm font-medium disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          onClick={() => save("published")}
          disabled={saving}
          className="bg-wood text-cream rounded-xl py-2 px-5 text-sm font-semibold disabled:opacity-50"
        >
          {status === "published" ? "Update" : "Publish"}
        </button>
        {!isNew && (
          <button
            onClick={handleDelete}
            className="text-xs text-red-700/70 hover:text-red-700 px-3 py-2"
          >
            Hide
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-serif text-base"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-mono text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="woodworking, beginner, pallet wood"
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
            Featured video (YouTube ID)
          </label>
          <input
            type="text"
            value={featuredVideo}
            onChange={(e) => setFeaturedVideo(e.target.value)}
            placeholder="e.g. jOXvrHeSLzs"
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-mono text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
            Hero image
          </label>
          <div className="flex gap-3 items-start">
            {heroImage ? (
              <div className="flex-1 flex gap-3 items-center bg-white/70 border border-wood/[0.12] rounded-xl p-2.5">
                <img
                  src={heroImage.url}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-wood truncate font-medium">{heroImage.filename}</div>
                  <div className="text-xs text-wood-light/60 line-clamp-2">
                    {heroImage.description || <span className="italic">No description</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroImage(null)}
                  className="text-xs text-wood-light/50 hover:text-red-700 px-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex-1 text-sm text-wood-light/50 bg-white/30 border border-dashed border-wood/15 rounded-xl p-3">
                No hero image selected
              </div>
            )}
            <button
              type="button"
              onClick={() => setPickerOpen("hero")}
              className="bg-amber/10 border border-amber/25 text-amber rounded-xl px-4 py-2 text-sm font-medium hover:bg-amber/20"
            >
              {heroImage ? "Change" : "Pick image"}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
            Hero image alt text
          </label>
          <input
            type="text"
            value={heroImageAlt}
            onChange={(e) => setHeroImageAlt(e.target.value)}
            placeholder={heroImage?.description ?? "Describe this image for screen readers"}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
          Body (markdown)
        </div>
        <button
          type="button"
          onClick={() => setPickerOpen("body")}
          className="text-[11px] text-amber hover:underline"
        >
          + Insert image from library
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={30}
          spellCheck={false}
          placeholder="Start writing…"
          className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-4 py-3 text-wood text-sm leading-relaxed"
          style={{ fontFamily: "Menlo, Monaco, 'Courier New', monospace" }}
        />
        <div className="bg-white/55 border border-wood/[0.07] rounded-xl px-5 py-4 prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-wood prose-p:text-wood-light prose-a:text-amber prose-strong:text-wood overflow-auto">
          <ReactMarkdown>{content || "*Start writing…*"}</ReactMarkdown>
        </div>
      </div>

      <ImagePicker
        open={pickerOpen === "hero"}
        onClose={() => setPickerOpen(null)}
        onPick={handleHeroPick}
      />
      <ImagePicker
        open={pickerOpen === "body"}
        onClose={() => setPickerOpen(null)}
        onPick={handleBodyPick}
      />
    </div>
  );
}
```

**Key differences from v1:**

- `heroImage` is now a full `Image` row, not a string. We render a preview card with filename and description.
- "Pick image" opens the library picker. "Change" and "Remove" let you swap or clear.
- Hero alt text auto-populates from the image's library description, but can be overridden per-post.
- Body inline images use the picker too — no more raw file inputs.
- Delete is now "Hide" (soft delete).

---

## 7. Tool editor (updated)

`src/components/admin/tool-editor.tsx`. Replaces v1. Same image-picker pattern.

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePicker } from "@/components/admin/image-picker";
import type { Image } from "@/lib/db/schema";

export interface ToolEditorInitialValues {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  imageId: string | null;
  image: string | null;
  buyLinks: Record<string, string>;
  ambassadorBadge: boolean;
  featured: boolean;
  sortOrder: number;
  initialImage: Image | null;
}

export function ToolEditor({ initial }: { initial: ToolEditorInitialValues }) {
  const router = useRouter();

  const [slug, setSlug] = useState(initial.slug);
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState(initial.category);
  const [categorySlug, setCategorySlug] = useState(initial.categorySlug);
  const [description, setDescription] = useState(initial.description);
  const [image, setImage] = useState<Image | null>(initial.initialImage);
  const [ambassadorBadge, setAmbassadorBadge] = useState(initial.ambassadorBadge);
  const [featured, setFeatured] = useState(initial.featured);
  const [sortOrder, setSortOrder] = useState(initial.sortOrder);
  const [buyLinks, setBuyLinks] = useState<{ key: string; value: string }[]>(
    Object.entries(initial.buyLinks).map(([key, value]) => ({ key, value }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const addBuyLink = () => setBuyLinks([...buyLinks, { key: "", value: "" }]);
  const updateBuyLink = (index: number, field: "key" | "value", val: string) => {
    const next = [...buyLinks];
    next[index] = { ...next[index], [field]: val };
    setBuyLinks(next);
  };
  const removeBuyLink = (index: number) => setBuyLinks(buyLinks.filter((_, i) => i !== index));

  const save = async () => {
    setSaving(true);
    setError(null);
    const buyLinksObj: Record<string, string> = {};
    for (const { key, value } of buyLinks) {
      if (key.trim() && value.trim()) buyLinksObj[key.trim()] = value.trim();
    }
    const payload = {
      slug: slug.trim(),
      name: name.trim(),
      category: category.trim(),
      categorySlug: categorySlug.trim(),
      description: description.trim(),
      imageId: image?.id ?? null,
      image: image?.url ?? null,
      buyLinks: buyLinksObj,
      ambassadorBadge,
      featured,
      sortOrder,
    };
    try {
      const res = await fetch(`/api/admin/tools/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        setError(err.error || "Save failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(`Hide "${name}"? It won't show in the tools list, but can be restored.`);
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/tools/${initial.id}`, { method: "DELETE" });
      if (res.ok) router.push("/admin/tools");
      else setError("Hide failed");
    } catch {
      setError("Hide failed");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="font-serif text-2xl font-normal text-wood m-0 mr-auto">Edit tool</h1>
        <a
          href={`/tools/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-wood-light/60 hover:text-wood px-3 py-2"
        >
          View on site ↗
        </a>
        <button
          onClick={save}
          disabled={saving}
          className="bg-wood text-cream rounded-xl py-2 px-5 text-sm font-semibold disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={handleDelete}
          className="text-xs text-red-700/70 hover:text-red-700 px-3 py-2"
        >
          Hide
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">Category slug</label>
          <input
            type="text"
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-mono text-sm"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">Image</label>
          <div className="flex gap-3 items-start">
            {image ? (
              <div className="flex-1 flex gap-3 items-center bg-white/70 border border-wood/[0.12] rounded-xl p-2.5">
                <img src={image.url} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-wood truncate font-medium">{image.filename}</div>
                  <div className="text-xs text-wood-light/60 line-clamp-2">
                    {image.description || <span className="italic">No description</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="text-xs text-wood-light/50 hover:text-red-700 px-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex-1 text-sm text-wood-light/50 bg-white/30 border border-dashed border-wood/15 rounded-xl p-3">
                No image selected
              </div>
            )}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="bg-amber/10 border border-amber/25 text-amber rounded-xl px-4 py-2 text-sm font-medium hover:bg-amber/20"
            >
              {image ? "Change" : "Pick image"}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">Buy links</label>
          <div className="space-y-2">
            {buyLinks.map((link, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="key (e.g. amazon)"
                  value={link.key}
                  onChange={(e) => updateBuyLink(i, "key", e.target.value)}
                  className="w-32 bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-mono text-xs"
                />
                <input
                  type="text"
                  placeholder="https://…"
                  value={link.value}
                  onChange={(e) => updateBuyLink(i, "value", e.target.value)}
                  className="flex-1 bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeBuyLink(i)}
                  className="text-xs text-wood-light/50 hover:text-red-700 px-2"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={addBuyLink} className="text-xs text-amber hover:underline">
              + Add link
            </button>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-6 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-wood-light/70">
            <input
              type="checkbox"
              checked={ambassadorBadge}
              onChange={(e) => setAmbassadorBadge(e.target.checked)}
              className="accent-amber"
            />
            Ambassador badge
          </label>
          <label className="flex items-center gap-2 text-sm text-wood-light/70">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-amber"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-wood-light/70">
            Sort order
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="w-20 bg-white/70 border border-wood/[0.12] rounded-xl px-2 py-1 text-wood text-sm"
            />
          </label>
        </div>
      </div>

      <ImagePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={setImage} />
    </div>
  );
}
```

---

## 8. API routes

### 8.1 `src/app/api/admin/blog/route.ts` (POST)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    if (!body.slug || typeof body.slug !== "string") {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }
    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, body.slug))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: `Slug "${body.slug}" already exists` }, { status: 409 });
    }

    const now = new Date();
    const status = body.status === "published" ? "published" : "draft";

    const [created] = await db
      .insert(blogPosts)
      .values({
        slug: body.slug,
        title: body.title,
        description: body.description ?? "",
        content: body.content ?? "",
        author: body.author ?? "Jesper",
        tags: Array.isArray(body.tags) ? body.tags : [],
        heroImage: body.heroImage ?? null,
        heroImageId: body.heroImageId ?? null,
        heroImageAlt: body.heroImageAlt ?? null,
        featuredVideo: body.featuredVideo ?? null,
        status,
        publishedAt: status === "published" ? now : null,
      })
      .returning();

    return NextResponse.json({ post: created });
  } catch (e) {
    console.error("Create post error:", e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
```

### 8.2 `src/app/api/admin/blog/[id]/route.ts` (PATCH, DELETE)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { and, eq, ne } from "drizzle-orm";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    const id = params.id;

    const currentRows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (currentRows.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const current = currentRows[0];

    if (body.slug && body.slug !== current.slug) {
      const clash = await db
        .select({ id: blogPosts.id })
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, body.slug), ne(blogPosts.id, id)))
        .limit(1);
      if (clash.length > 0) {
        return NextResponse.json(
          { error: `Slug "${body.slug}" is already used by another post` },
          { status: 409 }
        );
      }
    }

    let publishedAt = current.publishedAt;
    if (body.status === "published" && current.status !== "published" && !publishedAt) {
      publishedAt = new Date();
    }

    const updates: Partial<typeof blogPosts.$inferInsert> = { updatedAt: new Date() };
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.content !== undefined) updates.content = body.content;
    if (body.author !== undefined) updates.author = body.author;
    if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.heroImage !== undefined) updates.heroImage = body.heroImage;
    if (body.heroImageId !== undefined) updates.heroImageId = body.heroImageId;
    if (body.heroImageAlt !== undefined) updates.heroImageAlt = body.heroImageAlt;
    if (body.featuredVideo !== undefined) updates.featuredVideo = body.featuredVideo;
    if (body.status !== undefined) updates.status = body.status;
    if (publishedAt !== current.publishedAt) updates.publishedAt = publishedAt;

    const [updated] = await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id)).returning();

    return NextResponse.json({ post: updated });
  } catch (e) {
    console.error("Update post error:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const [updated] = await db
      .update(blogPosts)
      .set({ hidden: true, updatedAt: new Date() })
      .where(eq(blogPosts.id, params.id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Hide post error:", e);
    return NextResponse.json({ error: "Hide failed" }, { status: 500 });
  }
}
```

**Note:** DELETE is soft — flips `hidden: true`. The list view will filter these out. To actually restore a hidden post, edit it in the DB directly or add a "Restore" button later (out of scope for v2).

### 8.3 `src/app/api/admin/tools/[id]/route.ts` (PATCH, DELETE)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import { checkAdminApi } from "@/lib/admin/auth";
import { and, eq, ne } from "drizzle-orm";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    const id = params.id;

    if (body.slug) {
      const clash = await db
        .select({ id: toolItems.id })
        .from(toolItems)
        .where(and(eq(toolItems.slug, body.slug), ne(toolItems.id, id)))
        .limit(1);
      if (clash.length > 0) {
        return NextResponse.json(
          { error: `Slug "${body.slug}" is already used by another tool` },
          { status: 409 }
        );
      }
    }

    const updates: Partial<typeof toolItems.$inferInsert> = { updatedAt: new Date() };
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.categorySlug !== undefined) updates.categorySlug = body.categorySlug;
    if (body.description !== undefined) updates.description = body.description;
    if (body.image !== undefined) updates.image = body.image;
    if (body.imageId !== undefined) updates.imageId = body.imageId;
    if (body.buyLinks !== undefined) {
      updates.buyLinks = typeof body.buyLinks === "object" && body.buyLinks !== null ? body.buyLinks : {};
    }
    if (body.ambassadorBadge !== undefined) updates.ambassadorBadge = !!body.ambassadorBadge;
    if (body.featured !== undefined) updates.featured = !!body.featured;
    if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder) || 0;

    const [updated] = await db.update(toolItems).set(updates).where(eq(toolItems.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    return NextResponse.json({ tool: updated });
  } catch (e) {
    console.error("Update tool error:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const [updated] = await db
      .update(toolItems)
      .set({ hidden: true, updatedAt: new Date() })
      .where(eq(toolItems.id, params.id))
      .returning();
    if (!updated) return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Hide tool error:", e);
    return NextResponse.json({ error: "Hide failed" }, { status: 500 });
  }
}
```

### 8.4 `src/app/api/admin/subscribers/export/route.ts`

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { checkAdminApi } from "@/lib/admin/auth";

function csvEscape(s: string | null | undefined): string {
  if (s === null || s === undefined) return "";
  const str = String(s);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET() {
  const gate = await checkAdminApi();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const rows = await db
    .select({ email: users.email, name: users.name, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.newsletterSubscribed, true))
    .orderBy(desc(users.createdAt));

  const header = "email,name,joined_at\n";
  const body = rows
    .map((r) => `${csvEscape(r.email)},${csvEscape(r.name)},${r.createdAt.toISOString()}`)
    .join("\n");
  const csv = header + body + (body.length > 0 ? "\n" : "");

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jespermakes-subscribers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
```

---

## 9. Admin pages

### 9.1 `src/app/admin/page.tsx` — Dashboard

**Before you commit this file**, check `src/lib/db/schema.ts` for the `purchases` table. Confirm whether `amount` is stored in cents (integer) or dollars (real). The v1 assumption was cents. If it's actually dollars, remove the `/ 100` divisions below.

```typescript
import Link from "next/link";
import { db } from "@/lib/db";
import { purchases, users, blogPosts, toolItems } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { StatCard } from "@/components/admin/stat-card";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(${purchases.amount}), 0)::int` })
    .from(purchases);

  const [subscriberCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.newsletterSubscribed, true));

  const [postCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(blogPosts)
    .where(eq(blogPosts.hidden, false));

  const [toolCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(toolItems)
    .where(eq(toolItems.hidden, false));

  const recentOrders = await db
    .select({
      id: purchases.id,
      sku: purchases.sku,
      amount: purchases.amount,
      createdAt: purchases.createdAt,
      email: users.email,
    })
    .from(purchases)
    .leftJoin(users, eq(purchases.userId, users.id))
    .orderBy(desc(purchases.createdAt))
    .limit(5);

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-normal text-wood mb-1">Dashboard</h1>
        <p className="text-sm text-wood-light/60 m-0">What's happening on the site.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Revenue"
          value={`$${((revenueResult?.total ?? 0) / 100).toFixed(0)}`}
          sub="All-time · from Stripe"
          href="/admin/orders"
        />
        <StatCard
          label="Subscribers"
          value={(subscriberCount?.count ?? 0).toLocaleString()}
          sub="Newsletter list"
          href="/admin/subscribers"
        />
        <StatCard
          label="Blog posts"
          value={postCount?.count ?? 0}
          sub="Visible on site"
          href="/admin/blog"
        />
        <StatCard
          label="Tools"
          value={toolCount?.count ?? 0}
          sub="Visible on site"
          href="/admin/tools"
        />
      </div>

      <div className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 mb-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-xl font-normal text-wood m-0">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs text-amber hover:underline">
            See all ↗
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-sm text-wood-light/50">No orders yet.</div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((row) => (
              <div key={row.id} className="flex items-center gap-4 text-sm py-1">
                <div className="font-mono text-xs text-wood-light/60 truncate flex-1">{row.sku ?? "—"}</div>
                <div className="text-wood-light/70 truncate flex-1">
                  {row.email ?? <span className="text-wood-light/40">guest</span>}
                </div>
                <div className="text-wood font-semibold tabular-nums">
                  ${(Number(row.amount ?? 0) / 100).toFixed(2)}
                </div>
                <div className="text-wood-light/50 text-xs tabular-nums w-20 text-right">
                  {new Date(row.createdAt).toISOString().slice(0, 10)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/images"
          className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 hover:border-wood/[0.15]"
        >
          <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1">
            Image library
          </div>
          <div className="text-wood font-semibold">Browse, tag, upload images →</div>
        </Link>
        <Link
          href="/admin/title-lab"
          className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 hover:border-wood/[0.15]"
        >
          <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1">
            Title Lab usage
          </div>
          <div className="text-wood font-semibold">Events, session analysis →</div>
        </Link>
      </div>
    </div>
  );
}
```

### 9.2 `src/components/admin/stat-card.tsx`

```typescript
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}

export function StatCard({ label, value, sub, href }: StatCardProps) {
  const inner = (
    <div className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 h-full hover:border-wood/[0.15] transition-colors">
      <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-2">
        {label}
      </div>
      <div className="text-3xl font-semibold text-wood leading-none mb-1">{value}</div>
      {sub && <div className="text-xs text-wood-light/55">{sub}</div>}
    </div>
  );
  if (href) {
    return <Link href={href} className="block no-underline">{inner}</Link>;
  }
  return inner;
}
```

### 9.3 `src/app/admin/blog/page.tsx` — Blog list

```typescript
import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminBlogListPage() {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.hidden, false))
    .orderBy(desc(blogPosts.updatedAt));

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Blog</h1>
          <p className="text-sm text-wood-light/60 m-0">
            {rows.length} {rows.length === 1 ? "post" : "posts"}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-wood text-cream rounded-xl py-3 px-5 text-sm font-semibold no-underline"
        >
          + New post
        </Link>
      </div>

      <div className="bg-white/55 border border-wood/[0.07] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_140px] gap-4 px-5 py-3 border-b border-wood/[0.06] text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
          <div>Title</div>
          <div>Status</div>
          <div className="text-right">Updated</div>
        </div>
        {rows.length === 0 && (
          <div className="p-5 text-sm text-wood-light/50">No posts yet. Create one to start.</div>
        )}
        {rows.map((row, i) => (
          <Link
            key={row.id}
            href={`/admin/blog/${row.id}`}
            className={
              "grid grid-cols-[1fr_120px_140px] gap-4 px-5 py-3 text-sm hover:bg-wood/[0.03] no-underline" +
              (i > 0 ? " border-t border-wood/[0.05]" : "")
            }
          >
            <div>
              <div className="text-wood font-medium truncate">{row.title}</div>
              <div className="text-xs text-wood-light/50 font-mono truncate">/{row.slug}</div>
            </div>
            <div>
              <span
                className={
                  row.status === "published"
                    ? "text-[11px] bg-amber/15 text-amber-dark rounded-md px-2 py-0.5 font-medium"
                    : "text-[11px] bg-wood/8 text-wood-light/60 rounded-md px-2 py-0.5 font-medium"
                }
              >
                {row.status}
              </span>
            </div>
            <div className="text-right text-wood-light/50 text-xs tabular-nums">
              {new Date(row.updatedAt).toISOString().slice(0, 10)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### 9.4 `src/app/admin/blog/new/page.tsx`

```typescript
import { BlogEditor } from "@/components/admin/blog-editor";

export default function NewBlogPostPage() {
  return <BlogEditor initial={{}} />;
}
```

### 9.5 `src/app/admin/blog/[id]/page.tsx`

```typescript
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { blogPosts, images } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BlogEditor } from "@/components/admin/blog-editor";

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, params.id)).limit(1);
  const post = rows[0];
  if (!post) notFound();

  let initialHeroImage = null;
  if (post.heroImageId) {
    const imgRows = await db.select().from(images).where(eq(images.id, post.heroImageId)).limit(1);
    initialHeroImage = imgRows[0] ?? null;
  }

  return (
    <BlogEditor
      initial={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        tags: post.tags,
        heroImageId: post.heroImageId,
        heroImage: post.heroImage,
        heroImageAlt: post.heroImageAlt,
        featuredVideo: post.featuredVideo,
        status: post.status as "draft" | "published",
        initialHeroImage,
      }}
    />
  );
}
```

### 9.6 `src/app/admin/tools/page.tsx`

```typescript
import Link from "next/link";
import { db } from "@/lib/db";
import { toolItems } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminToolsListPage() {
  const rows = await db
    .select()
    .from(toolItems)
    .where(eq(toolItems.hidden, false))
    .orderBy(asc(toolItems.category), asc(toolItems.sortOrder), asc(toolItems.name));

  const byCategory = new Map<string, typeof rows>();
  for (const row of rows) {
    const arr = byCategory.get(row.category) ?? [];
    arr.push(row);
    byCategory.set(row.category, arr);
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Tools</h1>
          <p className="text-sm text-wood-light/60 m-0">
            {rows.length} visible · {byCategory.size} categories
          </p>
        </div>
      </div>

      {Array.from(byCategory.entries()).map(([category, tools]) => (
        <div key={category} className="mb-8">
          <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-2">
            {category}
          </div>
          <div className="bg-white/55 border border-wood/[0.07] rounded-2xl overflow-hidden">
            {tools.map((row, i) => (
              <Link
                key={row.id}
                href={`/admin/tools/${row.id}`}
                className={
                  "flex items-center gap-4 px-5 py-3 text-sm hover:bg-wood/[0.03] no-underline" +
                  (i > 0 ? " border-t border-wood/[0.05]" : "")
                }
              >
                <div className="flex-1 min-w-0">
                  <div className="text-wood font-medium truncate">{row.name}</div>
                  <div className="text-xs text-wood-light/50 font-mono truncate">/{row.slug}</div>
                </div>
                {row.ambassadorBadge && (
                  <span className="text-[11px] bg-amber/15 text-amber-dark rounded-md px-2 py-0.5 font-medium">
                    Ambassador
                  </span>
                )}
                {row.featured && (
                  <span className="text-[11px] bg-wood/10 text-wood-light/70 rounded-md px-2 py-0.5 font-medium">
                    Featured
                  </span>
                )}
                <div className="text-wood-light/40 text-xs tabular-nums w-10 text-right">
                  {row.sortOrder}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {rows.length === 0 && (
        <div className="bg-white/55 border border-wood/[0.07] rounded-2xl p-5 text-sm text-wood-light/50">
          No tools yet.
        </div>
      )}
    </div>
  );
}
```

### 9.7 `src/app/admin/tools/[id]/page.tsx`

```typescript
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toolItems, images } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ToolEditor } from "@/components/admin/tool-editor";

export default async function EditToolPage({ params }: { params: { id: string } }) {
  const rows = await db.select().from(toolItems).where(eq(toolItems.id, params.id)).limit(1);
  const tool = rows[0];
  if (!tool) notFound();

  let initialImage = null;
  if (tool.imageId) {
    const imgRows = await db.select().from(images).where(eq(images.id, tool.imageId)).limit(1);
    initialImage = imgRows[0] ?? null;
  }

  return (
    <ToolEditor
      initial={{
        id: tool.id,
        slug: tool.slug,
        name: tool.name,
        category: tool.category,
        categorySlug: tool.categorySlug,
        description: tool.description,
        imageId: tool.imageId,
        image: tool.image,
        buyLinks: (tool.buyLinks as Record<string, string>) ?? {},
        ambassadorBadge: tool.ambassadorBadge,
        featured: tool.featured,
        sortOrder: tool.sortOrder,
        initialImage,
      }}
    />
  );
}
```

### 9.8 `src/app/admin/orders/page.tsx`

Same shape as v1. Double-check the `amount` unit before committing.

```typescript
import { db } from "@/lib/db";
import { purchases, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const rows = await db
    .select({
      id: purchases.id,
      sku: purchases.sku,
      amount: purchases.amount,
      createdAt: purchases.createdAt,
      userId: purchases.userId,
      email: users.email,
    })
    .from(purchases)
    .leftJoin(users, eq(purchases.userId, users.id))
    .orderBy(desc(purchases.createdAt))
    .limit(100);

  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Orders</h1>
          <p className="text-sm text-wood-light/60 m-0">
            Last {rows.length} purchases · ${(totalRevenue / 100).toFixed(2)} shown ·{" "}
            <a
              href="https://dashboard.stripe.com"
              className="text-amber hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Full history in Stripe ↗
            </a>
          </p>
        </div>
      </div>

      <div className="bg-white/55 border border-wood/[0.07] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_120px_140px] gap-4 px-5 py-3 border-b border-wood/[0.06] text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
          <div>SKU</div>
          <div>Customer</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Date</div>
        </div>
        {rows.length === 0 && <div className="p-5 text-sm text-wood-light/50">No orders yet.</div>}
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={
              "grid grid-cols-[1fr_1fr_120px_140px] gap-4 px-5 py-3 text-sm" +
              (i > 0 ? " border-t border-wood/[0.05]" : "")
            }
          >
            <div className="text-wood truncate font-mono text-xs">{row.sku ?? "—"}</div>
            <div className="text-wood-light/70 truncate">
              {row.email ?? <span className="text-wood-light/40">guest</span>}
            </div>
            <div className="text-right text-wood font-semibold tabular-nums">
              ${(Number(row.amount ?? 0) / 100).toFixed(2)}
            </div>
            <div className="text-right text-wood-light/50 text-xs tabular-nums">
              {new Date(row.createdAt).toISOString().slice(0, 10)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 9.9 `src/app/admin/subscribers/page.tsx`

Same as v1 — no changes needed. Reproducing for completeness:

```typescript
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.newsletterSubscribed, true))
    .orderBy(desc(users.createdAt));

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-wood mb-1">Subscribers</h1>
          <p className="text-sm text-wood-light/60 m-0">
            {rows.length.toLocaleString()} newsletter {rows.length === 1 ? "subscriber" : "subscribers"}
          </p>
        </div>
        <a
          href="/api/admin/subscribers/export"
          className="bg-wood text-cream rounded-xl py-3 px-5 text-sm font-semibold no-underline"
        >
          Download CSV
        </a>
      </div>

      <div className="bg-white/55 border border-wood/[0.07] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_140px] gap-4 px-5 py-3 border-b border-wood/[0.06] text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase">
          <div>Email</div>
          <div>Name</div>
          <div className="text-right">Joined</div>
        </div>
        {rows.length === 0 && (
          <div className="p-5 text-sm text-wood-light/50">No subscribers yet.</div>
        )}
        {rows.map((row, i) => (
          <div
            key={row.id}
            className={
              "grid grid-cols-[1fr_1fr_140px] gap-4 px-5 py-3 text-sm" +
              (i > 0 ? " border-t border-wood/[0.05]" : "")
            }
          >
            <div className="text-wood truncate">{row.email}</div>
            <div className="text-wood-light/60 truncate">{row.name ?? "—"}</div>
            <div className="text-right text-wood-light/50 text-xs tabular-nums">
              {new Date(row.createdAt).toISOString().slice(0, 10)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 10. Public rendering updates

The public blog post page and tools pages need to prefer `heroImageId` → join to `images.url`, falling back to the legacy string.

### 10.1 `src/app/blog/[slug]/page.tsx`

Wherever the current file loads a blog post, update the image resolution:

```typescript
import { db } from "@/lib/db";
import { blogPosts, images } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const rows = await db
  .select({
    post: blogPosts,
    image: images,
  })
  .from(blogPosts)
  .leftJoin(images, eq(blogPosts.heroImageId, images.id))
  .where(and(eq(blogPosts.slug, params.slug), eq(blogPosts.hidden, false)))
  .limit(1);

const post = rows[0]?.post;
const heroImageUrl = rows[0]?.image?.url ?? post?.heroImage ?? null;
const heroImageAlt = post?.heroImageAlt ?? rows[0]?.image?.description ?? "";
```

Apply the same pattern in the blog list page and the tools pages — prefer the joined library row, fall back to the legacy string.

### 10.2 Important

Filter out `hidden` posts and tools from all public pages. This is the soft-delete payoff:

- `/blog` — `where(eq(blogPosts.hidden, false))`
- `/blog/[slug]` — same, plus 404 if hidden
- `/tools` — `where(eq(toolItems.hidden, false))`
- `/tools/[slug]` — same
- `/tools/category/[categorySlug]` — same

If any public route forgets the hidden filter, hidden content will still be visible. Grep for `from(blogPosts)` and `from(toolItems)` across `src/app/` and verify each call site.

---

## 11. Update the project knowledge doc

Jesper maintains `JESPER-MAKES-DEV-HANDOFF.md` in his Claude project folder. Suggest he add the following under the existing tools sections:

```markdown
### Admin backend (/admin/*)

Full CRUD for blog posts and tools, plus read-only views for orders and subscribers. Gated by `ADMIN_EMAIL`.

Every image anywhere in the admin flows through the Image Library picker — there is no "upload directly to this post" bypass. This is deliberate: it keeps the library the single source of truth and makes every image findable by `findImages()` later.

Deletions are soft (hidden: true). There's no hard delete from the UI. Restoring a hidden row means editing the DB directly for now; a Restore button is a v2.1 task if Jesper asks.

See `tool-knowledge-admin-backend.md` for architecture details.
```

And create `tool-knowledge-admin-backend.md` for the project folder with a short doc summarizing the design decisions. Skeleton:

```markdown
# The Admin Backend — Knowledge Document

## What it is
/admin/* pages for managing blog, tools, orders, subscribers. Gated by ADMIN_EMAIL.

## Core design rule
No image upload bypasses the library. Every file input is the ImagePicker. Every new image gets AI-tagged on upload and enters the library.

## Soft delete everywhere
DELETE endpoints set hidden: true. Public pages filter on hidden = false. No button for hard delete.

## Image references
blogPosts.heroImageId + toolItems.imageId point at images.id. Public pages render by joining; fall back to legacy string columns if null.

## Events is not here
Deferred intentionally. Jesper wasn't sure what he wanted. If/when he decides, it lives at /admin/events.

## The Dashboard number gotcha
purchases.amount unit must be verified before committing. Cents vs dollars was ambiguous in v1.
```

---

## 12. Smoke test

After deploy, walk through this:

- [ ] `/admin` loads for Jesper, redirects logged-out users to `/login`
- [ ] Dashboard numbers render (revenue, subscribers, posts, tools)
- [ ] `/admin/blog` lists posts, hidden ones are filtered out
- [ ] `/admin/blog/new` opens a blank editor, Pick Image opens the library
- [ ] Picking an image populates the hero preview and alt text
- [ ] Uploading a new image from the picker shows it in the library immediately with AI tags
- [ ] Saving draft succeeds; Publish flips status and sets publishedAt
- [ ] `/admin/blog/[id]` loads existing post with its hero image visible
- [ ] Hide button confirms, then returns to list; hidden post does not appear
- [ ] Hidden post does NOT appear on public `/blog` or `/blog/[slug]`
- [ ] `/admin/tools` lists tools grouped by category
- [ ] `/admin/tools/[id]` loads existing tool with image, Pick Image works
- [ ] Inline body image insert works — picker opens, selection inserts markdown
- [ ] `/admin/orders` shows purchases with correct dollar amounts (check 2-3 against Stripe)
- [ ] `/admin/subscribers` shows list, CSV download works and parses cleanly
- [ ] `/admin/images` still works (nothing should have changed there)
- [ ] Postflight `./scripts/postflight.sh` passes — add `/admin` to the URL list

---

## 13. Deploy sequence

```bash
cd ~/jesper-makes-ai/website

# Session-start protocol first — CLAUDE.md requires it
git status
git log --oneline -10
git fetch origin
git log origin/main --oneline -10
# Report to Jesper, wait for confirmation

# Pull latest if needed
git pull --rebase origin main

# Create all the new files from this brief
# (schema edits, admin layout, sidebar, image-picker, blog-editor,
#  tool-editor, all API routes, all admin pages, public-page image
#  resolution updates)

# Generate & push schema
npx drizzle-kit generate
POSTGRES_URL=$(grep '^POSTGRES_URL=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
export POSTGRES_URL
npx drizzle-kit push
# Review proposed changes, confirm only if safe

# Link existing content to the image library
npx tsx src/scripts/link-existing-content-images.ts

# Log the deploy
./scripts/log-deploy.sh "Admin backend v2 with image library integration"

# Commit
git add .
git commit -m "feat: rebuild admin backend with image library integration and soft deletes"

# Preflight
./scripts/preflight.sh
# If this fails, STOP and surface to Jesper

# Push (Vercel auto-deploys)
git push origin main

# Wait for deploy
sleep 120

# Postflight
./scripts/postflight.sh

# Report Vercel deployment URL and smoke-test results to Jesper in Slack
```

---

## 14. Gotchas

1. **`purchases.amount` unit.** Check before committing the Dashboard page. v1 assumed cents and hedged it with an `ASSUMPTION` comment. Confirm against the real schema.

2. **Image library endpoint is reused.** Do NOT create a new `/api/admin/upload` route. The ImagePicker uses `/api/admin/images` (the library's own POST endpoint) for uploads, which already auto-tags and creates library rows. Creating a separate upload route reopens the v1 bug where uploads bypass tagging.

3. **Legacy string columns stay.** `blogPosts.heroImage` and `toolItems.image` are not dropped. They're fallbacks for content that hasn't been relinked to library rows. A future cleanup can drop them once everything's migrated.

4. **Soft-delete requires public filtering.** Hidden posts won't magically hide themselves — every `from(blogPosts)` and `from(toolItems)` call in public code needs `where(eq(..., hidden, false))`. Grep and verify before shipping.

5. **Drizzle's `.$inferInsert` and `.$inferSelect` need the table exported.** If TypeScript complains about `Partial<typeof blogPosts.$inferInsert>`, check the export.

6. **ESLint apostrophes.** Standard site-wide gotcha — `'` in JSX text must be `&apos;`. The brief uses straight quotes in JS strings, which is fine, but watch JSX.

7. **Events is gone.** The v1 sidebar had an Events link; v2 doesn't. If anyone asks, tell Jesper and he can revisit.

8. **The picker's z-index.** It's `z-50`. If there's other fixed-position UI that sits higher, the picker will be under it. Bump to `z-[60]` if needed.

9. **The image library's `/api/admin/images` GET accepts a search query.** The picker uses `?q=` to search by filename, description, and custom tags. Verify that endpoint still works the way v1.1 defined it — some of its details matter here.

10. **Public blog/tool pages reading heroImage/image need the left join.** If those routes were written before v2 with a plain select, add the join now. Without the join, the preview shows the old URL string or nothing, not the library row.

---

*v2 of the admin backend, April 2026. Built after the plywood incident. Ships under the new deploy safeguards.*
