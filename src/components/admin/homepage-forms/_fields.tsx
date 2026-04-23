"use client";
import { ReactNode } from "react";

export function Field({ label, children, help }: { label: string; children: ReactNode; help?: string }) {
  return (
    <label className="block">
      <div className="text-[10px] font-bold tracking-[0.1em] text-wood-light uppercase">{label}</div>
      <div className="mt-1.5">{children}</div>
      {help && <div className="mt-1 text-xs text-wood-light/60">{help}</div>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-md border border-wood/15 bg-white px-3 py-2 text-sm text-wood focus:border-forest focus:outline-none " +
        (props.className ?? "")
      }
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-md border border-wood/15 bg-white px-3 py-2 text-sm text-wood focus:border-forest focus:outline-none " +
        (props.className ?? "")
      }
    />
  );
}

export function SaveBar({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-md bg-wood px-4 py-2 text-sm font-semibold text-cream hover:bg-wood/90 disabled:opacity-50"
        type="button"
      >
        {saving ? "Saving\u2026" : "Save changes"}
      </button>
    </div>
  );
}
