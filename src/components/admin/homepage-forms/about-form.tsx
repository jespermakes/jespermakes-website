"use client";
import { useState } from "react";
import type { AboutData } from "@/lib/homepage/types";
import { ImagePicker } from "@/components/admin/image-picker";
import ThemePicker from "./theme-picker";
import { Field, TextInput, TextArea, SaveBar } from "./_fields";

export default function AboutForm({ initial, onSave, saving }: { initial: AboutData; onSave: (d: AboutData) => void; saving: boolean }) {
  const [d, setD] = useState<AboutData>(initial);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading"><TextInput value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Field>
      <Field label="Body" help="One blank line separates paragraphs.">
        <TextArea rows={5} value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} />
      </Field>
      <Field label="About image">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPickerOpen(true)} className="rounded-md border border-wood/15 bg-white px-3 py-2 text-sm hover:bg-wood/5">
            {d.imageId ? "Change image" : "Pick image"}
          </button>
          {d.imageId && <span className="text-xs text-wood-light/60 font-mono">{d.imageId}</span>}
        </div>
        <ImagePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={(img) => { setD({ ...d, imageId: img.id }); setPickerOpen(false); }} />
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
      <ThemePicker value={d.theme} onChange={(t) => setD({ ...d, theme: t })} />
      <SaveBar saving={saving} onSave={() => onSave(d)} />
    </div>
  );
}
