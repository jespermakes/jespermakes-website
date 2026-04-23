"use client";
import { useState } from "react";
import type { NewsletterData } from "@/lib/homepage/types";
import { Field, TextInput, TextArea, SaveBar } from "./_fields";

export default function AdminNewsletterForm({ initial, onSave, saving }: { initial: NewsletterData; onSave: (d: NewsletterData) => void; saving: boolean }) {
  const [d, setD] = useState<NewsletterData>(initial);

  return (
    <div className="flex flex-col gap-4">
      <Field label="Small caps label"><TextInput value={d.caps ?? ""} onChange={(e) => setD({ ...d, caps: e.target.value })} /></Field>
      <Field label="Heading"><TextInput value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Field>
      <Field label="Subtitle"><TextArea rows={2} value={d.subtitle} onChange={(e) => setD({ ...d, subtitle: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button label"><TextInput value={d.buttonLabel} onChange={(e) => setD({ ...d, buttonLabel: e.target.value })} /></Field>
        <Field label="Input placeholder"><TextInput value={d.placeholder} onChange={(e) => setD({ ...d, placeholder: e.target.value })} /></Field>
      </div>
      <Field label="Show subscriber count">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={d.showSubscriberCount} onChange={(e) => setD({ ...d, showSubscriberCount: e.target.checked })} />
          <span className="text-sm text-wood-light">Show the live subscriber count below the form.</span>
        </label>
      </Field>
      <SaveBar saving={saving} onSave={() => onSave(d)} />
    </div>
  );
}
