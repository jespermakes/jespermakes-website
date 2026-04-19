"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePicker } from "@/components/admin/image-picker";
import type { Image, BuyLink, ColorSwatch, Spec } from "@/lib/db/schema";

export interface ToolEditorInitialValues {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  categoryIcon: string;
  description: string;
  longDescription: string | null;
  imageId: string | null;
  image: string | null;
  buyLinks: BuyLink[];
  ambassadorBadge: boolean;
  featured: boolean;
  sortOrder: number;
  youtubeVideos: string[];
  colorGrid: ColorSwatch[];
  productList: string[];
  gallery: string[];
  useCases: string[];
  specs: Spec[];
  jesperNote: string | null;
  learnMoreUrl: string | null;
  initialImage: Image | null;
}

export function ToolEditor({ initial }: { initial: ToolEditorInitialValues }) {
  const router = useRouter();

  const [slug, setSlug] = useState(initial.slug);
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState(initial.category);
  const [categorySlug, setCategorySlug] = useState(initial.categorySlug);
  const [categoryIcon, setCategoryIcon] = useState(initial.categoryIcon);
  const [description, setDescription] = useState(initial.description);
  const [longDescription, setLongDescription] = useState(initial.longDescription ?? "");
  const [image, setImage] = useState<Image | null>(initial.initialImage);
  const [ambassadorBadge, setAmbassadorBadge] = useState(initial.ambassadorBadge);
  const [featured, setFeatured] = useState(initial.featured);
  const [sortOrder, setSortOrder] = useState(initial.sortOrder);
  const [buyLinks, setBuyLinks] = useState<BuyLink[]>(initial.buyLinks);
  const [youtubeVideos, setYoutubeVideos] = useState<string[]>(initial.youtubeVideos);
  const [colorGrid, setColorGrid] = useState<ColorSwatch[]>(initial.colorGrid);
  const [productList, setProductList] = useState<string[]>(initial.productList);
  const [gallery, setGallery] = useState<string[]>(initial.gallery);
  const [useCases, setUseCases] = useState<string[]>(initial.useCases);
  const [specs, setSpecs] = useState<Spec[]>(initial.specs);
  const [jesperNote, setJesperNote] = useState(initial.jesperNote ?? "");
  const [learnMoreUrl, setLearnMoreUrl] = useState(initial.learnMoreUrl ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);

  const updateBuyLink = (i: number, field: keyof BuyLink, val: string) => {
    const next = [...buyLinks];
    next[i] = { ...next[i], [field]: val };
    setBuyLinks(next);
  };
  const addBuyLink = () => setBuyLinks([...buyLinks, { label: "", url: "" }]);
  const removeBuyLink = (i: number) => setBuyLinks(buyLinks.filter((_, idx) => idx !== i));

  const updateSpec = (i: number, field: keyof Spec, val: string) => {
    const next = [...specs];
    next[i] = { ...next[i], [field]: val };
    setSpecs(next);
  };
  const addSpec = () => setSpecs([...specs, { label: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(specs.filter((_, idx) => idx !== i));

  const updateUseCase = (i: number, val: string) => {
    const next = [...useCases];
    next[i] = val;
    setUseCases(next);
  };
  const addUseCase = () => setUseCases([...useCases, ""]);
  const removeUseCase = (i: number) => setUseCases(useCases.filter((_, idx) => idx !== i));

  const addGalleryImage = (img: Image) => {
    if (!gallery.includes(img.url)) setGallery([...gallery, img.url]);
  };
  const removeGalleryImage = (url: string) => setGallery(gallery.filter((g) => g !== url));

  const updateYoutubeVideo = (i: number, val: string) => {
    const next = [...youtubeVideos];
    next[i] = val;
    setYoutubeVideos(next);
  };
  const addYoutubeVideo = () => setYoutubeVideos([...youtubeVideos, ""]);
  const removeYoutubeVideo = (i: number) => setYoutubeVideos(youtubeVideos.filter((_, idx) => idx !== i));

  const updateColorSwatch = (i: number, field: keyof ColorSwatch, val: string) => {
    const next = [...colorGrid];
    next[i] = { ...next[i], [field]: val };
    setColorGrid(next);
  };
  const addColorSwatch = () => setColorGrid([...colorGrid, { name: "", hex: "" }]);
  const removeColorSwatch = (i: number) => setColorGrid(colorGrid.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    setError(null);

    const cleanBuyLinks = buyLinks.filter((l) => l.label.trim() && l.url.trim());
    const cleanSpecs = specs.filter((s) => s.label.trim() && s.value.trim());
    const cleanUseCases = useCases.map((u) => u.trim()).filter(Boolean);
    const cleanYoutubeVideos = youtubeVideos.map((v) => v.trim()).filter(Boolean);
    const cleanColorGrid = colorGrid.filter((c) => c.name.trim() && c.hex.trim());
    const cleanProductList = productList.map((p) => p.trim()).filter(Boolean);

    const payload = {
      slug: slug.trim(),
      name: name.trim(),
      category: category.trim(),
      categorySlug: categorySlug.trim(),
      categoryIcon: categoryIcon.trim(),
      description: description.trim(),
      longDescription: longDescription.trim() || null,
      imageId: image?.id ?? null,
      image: image?.url ?? null,
      buyLinks: cleanBuyLinks,
      ambassadorBadge,
      featured,
      sortOrder,
      youtubeVideos: cleanYoutubeVideos,
      colorGrid: cleanColorGrid,
      productList: cleanProductList,
      gallery,
      useCases: cleanUseCases,
      specs: cleanSpecs,
      jesperNote: jesperNote.trim() || null,
      learnMoreUrl: learnMoreUrl.trim() || null,
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
    const ok = window.confirm(
      `Hide "${name}"? It won't show in the tools list, but can be restored.`
    );
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
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </Field>
        <Field label="Slug">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-mono text-sm"
          />
        </Field>
        <Field label="Category">
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </Field>
        <Field label="Category slug">
          <input
            type="text"
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-mono text-sm"
          />
        </Field>
        <Field label="Category icon (emoji)">
          <input
            type="text"
            value={categoryIcon}
            onChange={(e) => setCategoryIcon(e.target.value)}
            placeholder="⚡"
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </Field>
        <div />
        <div className="md:col-span-2">
          <Field label="Description (short, shown on cards)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Long description (optional, shown on detail page)">
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              rows={5}
              className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Primary image">
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
                className="bg-forest/10 border border-forest/25 text-forest rounded-xl px-4 py-2 text-sm font-medium hover:bg-forest/20"
              >
                {image ? "Change" : "Pick image"}
              </button>
            </div>
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Buy links">
            <div className="space-y-2">
              {buyLinks.map((link, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_100px_auto] gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Label (e.g. Festool Denmark)"
                    value={link.label}
                    onChange={(e) => updateBuyLink(i, "label", e.target.value)}
                    className="bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
                  />
                  <input
                    type="text"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => updateBuyLink(i, "url", e.target.value)}
                    className="bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
                  />
                  <select
                    value={link.region ?? ""}
                    onChange={(e) => updateBuyLink(i, "region", e.target.value)}
                    className="bg-white/70 border border-wood/[0.12] rounded-xl px-2 py-2 text-wood text-xs"
                  >
                    <option value="">—</option>
                    <option value="global">Global</option>
                    <option value="eu">EU</option>
                    <option value="us">US</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeBuyLink(i)}
                    className="text-xs text-wood-light/50 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addBuyLink} className="text-xs text-forest hover:underline">
                + Add buy link
              </button>
            </div>
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Use cases (optional)">
            <div className="space-y-2">
              {useCases.map((uc, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={uc}
                    onChange={(e) => updateUseCase(i, e.target.value)}
                    className="flex-1 bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeUseCase(i)}
                    className="text-xs text-wood-light/50 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addUseCase} className="text-xs text-forest hover:underline">
                + Add use case
              </button>
            </div>
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Specs (optional)">
            <div className="space-y-2">
              {specs.map((spec, i) => (
                <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={spec.label}
                    onChange={(e) => updateSpec(i, "label", e.target.value)}
                    className="bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) => updateSpec(i, "value", e.target.value)}
                    className="bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="text-xs text-wood-light/50 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSpec} className="text-xs text-forest hover:underline">
                + Add spec
              </button>
            </div>
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Gallery (optional, pick multiple images from library)">
            <div className="flex flex-wrap gap-2 mb-2">
              {gallery.map((url) => (
                <div key={url} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg border border-wood/[0.12]"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(url)}
                    className="absolute top-1 right-1 bg-white/95 rounded-full w-5 h-5 text-xs text-wood-light/70 hover:text-red-700 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setGalleryPickerOpen(true)}
              className="bg-forest/10 border border-forest/25 text-forest rounded-xl px-4 py-2 text-sm font-medium hover:bg-forest/20"
            >
              + Add from library
            </button>
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="YouTube video IDs (optional)">
            <div className="space-y-2">
              {youtubeVideos.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. jOXvrHeSLzs"
                    value={v}
                    onChange={(e) => updateYoutubeVideo(i, e.target.value)}
                    className="flex-1 bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeYoutubeVideo(i)}
                    className="text-xs text-wood-light/50 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addYoutubeVideo} className="text-xs text-forest hover:underline">
                + Add video
              </button>
            </div>
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Color grid (optional, for finishes)">
            <div className="space-y-2">
              {colorGrid.map((swatch, i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_1fr_auto] gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Color name"
                    value={swatch.name}
                    onChange={(e) => updateColorSwatch(i, "name", e.target.value)}
                    className="bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={swatch.hex || "#000000"}
                      onChange={(e) => updateColorSwatch(i, "hex", e.target.value)}
                      className="w-10 h-8 cursor-pointer rounded"
                    />
                    <input
                      type="text"
                      placeholder="#RRGGBB"
                      value={swatch.hex}
                      onChange={(e) => updateColorSwatch(i, "hex", e.target.value)}
                      className="flex-1 bg-white/70 border border-wood/[0.12] rounded-xl px-2 py-2 text-wood font-mono text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Collection (optional)"
                    value={swatch.collection ?? ""}
                    onChange={(e) => updateColorSwatch(i, "collection", e.target.value)}
                    className="bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeColorSwatch(i)}
                    className="text-xs text-wood-light/50 hover:text-red-700 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addColorSwatch} className="text-xs text-forest hover:underline">
                + Add color
              </button>
            </div>
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Jesper's note (optional, shown as callout)">
            <textarea
              value={jesperNote}
              onChange={(e) => setJesperNote(e.target.value)}
              rows={3}
              className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Learn more URL (optional, internal route)">
            <input
              type="text"
              value={learnMoreUrl}
              onChange={(e) => setLearnMoreUrl(e.target.value)}
              placeholder="/plywood"
              className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood font-mono text-sm"
            />
          </Field>
        </div>

        <div className="md:col-span-2 flex items-center gap-6 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-wood-light/70">
            <input
              type="checkbox"
              checked={ambassadorBadge}
              onChange={(e) => setAmbassadorBadge(e.target.checked)}
              className="accent-forest"
            />
            Ambassador badge
          </label>
          <label className="flex items-center gap-2 text-sm text-wood-light/70">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-forest"
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
      <ImagePicker
        open={galleryPickerOpen}
        onClose={() => setGalleryPickerOpen(false)}
        onPick={addGalleryImage}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}
