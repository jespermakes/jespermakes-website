"use client";

import { useEffect, useState } from "react";

const CATEGORIES = [
  "general",
  "furniture",
  "joinery",
  "signs",
  "toys",
  "jigs",
  "decorative",
  "mechanical",
  "laser",
  "cnc",
];

interface PublishModalProps {
  initialName: string;
  initialDescription?: string;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onPublish: (input: {
    name: string;
    description: string;
    tags: string[];
    category: string;
  }) => void;
}

export function PublishModal({
  initialName,
  initialDescription,
  busy,
  error,
  onCancel,
  onPublish,
}: PublishModalProps) {
  const [name, setName] = useState(initialName || "Untitled");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [tagsInput, setTagsInput] = useState("");
  const [category, setCategory] = useState("general");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const submit = () => {
    if (busy) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 12);
    onPublish({ name: name.trim() || "Untitled", description, tags, category });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-wood/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-modal-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-wood/[0.08] bg-cream p-6 text-wood shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="publish-modal-title"
          className="font-serif text-xl text-wood"
        >
          Publish to The Workbench
        </h2>
        <p className="mt-1 text-[12px] text-wood-light">
          Share your design with other makers. Free to use, modify, and remix
          under CC BY 4.0.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <Field label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What is it, what's it made for?"
              className="w-full rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
            />
          </Field>
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tags (comma separated)">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="joinery, box joints, storage"
              className="w-full rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
            />
          </Field>
        </div>
        {error ? (
          <p className="mt-3 rounded-md bg-red-50/70 px-3 py-2 text-[12px] text-red-700">
            {error}
          </p>
        ) : null}
        <p className="mt-4 text-[11px] leading-snug text-wood-light/70">
          By publishing you agree to share this design under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-wood"
          >
            CC BY 4.0
          </a>
          .
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-wood/[0.12] bg-white px-4 py-1.5 text-sm text-wood hover:border-forest/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="rounded-xl bg-wood px-4 py-1.5 text-sm font-medium text-cream hover:bg-wood-light disabled:opacity-60"
          >
            {busy ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/60">
        {label}
      </span>
      {children}
    </label>
  );
}
