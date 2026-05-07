"use client";

import { useEffect, useState } from "react";

interface Collection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  itemCount: number;
  updatedAt: string;
}

export function CollectionsPanel() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/collections");
        if (!res.ok) return;
        const json = (await res.json()) as { collections: Collection[] };
        if (!cancelled) setCollections(json.collections ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const create = async () => {
    if (!newName.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          collection: { id: string; name: string; isPublic: boolean };
        };
        setCollections((prev) => [
          {
            id: json.collection.id,
            name: json.collection.name,
            description: "",
            isPublic: json.collection.isPublic,
            itemCount: 0,
            updatedAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNewName("");
        setCreating(false);
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (
      !window.confirm(
        "Delete this collection? Designs inside aren't deleted, only the collection.",
      )
    )
      return;
    const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
    if (res.ok) setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <section className="mt-10">
      <header className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/40">
          Collections
        </h2>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="rounded-md border border-wood/[0.12] bg-white px-3 py-1 text-[12px] text-wood hover:border-forest/40"
        >
          + New
        </button>
      </header>
      {creating ? (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void create();
              if (e.key === "Escape") {
                setCreating(false);
                setNewName("");
              }
            }}
            autoFocus
            placeholder="Collection name"
            maxLength={100}
            className="flex-1 rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
          />
          <button
            type="button"
            onClick={create}
            disabled={busy || !newName.trim()}
            className="rounded-md bg-wood px-4 py-1.5 text-sm font-medium text-cream hover:bg-wood-light disabled:opacity-60"
          >
            Create
          </button>
        </div>
      ) : null}
      {loading ? (
        <p className="mt-3 text-[12px] text-wood-light/60">Loading…</p>
      ) : collections.length === 0 ? (
        <p className="mt-3 text-[12px] text-wood-light/60">
          No collections yet. Group your designs by project or by material.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {collections.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-wood/[0.08] bg-white px-3 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="flex-1 truncate text-sm font-medium text-wood"
                  title={c.name}
                >
                  {c.name}
                </span>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  aria-label="Delete collection"
                  className="text-[12px] text-wood-light hover:text-red-700"
                >
                  ×
                </button>
              </div>
              <p className="mt-1 text-[11px] text-wood-light/70">
                {c.itemCount} item{c.itemCount === 1 ? "" : "s"}
                {c.isPublic ? " · public" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
