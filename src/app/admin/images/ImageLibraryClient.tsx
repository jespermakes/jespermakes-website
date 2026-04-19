"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Image } from "@/lib/db/schema";
import { IMAGE_TAG_VOCABULARY } from "@/data/image-tag-vocabulary";

type Vocabulary = typeof IMAGE_TAG_VOCABULARY;

interface Stats {
  total: number;
  untagged: number;
}

export function ImageLibraryClient({ vocabulary }: { vocabulary: Vocabulary }) {
  const [imageList, setImageList] = useState<Image[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, untagged: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Image | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<{ kind: string; value: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{ name: string; status: "pending" | "done" | "error" }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (activeFilter?.kind === "untagged") params.set("untagged", "true");
    if (activeFilter?.kind === "material") params.set("material", activeFilter.value);
    if (activeFilter?.kind === "shotType") params.set("shotType", activeFilter.value);
    if (activeFilter?.kind === "tag") params.set("tag", activeFilter.value);

    const res = await fetch(`/api/admin/images?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setImageList(data.images);
      setStats(data.stats);
    }
    setLoading(false);
  }, [debouncedQuery, activeFilter]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    const queue = Array.from(files).map((f) => ({ name: f.name, status: "pending" as const }));
    setUploadQueue(queue);

    await Promise.all(
      Array.from(files).map(async (file, idx) => {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/admin/images", { method: "POST", body: fd });
          if (!res.ok) throw new Error();
          setUploadQueue((q) => q.map((x, i) => (i === idx ? { ...x, status: "done" } : x)));
        } catch {
          setUploadQueue((q) => q.map((x, i) => (i === idx ? { ...x, status: "error" } : x)));
        }
      })
    );

    setUploading(false);
    setTimeout(() => setUploadQueue([]), 2500);
    fetchImages();
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <HeaderBar
          stats={stats}
          onUploadClick={() => fileInputRef.current?.click()}
          uploading={uploading}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {uploadQueue.length > 0 && <UploadToast queue={uploadQueue} />}

        <DropZone onFiles={handleFiles} />

        <SearchAndFilters
          query={query}
          setQuery={setQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          stats={stats}
          vocabulary={vocabulary}
        />

        <ImageGrid
          images={imageList}
          loading={loading}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />

        {selected && (
          <EditorPanel
            image={selected}
            vocabulary={vocabulary}
            onClose={() => setSelected(null)}
            onSaved={(updated) => {
              setImageList((list) => list.map((i) => (i.id === updated.id ? updated : i)));
              setSelected(updated);
              fetchImages();
            }}
            onDeleted={(id) => {
              setImageList((list) => list.filter((i) => i.id !== id));
              setSelected(null);
              fetchImages();
            }}
          />
        )}
      </div>
    </div>
  );
}

function HeaderBar({
  stats,
  onUploadClick,
  uploading,
}: {
  stats: Stats;
  onUploadClick: () => void;
  uploading: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-7">
      <div>
        <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-1">
          ADMIN / IMAGE LIBRARY
        </div>
        <h1 className="font-serif text-3xl text-wood leading-tight">Every image, tagged</h1>
        <div className="text-sm text-wood-light/60 mt-1">
          {stats.total} total · {stats.untagged} untagged
        </div>
      </div>
      <button
        onClick={onUploadClick}
        disabled={uploading}
        className="bg-wood text-cream rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-wood-light transition-colors disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "+ Upload"}
      </button>
    </div>
  );
}

function DropZone({ onFiles }: { onFiles: (files: FileList) => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      className={`border-2 border-dashed rounded-2xl px-5 py-4 text-center text-xs text-wood-light/50 mb-4 transition-colors ${
        hover ? "border-amber bg-amber/5" : "border-wood/12"
      }`}
    >
      Drop images here to upload and auto-tag with AI
    </div>
  );
}

function UploadToast({ queue }: { queue: { name: string; status: string }[] }) {
  return (
    <div className="mb-4 p-3 rounded-xl bg-white/70 border border-wood/8 text-xs text-wood-light/70">
      {queue.map((q, i) => (
        <div key={i} className="flex justify-between py-0.5">
          <span className="truncate">{q.name}</span>
          <span className={q.status === "error" ? "text-red-600" : q.status === "done" ? "text-green-700" : "text-amber"}>
            {q.status === "pending" ? "tagging…" : q.status === "done" ? "done" : "failed"}
          </span>
        </div>
      ))}
    </div>
  );
}

function SearchAndFilters({
  query,
  setQuery,
  activeFilter,
  setActiveFilter,
  stats,
  vocabulary,
}: {
  query: string;
  setQuery: (q: string) => void;
  activeFilter: { kind: string; value: string } | null;
  setActiveFilter: (f: { kind: string; value: string } | null) => void;
  stats: Stats;
  vocabulary: Vocabulary;
}) {
  const quickTags = [
    ...vocabulary.material.values.slice(0, 3).map((v) => ({ kind: "material", value: v })),
    ...vocabulary.subjects.values.slice(0, 4).map((v) => ({ kind: "tag", value: v })),
    ...vocabulary.shotType.values.slice(0, 2).map((v) => ({ kind: "shotType", value: v })),
  ];

  const isActive = (kind: string, value: string) =>
    activeFilter?.kind === kind && activeFilter.value === value;

  return (
    <div className="mb-5">
      <input
        type="text"
        placeholder="Search filenames, descriptions, tags…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-white border border-wood/12 rounded-xl px-4 py-2.5 text-sm text-wood placeholder:text-wood-light/40 focus:outline-none focus:border-wood/30"
      />
      <div className="flex gap-1.5 flex-wrap mt-3 items-center">
        <span className="text-[11px] text-wood-light/50 pr-1">Filter</span>
        <button
          onClick={() =>
            activeFilter?.kind === "untagged"
              ? setActiveFilter(null)
              : setActiveFilter({ kind: "untagged", value: "true" })
          }
          className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
            activeFilter?.kind === "untagged"
              ? "bg-amber text-cream border-amber"
              : "bg-white border-wood/12 text-wood-light/60 hover:border-wood/30"
          }`}
          style={{ borderStyle: activeFilter?.kind === "untagged" ? "solid" : "dashed" }}
        >
          untagged · {stats.untagged}
        </button>
        {quickTags.map((t) => (
          <button
            key={`${t.kind}-${t.value}`}
            onClick={() => (isActive(t.kind, t.value) ? setActiveFilter(null) : setActiveFilter(t))}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
              isActive(t.kind, t.value)
                ? "bg-amber text-cream border-amber font-medium"
                : "bg-white border-wood/12 text-wood-light/60 hover:border-wood/30"
            }`}
          >
            {t.value}
          </button>
        ))}
        {activeFilter && (
          <button
            onClick={() => setActiveFilter(null)}
            className="text-[11px] text-wood-light/50 hover:text-wood ml-1"
          >
            clear
          </button>
        )}
      </div>
    </div>
  );
}

function ImageGrid({
  images,
  loading,
  selectedId,
  onSelect,
}: {
  images: Image[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (img: Image) => void;
}) {
  if (loading && !images.length) {
    return <div className="text-center py-12 text-sm text-wood-light/40">Loading…</div>;
  }
  if (!images.length) {
    return (
      <div className="text-center py-12 text-sm text-wood-light/50">
        No images match. Upload some, or clear the filters.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
      {images.map((img) => (
        <ImageCard key={img.id} image={img} selected={img.id === selectedId} onClick={() => onSelect(img)} />
      ))}
    </div>
  );
}

function ImageCard({ image, selected, onClick }: { image: Image; selected: boolean; onClick: () => void }) {
  const src = image.source === "public" ? image.url : image.url;
  return (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-xl overflow-hidden group border-2 transition-all ${
        selected ? "border-amber" : "border-transparent hover:border-wood/20"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={image.description ?? image.filename} className="w-full h-full object-cover" loading="lazy" />
      {!image.reviewed && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber rounded-full border-2 border-white" title="Unreviewed" />
      )}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="text-[10px] text-white/90 truncate">{image.filename}</div>
      </div>
    </button>
  );
}

function EditorPanel({
  image,
  vocabulary,
  onClose,
  onSaved,
  onDeleted,
}: {
  image: Image;
  vocabulary: Vocabulary;
  onClose: () => void;
  onSaved: (img: Image) => void;
  onDeleted: (id: string) => void;
}) {
  const [description, setDescription] = useState(image.description ?? "");
  const [material, setMaterial] = useState<string | null>(image.material);
  const [subjects, setSubjects] = useState<string[]>(image.subjects);
  const [shotType, setShotType] = useState<string | null>(image.shotType);
  const [who, setWho] = useState<string[]>(image.who);
  const [setting, setSetting] = useState<string | null>(image.setting);
  const [customTags, setCustomTags] = useState<string[]>(image.customTags);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDescription(image.description ?? "");
    setMaterial(image.material);
    setSubjects(image.subjects);
    setShotType(image.shotType);
    setWho(image.who);
    setSetting(image.setting);
    setCustomTags(image.customTags);
  }, [image.id]);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/images/${image.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        material,
        subjects,
        shotType,
        who,
        setting,
        customTags,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      onSaved(data.image);
    }
    setSaving(false);
  };

  const regenerate = async () => {
    setRegenerating(true);
    const res = await fetch(`/api/admin/images/${image.id}/regenerate`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      const s = data.suggested;
      if (s.description) setDescription(s.description);
      setMaterial(s.material);
      setSubjects(s.subjects);
      setShotType(s.shotType);
      setWho(s.who);
      setSetting(s.setting);
    }
    setRegenerating(false);
  };

  const del = async () => {
    if (!confirm("Hide this image? It stays in the DB but won\u0027t appear in findImages() results.")) return;
    const res = await fetch(`/api/admin/images/${image.id}`, { method: "DELETE" });
    if (res.ok) onDeleted(image.id);
  };

  const copyMarkdown = async () => {
    const md = `![${description || image.filename}](${image.url})`;
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const addCustomTag = () => {
    const t = newTag.trim().toLowerCase();
    if (!t || customTags.includes(t)) return;
    setCustomTags([...customTags, t]);
    setNewTag("");
  };

  return (
    <div className="bg-white border border-wood/10 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40">
          EDITING · {image.filename.toUpperCase()}
        </div>
        <button onClick={onClose} className="text-xs text-wood-light/50 hover:text-wood">close</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-wood/5 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="text-[11px] text-wood-light/60 leading-relaxed break-all">
            {image.width && image.height && `${image.width} × ${image.height}`}
            <br />
            <span className="text-wood-light/40">{image.url}</span>
          </div>
        </div>

        <div>
          <Section label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-cream border border-wood/12 rounded-lg px-3 py-2 text-sm text-wood focus:outline-none focus:border-wood/30 resize-y min-h-[56px]"
            />
            <div className="flex justify-between mt-1 text-[11px] text-wood-light/40">
              <span>{image.descriptionAutoGenerated ? "AI-generated, edit freely" : "User-edited"}</span>
              <button
                onClick={regenerate}
                disabled={regenerating}
                className="text-amber hover:text-amber-dark disabled:opacity-50"
              >
                {regenerating ? "regenerating…" : "↻ regenerate"}
              </button>
            </div>
          </Section>

          <TagSection
            label={`${vocabulary.material.label} · pick one`}
            field="material"
            values={vocabulary.material.values}
            selected={material ? [material] : []}
            onToggle={(v) => setMaterial(material === v ? null : v)}
            multi={false}
          />

          <TagSection
            label={`${vocabulary.subjects.label} · pick any`}
            field="subjects"
            values={vocabulary.subjects.values}
            selected={subjects}
            onToggle={(v) =>
              setSubjects(subjects.includes(v) ? subjects.filter((x) => x !== v) : [...subjects, v])
            }
            multi
          />

          <TagSection
            label={`${vocabulary.shotType.label} · pick one`}
            field="shotType"
            values={vocabulary.shotType.values}
            selected={shotType ? [shotType] : []}
            onToggle={(v) => setShotType(shotType === v ? null : v)}
            multi={false}
          />

          <TagSection
            label={`${vocabulary.who.label} · pick any, optional`}
            field="who"
            values={vocabulary.who.values}
            selected={who}
            onToggle={(v) => setWho(who.includes(v) ? who.filter((x) => x !== v) : [...who, v])}
            multi
          />

          <TagSection
            label={`${vocabulary.setting.label} · pick one, optional`}
            field="setting"
            values={vocabulary.setting.values}
            selected={setting ? [setting] : []}
            onToggle={(v) => setSetting(setting === v ? null : v)}
            multi={false}
          />

          <Section label="Custom tags">
            <div className="flex flex-wrap gap-1.5 items-center">
              {customTags.map((t) => (
                <span
                  key={t}
                  className="bg-wood/5 border border-wood/10 text-wood-light/80 rounded-md px-2.5 py-1 text-xs flex items-center gap-1"
                >
                  {t}
                  <button onClick={() => setCustomTags(customTags.filter((x) => x !== t))} className="hover:text-wood">
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                onBlur={addCustomTag}
                placeholder="+ add"
                className="border border-dashed border-wood/20 bg-transparent rounded-md px-2.5 py-1 text-xs text-wood-light/50 focus:outline-none focus:border-wood/40 w-24"
              />
            </div>
          </Section>

          <div className="flex gap-2 items-center pt-3 border-t border-wood/6">
            <button
              onClick={save}
              disabled={saving}
              className="bg-wood text-cream rounded-lg px-4 py-2 text-xs font-semibold hover:bg-wood-light disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={copyMarkdown}
              className="bg-amber/10 border border-amber/25 text-amber rounded-lg px-3.5 py-2 text-xs font-medium hover:bg-amber/20"
            >
              {copied ? "copied ✓" : "Copy markdown"}
            </button>
            <button
              onClick={del}
              className="border border-wood/12 text-wood-light/55 rounded-lg px-3.5 py-2 text-xs hover:border-red-300 hover:text-red-600"
            >
              Hide
            </button>
            {image.reviewed && (
              <span className="ml-auto text-[11px] text-wood-light/40">Reviewed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <div className="text-[10px] font-bold tracking-[0.15em] text-wood-light/40 mb-1.5 uppercase">{label}</div>
      {children}
    </div>
  );
}

function TagSection({
  label,
  field: _field,
  values,
  selected,
  onToggle,
  multi: _multi,
}: {
  label: string;
  field: string;
  values: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
  multi: boolean;
}) {
  return (
    <Section label={label}>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => {
          const on = selected.includes(v);
          return (
            <button
              key={v}
              onClick={() => onToggle(v)}
              className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                on
                  ? "bg-amber/15 border-amber/35 text-amber-dark font-medium"
                  : "bg-white border-wood/12 text-wood-light/55 hover:border-wood/30"
              }`}
            >
              {v}{on ? " ✓" : ""}
            </button>
          );
        })}
      </div>
    </Section>
  );
}
