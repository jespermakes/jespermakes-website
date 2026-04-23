"use client";
import { useState } from "react";
import type { AboutData } from "@/lib/homepage/types";
import { Field, TextInput, TextArea, SaveBar } from "./_fields";

export default function AboutForm({ initial, onSave, saving }: { initial: AboutData; onSave: (d: AboutData) => void; saving: boolean }) {
  const [d, setD] = useState<AboutData>(initial);

  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading"><TextInput value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Field>
      <Field label="Body" help="One blank line separates paragraphs.">
        <TextArea rows={5} value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} />
      </Field>
      <Field label="Image ID (from image library)">
        <TextInput value={d.imageId ?? ""} onChange={(e) => setD({ ...d, imageId: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Link label"><TextInput value={d.ctaLabel ?? ""} onChange={(e) => setD({ ...d, ctaLabel: e.target.value })} /></Field>
        <Field label="Link URL"><TextInput value={d.ctaUrl ?? ""} onChange={(e) => setD({ ...d, ctaUrl: e.target.value })} /></Field>
      </div>
      <Field label="Image side">
        <select
          value={d.direction ?? "image-left"}
          onChange={(e) => setD({ ...d, direction: e.target.value as "image-left" | "image-right" })}
          className="w-full rounded-md border border-wood/15 bg-white px-3 py-2 text-sm"
        >
          <option value="image-left">Image on left</option>
          <option value="image-right">Image on right</option>
        </select>
      </Field>
      <SaveBar saving={saving} onSave={() => onSave(d)} />
    </div>
  );
}
