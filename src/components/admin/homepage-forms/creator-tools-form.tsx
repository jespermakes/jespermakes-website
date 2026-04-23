"use client";
import { useState } from "react";
import type { CreatorToolsData } from "@/lib/homepage/types";
import { CREATOR_TOOL_REGISTRY, CREATOR_TOOL_SLUGS } from "@/lib/creator-tools";
import { Field, TextInput, TextArea, SaveBar } from "./_fields";

export default function CreatorToolsForm({ initial, onSave, saving }: { initial: CreatorToolsData; onSave: (d: CreatorToolsData) => void; saving: boolean }) {
  const [d, setD] = useState<CreatorToolsData>(initial);

  function toggleTool(slug: string) {
    const set = new Set(d.toolSlugs);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    setD({ ...d, toolSlugs: CREATOR_TOOL_SLUGS.filter((s) => set.has(s)) });
  }

  function move(slug: string, dir: -1 | 1) {
    const i = d.toolSlugs.indexOf(slug);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= d.toolSlugs.length) return;
    const next = [...d.toolSlugs];
    [next[i], next[j]] = [next[j], next[i]];
    setD({ ...d, toolSlugs: next });
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Small caps label"><TextInput value={d.caps ?? ""} onChange={(e) => setD({ ...d, caps: e.target.value })} /></Field>
      <Field label="Heading"><TextInput value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Field>
      <Field label="Subtitle"><TextArea rows={2} value={d.subtitle ?? ""} onChange={(e) => setD({ ...d, subtitle: e.target.value })} /></Field>
      <Field label="Tools to show" help="Check to include. Use arrows to reorder. Tools show in the order listed.">
        <div className="flex flex-col gap-2">
          {CREATOR_TOOL_SLUGS.map((slug) => {
            const tool = CREATOR_TOOL_REGISTRY[slug];
            const checked = d.toolSlugs.includes(slug);
            return (
              <div key={slug} className="flex items-center gap-3 rounded-md border border-wood/10 bg-white p-2">
                <input type="checkbox" checked={checked} onChange={() => toggleTool(slug)} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{tool.name}</div>
                  <div className="text-xs text-wood-light/60">{tool.description}</div>
                </div>
                {checked && (
                  <div className="flex gap-1">
                    <button onClick={() => move(slug, -1)} className="px-2 text-wood-light hover:text-wood" type="button">&uarr;</button>
                    <button onClick={() => move(slug, 1)} className="px-2 text-wood-light hover:text-wood" type="button">&darr;</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Field>
      <SaveBar saving={saving} onSave={() => onSave(d)} />
    </div>
  );
}
