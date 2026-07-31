"use client";

import type { ArchetypeId, TemplateId } from "@/lib/lamp-designer/types";
import { TEMPLATES } from "@/lib/lamp-designer/templates";

export interface FormSelection {
  archetype: ArchetypeId;
  templateId: TemplateId;
}

export interface FormStepProps {
  archetype: ArchetypeId;
  templateId: TemplateId;
  onSelect: (selection: FormSelection) => void;
}

const TEMPLATE_ICONS: Record<TemplateId, React.ReactNode> = {
  cone: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M24 8L10 40h28L24 8z" />
    </svg>
  ),
  dome: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M8 40a16 16 0 0 1 32 0" />
      <line x1="8" y1="40" x2="40" y2="40" />
    </svg>
  ),
  cylinder: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="12" y="8" width="24" height="32" rx="2" />
    </svg>
  ),
};

const MOON_ICON = (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <circle cx="24" cy="24" r="16" />
    <circle cx="18" cy="18" r="3" />
    <circle cx="28" cy="28" r="4" />
    <circle cx="31" cy="16" r="2" />
  </svg>
);

export function FormStep({ archetype, templateId, onSelect }: FormStepProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-wood mb-1">
        Pick a starting form
      </h2>
      <p className="text-sm text-wood/60 mb-5">
        Choose a base shape to begin with. You can fine-tune proportions in the
        next step.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {TEMPLATES.map((template) => {
          const isSelected = archetype === "vase" && templateId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect({ archetype: "vase", templateId: template.id })}
              aria-pressed={isSelected}
              className={[
                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-forest bg-forest/5 text-forest"
                  : "border-wood/15 bg-white hover:border-wood/30 text-wood/70 hover:text-wood",
              ].join(" ")}
            >
              <span className={["shrink-0", isSelected ? "text-forest" : "text-wood/50"].join(" ")}>
                {TEMPLATE_ICONS[template.id]}
              </span>
              <div>
                <span className="text-sm font-medium leading-tight block">
                  {template.name}
                </span>
                <span className="text-xs leading-snug opacity-70">
                  {template.description}
                </span>
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onSelect({ archetype: "moon", templateId })}
          aria-pressed={archetype === "moon"}
          className={[
            "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
            archetype === "moon"
              ? "border-forest bg-forest/5 text-forest"
              : "border-wood/15 bg-white hover:border-wood/30 text-wood/70 hover:text-wood",
          ].join(" ")}
        >
          <span className={["shrink-0", archetype === "moon" ? "text-forest" : "text-wood/50"].join(" ")}>
            {MOON_ICON}
          </span>
          <div>
            <span className="text-sm font-medium leading-tight block">Moon</span>
            <span className="text-xs leading-snug opacity-70">
              A lithophane sphere of the real lunar surface (NASA elevation
              data). Lit from inside, the moon appears.
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
