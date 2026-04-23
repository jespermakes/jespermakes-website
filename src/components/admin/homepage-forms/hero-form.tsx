"use client";
import { useState } from "react";
import type { HeroData } from "@/lib/homepage/types";
import { ImagePicker } from "@/components/admin/image-picker";
import ThemePicker from "./theme-picker";
import { Field, TextInput, TextArea, SaveBar } from "./_fields";

export default function HeroForm({ initial, onSave, saving }: { initial: HeroData; onSave: (d: HeroData) => void; saving: boolean }) {
  const [d, setD] = useState<HeroData>(initial);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Field label="Headline"><TextInput value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Field>
      <Field label="Accent phrase" help="A phrase inside the headline that gets italicized in green. Must match text in the headline exactly.">
        <TextInput value={d.titleHighlight ?? ""} onChange={(e) => setD({ ...d, titleHighlight: e.target.value })} />
      </Field>
      <Field label="Subtitle"><TextArea rows={3} value={d.subtitle} onChange={(e) => setD({ ...d, subtitle: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Primary button label"><TextInput value={d.primaryCta.label} onChange={(e) => setD({ ...d, primaryCta: { ...d.primaryCta, label: e.target.value } })} /></Field>
        <Field label="Primary button URL"><TextInput value={d.primaryCta.url} onChange={(e) => setD({ ...d, primaryCta: { ...d.primaryCta, url: e.target.value } })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Secondary button label"><TextInput value={d.secondaryCta?.label ?? ""} onChange={(e) => setD({ ...d, secondaryCta: { label: e.target.value, url: d.secondaryCta?.url ?? "" } })} /></Field>
        <Field label="Secondary button URL"><TextInput value={d.secondaryCta?.url ?? ""} onChange={(e) => setD({ ...d, secondaryCta: { label: d.secondaryCta?.label ?? "", url: e.target.value } })} /></Field>
      </div>
      <Field label="Hero image">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPickerOpen(true)} className="rounded-md border border-wood/15 bg-white px-3 py-2 text-sm hover:bg-wood/5">
            {d.mediaImageId ? "Change image" : "Pick image"}
          </button>
          {d.mediaImageId && <span className="text-xs text-wood-light/60 font-mono">{d.mediaImageId}</span>}
        </div>
        <ImagePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={(img) => { setD({ ...d, mediaImageId: img.id }); setPickerOpen(false); }} />
      </Field>
      <Field label="Overlay text (optional)" help="Text shown on top of the hero image">
        <TextInput value={d.mediaOverlayText ?? ""} onChange={(e) => setD({ ...d, mediaOverlayText: e.target.value })} />
      </Field>
      <Field label="YouTube video ID (optional)" help="If set, the hero image becomes clickable and opens this video.">
        <TextInput value={d.mediaYoutubeId ?? ""} onChange={(e) => setD({ ...d, mediaYoutubeId: e.target.value })} />
      </Field>
      <ThemePicker value={d.theme} onChange={(t) => setD({ ...d, theme: t })} />
      <SaveBar saving={saving} onSave={() => onSave(d)} />
    </div>
  );
}
