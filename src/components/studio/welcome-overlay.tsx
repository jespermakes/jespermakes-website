"use client";

import { useEffect } from "react";

interface WelcomeOverlayProps {
  onDismiss: () => void;
}

const SHORTCUTS: { key: string; label: string }[] = [
  { key: "R", label: "Draw a rectangle" },
  { key: "C", label: "Draw a circle" },
  { key: "L", label: "Draw a line" },
  { key: "P", label: "Draw with the pen" },
  { key: "T", label: "Place text" },
  { key: "V", label: "Select and move" },
];

export function WelcomeOverlay({ onDismiss }: WelcomeOverlayProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ignore modifier-only keypresses; any actual letter / Enter dismisses.
      if (e.key.length === 1 || e.key === "Enter" || e.key === "Escape") {
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-wood/70 backdrop-blur-sm"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-welcome-title"
    >
      <div
        className="mx-4 max-w-sm rounded-2xl border border-wood/[0.08] bg-cream p-6 text-wood shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="studio-welcome-title"
          className="font-serif text-2xl text-wood"
        >
          Jesper Makes Studio
        </h2>
        <p className="mt-1 text-sm text-wood-light">
          Free 2D design for makers
        </p>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/40">
          Quick start
        </p>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm">
          {SHORTCUTS.map((s) => (
            <li key={s.key} className="flex items-center gap-3">
              <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-wood/20 bg-white/70 px-1 font-mono text-[11px] text-wood">
                {s.key}
              </kbd>
              <span className="text-wood-light">{s.label}</span>
            </li>
          ))}
        </ul>
        <ul className="mt-3 space-y-1 text-[12px] text-wood-light/70">
          <li>Space + drag to pan</li>
          <li>Scroll to zoom</li>
          <li>Right-click for more options</li>
        </ul>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full rounded-xl bg-amber px-4 py-2 text-sm font-medium text-wood shadow-sm transition-colors hover:bg-amber/90"
          style={{ background: "#C17F3C" }}
        >
          Start drawing
        </button>
      </div>
    </div>
  );
}
