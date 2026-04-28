"use client";

import { useEffect, useState } from "react";
import type { StudioMode } from "@/lib/studio/types";

interface ModeGuideProps {
  mode: StudioMode;
}

interface GuideContent {
  title: string;
  body: string;
}

const COPY: Record<Exclude<StudioMode, "design">, GuideContent> = {
  plan: {
    title: "Plan Mode",
    body:
      "Assign how each shape will be cut. Click a shape, then choose a cut type. Shapes are colour-coded by their assignment.",
  },
  review: {
    title: "Review Mode",
    body:
      "Check your design before cutting. The preview shows what the result will look like. Fix any warnings before exporting.",
  },
};

function storageKey(mode: StudioMode): string {
  return `studio_mode_guide_${mode}_seen`;
}

/**
 * Inline guide rendered above the right-side panel on the first visit
 * to Plan or Review mode (per browser, via localStorage). Dismiss
 * marks the mode as seen.
 */
export function ModeGuide({ mode }: ModeGuideProps) {
  const [shouldShow, setShouldShow] = useState(false);
  useEffect(() => {
    if (mode === "design") {
      setShouldShow(false);
      return;
    }
    if (typeof window === "undefined") return;
    try {
      const seen = localStorage.getItem(storageKey(mode));
      setShouldShow(!seen);
    } catch {
      setShouldShow(false);
    }
  }, [mode]);

  if (!shouldShow || mode === "design") return null;
  const copy = COPY[mode];

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey(mode), "1");
    } catch {
      /* noop */
    }
    setShouldShow(false);
  };

  return (
    <div className="mx-3 mb-3 mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-sm text-wood">
      <div className="font-semibold">{copy.title}</div>
      <p className="mt-1 text-[12px] leading-snug text-wood-light">
        {copy.body}
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="mt-2 rounded-md bg-wood px-3 py-1 text-[11px] font-medium text-cream hover:bg-wood-light"
      >
        Got it
      </button>
    </div>
  );
}
