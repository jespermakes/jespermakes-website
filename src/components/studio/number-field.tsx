"use client";

import { useEffect, useRef, useState } from "react";

interface NumberFieldProps {
  label?: string;
  value: number;
  onCommit: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  format: (v: number) => string;
  parse: (raw: string) => number;
  className?: string;
}

export function NumberField({
  label,
  value,
  onCommit,
  step,
  min,
  max,
  suffix,
  format,
  parse,
  className = "",
}: NumberFieldProps) {
  const [text, setText] = useState(() => format(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) setText(format(value));
  }, [value, format]);

  const commit = () => {
    const parsed = parse(text);
    if (Number.isNaN(parsed)) {
      setText(format(value));
      return;
    }
    let v = parsed;
    if (typeof min === "number") v = Math.max(min, v);
    if (typeof max === "number") v = Math.min(max, v);
    if (v !== value) onCommit(v);
    setText(format(v));
  };

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      {label ? (
        <span className="w-6 text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/40">
          {label}
        </span>
      ) : null}
      <div className="relative flex-1">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => {
            focusedRef.current = true;
          }}
          onBlur={() => {
            focusedRef.current = false;
            commit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            } else if (e.key === "Escape") {
              setText(format(value));
              focusedRef.current = false;
              (e.target as HTMLInputElement).blur();
            }
          }}
          step={step}
          className="w-full rounded-xl border border-wood/[0.12] bg-white/70 px-3 py-1.5 text-sm text-wood focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-wood-light/50">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}
