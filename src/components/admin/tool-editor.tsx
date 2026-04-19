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
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  placeholder="https://\u2026"
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
