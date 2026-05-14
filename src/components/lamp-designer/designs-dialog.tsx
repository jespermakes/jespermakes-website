"use client";

import { useEffect, useState } from "react";

interface DesignSummary {
  id: string;
  name: string;
  thumbnail: string | null;
  updatedAt: string;
}

interface LampDesignsDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function LampDesignsDialog({
  open,
  onClose,
  onSelect,
}: LampDesignsDialogProps) {
  const [designs, setDesigns] = useState<DesignSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch("/api/lamp-designer/designs")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load designs");
        const json = (await res.json()) as { designs: DesignSummary[] };
        setDesigns(json.designs);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        data-testid="dialog-backdrop"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-wood/[0.08] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-wood">
            Open Design
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-wood-light hover:bg-wood/[0.04]"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M3.5 3.5l9 9m0-9l-9 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        </div>

        {loading && (
          <p className="py-8 text-center text-sm text-wood-light">
            Loading designs&hellip;
          </p>
        )}

        {error && (
          <p className="py-8 text-center text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && designs.length === 0 && (
          <p className="py-8 text-center text-sm text-wood-light">
            No saved designs yet.
          </p>
        )}

        {!loading && !error && designs.length > 0 && (
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {designs.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => onSelect(d.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-cream/60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest/[0.08]">
                    {d.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={d.thumbnail}
                        alt=""
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" className="text-forest/40" aria-hidden>
                        <path d="M12 2L2 19h20L12 2z" fill="currentColor" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-wood">
                      {d.name || "Untitled"}
                    </div>
                    <div className="text-[11px] text-wood-light/60">
                      {relativeTime(d.updatedAt)}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.round(mo / 12);
  return `${yr}y ago`;
}
