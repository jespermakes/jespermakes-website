"use client";

import Link from "next/link";

interface EmptyCanvasProps {
  onDrawRectangle: () => void;
}

export function EmptyCanvas({ onDrawRectangle }: EmptyCanvasProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="pointer-events-auto flex max-w-md flex-col items-center gap-4 rounded-2xl bg-cream/90 px-8 py-7 text-center shadow-lg ring-1 ring-wood/[0.06] backdrop-blur-sm">
        <div>
          <h2 className="font-serif text-lg text-wood">
            Start by drawing something
          </h2>
          <p className="mt-1 text-sm text-wood-light">
            Draw shapes, import an SVG, or browse the Marketplace for ready-made designs.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onDrawRectangle}
            className="rounded-xl border border-wood/[0.12] bg-white px-4 py-2 text-sm text-wood hover:border-forest/40 hover:bg-cream"
          >
            Draw a rectangle
          </button>
          <Link
            href="/marketplace"
            target="_blank"
            className="rounded-xl border border-wood/[0.12] bg-white px-4 py-2 text-sm text-wood hover:border-forest/40 hover:bg-cream"
          >
            Browse Marketplace
          </Link>
        </div>
        <p className="text-[12px] text-wood-light/60">
          Or drag an SVG file onto the canvas.
        </p>
      </div>
    </div>
  );
}
