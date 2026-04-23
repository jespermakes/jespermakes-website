"use client";
import { useState } from "react";
import type { FeedData, ModuleKind } from "@/lib/homepage/types";
import { Field, TextInput, TextArea, SaveBar } from "./_fields";

export default function FeedForm({ kind, initial, onSave, saving }: { kind: ModuleKind; initial: FeedData; onSave: (d: FeedData) => void; saving: boolean }) {
  const [d, setD] = useState<FeedData>(initial);

  const idLabel = kind === "youtube" ? "YouTube video IDs" : kind === "shop" ? "Product slugs" : "Blog post IDs";
  const idHelp = kind === "youtube" ? "One per line. Example: dQw4w9WgXcQ" : "One per line. Find these in the admin list for the given item.";

  return (
    <div className="flex flex-col gap-4">
      <Field label="Small caps label"><TextInput value={d.caps ?? ""} onChange={(e) => setD({ ...d, caps: e.target.value })} /></Field>
      <Field label="Heading"><TextInput value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Field>
      {kind === "shop" && (
        <Field label="Subtitle (optional)"><TextInput value={d.subtitle ?? ""} onChange={(e) => setD({ ...d, subtitle: e.target.value })} /></Field>
      )}
      <Field label="Mode">
        <div className="flex gap-2">
          <button
            onClick={() => setD({ ...d, mode: "auto" })}
            className={"flex-1 rounded-md border px-3 py-2 text-sm font-medium " + (d.mode === "auto" ? "border-forest bg-forest/10 text-forest" : "border-wood/15 text-wood-light/70")}
            type="button"
          >
            Latest N
          </button>
          <button
            onClick={() => setD({ ...d, mode: "manual" })}
            className={"flex-1 rounded-md border px-3 py-2 text-sm font-medium " + (d.mode === "manual" ? "border-forest bg-forest/10 text-forest" : "border-wood/15 text-wood-light/70")}
            type="button"
          >
            Pick specific
          </button>
        </div>
      </Field>
      {d.mode === "auto" ? (
        <Field label={`How many (1\u20136), currently ${d.count ?? 3}`}>
          <input
            type="range"
            min={1}
            max={6}
            value={d.count ?? 3}
            onChange={(e) => setD({ ...d, count: parseInt(e.target.value, 10) })}
            className="w-full"
          />
        </Field>
      ) : (
        <Field label={idLabel} help={idHelp}>
          <TextArea
            rows={4}
            value={(d.ids ?? []).join("\n")}
            onChange={(e) => setD({ ...d, ids: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
          />
        </Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Link label"><TextInput value={d.ctaLabel ?? ""} onChange={(e) => setD({ ...d, ctaLabel: e.target.value })} /></Field>
        <Field label="Link URL"><TextInput value={d.ctaUrl ?? ""} onChange={(e) => setD({ ...d, ctaUrl: e.target.value })} /></Field>
      </div>
      <SaveBar saving={saving} onSave={() => onSave(d)} />
    </div>
  );
}
