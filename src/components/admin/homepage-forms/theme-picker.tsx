"use client";
import { THEME_OPTIONS, type ModuleTheme } from "@/lib/homepage/themes";

interface Props {
  value: ModuleTheme | undefined;
  onChange: (t: ModuleTheme) => void;
}

export default function ThemePicker({ value, onChange }: Props) {
  const selected = value ?? "default";

  return (
    <div>
      <div className="text-[10px] font-bold tracking-[0.1em] text-wood-light uppercase">Background</div>
      <div className="mt-2 flex flex-wrap gap-3">
        {THEME_OPTIONS.map((opt) => {
          const active = opt.value === selected;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={
                "flex flex-col items-center gap-1.5 rounded-lg p-1.5 transition-all " +
                (active ? "ring-2 ring-forest" : "ring-1 ring-wood/10 hover:ring-wood/30")
              }
              aria-label={opt.label}
              aria-pressed={active}
            >
              <div
                className="h-11 w-11 rounded-md border border-wood/10"
                style={
                  opt.swatch === "default"
                    ? {
                        background:
                          "repeating-linear-gradient(45deg, #FAF7F2 0 4px, #E8E2D6 4px 8px)",
                      }
                    : { background: opt.swatch }
                }
                aria-hidden
              />
              <span className="text-[11px] font-medium text-wood-light">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-wood-light/60">
        Default uses the module&apos;s designed background. Dark themes automatically flip text to cream for legibility.
      </p>
    </div>
  );
}
