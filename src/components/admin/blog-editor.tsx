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
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
              className="bg-forest/10 border border-forest/25 text-forest rounded-xl px-4 py-2 text-sm font-medium hover:bg-forest/20"
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
          className="text-[11px] text-forest hover:underline"
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
          placeholder="Start writing\u2026"
          className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-4 py-3 text-wood text-sm leading-relaxed"
          style={{ fontFamily: "Menlo, Monaco, 'Courier New', monospace" }}
        />
        <div className="bg-white/55 border border-wood/[0.07] rounded-xl px-5 py-4 prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-wood prose-p:text-wood-light prose-a:text-forest prose-strong:text-wood overflow-auto">
          <ReactMarkdown>{content || "*Start writing\u2026*"}</ReactMarkdown>
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
