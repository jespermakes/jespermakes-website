"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VideoCreateForm({ kind }: { kind: "longform" | "shorts" }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title: title.trim(),
          stage: "idea",
          sponsor: sponsor.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Create failed" }));
        setError(err.error || "Create failed");
        return;
      }
      const { video } = await res.json();
      router.push(`/admin/videos/${kind}/${video.id}`);
    } catch {
      setError("Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === "longform" ? "e.g. The Festool Story" : "e.g. Pallet wood teaser"}
          className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          autoFocus
        />
      </div>
      {kind === "longform" && (
        <div>
          <label className="block text-[10px] font-bold tracking-[0.15em] text-wood-light/40 uppercase mb-1.5">
            Sponsor (optional)
          </label>
          <input
            type="text"
            value={sponsor}
            onChange={(e) => setSponsor(e.target.value)}
            placeholder="e.g. Festool"
            className="w-full bg-white/70 border border-wood/[0.12] rounded-xl px-3 py-2 text-wood text-sm"
          />
        </div>
      )}
      <button
        type="submit"
        disabled={saving || !title.trim()}
        className="bg-wood text-cream rounded-xl py-2 px-5 text-sm font-semibold disabled:opacity-50"
      >
        Create
      </button>
    </form>
  );
}
