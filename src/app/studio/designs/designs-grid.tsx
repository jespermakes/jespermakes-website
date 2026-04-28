"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface DesignSummary {
  id: string;
  name: string;
  thumbnail: string | null;
  updatedAt: string;
}

export function DesignsGrid({
  initialDesigns,
}: {
  initialDesigns: DesignSummary[];
}) {
  const router = useRouter();
  const [designs, setDesigns] = useState<DesignSummary[]>(initialDesigns);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Delete this design? This can't be undone.",
      )
    )
      return;
    setPendingId(id);
    try {
      const res = await fetch(`/api/studio/designs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDesigns((d) => d.filter((x) => x.id !== id));
      }
    } finally {
      setPendingId(null);
    }
  };

  const handleRename = async (id: string, currentName: string) => {
    const next = window.prompt("Rename design", currentName);
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === currentName) return;
    setPendingId(id);
    try {
      const res = await fetch(`/api/studio/designs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        setDesigns((d) =>
          d.map((x) => (x.id === id ? { ...x, name: trimmed } : x)),
        );
      }
    } finally {
      setPendingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setPendingId(id);
    try {
      // Fetch full design.
      const loadRes = await fetch(`/api/studio/designs/${id}`);
      if (!loadRes.ok) return;
      const json = (await loadRes.json()) as {
        design: { name: string; data: unknown };
      };
      const copyRes = await fetch("/api/studio/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${json.design.name} (copy)`,
          data: json.design.data,
        }),
      });
      if (copyRes.ok) {
        // Refresh the list — cheap to re-fetch.
        router.refresh();
      }
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-wood">My Designs</h1>
          <p className="mt-1 text-sm text-wood-light">
            Sketches saved to your account.
          </p>
        </div>
        <Link
          href="/studio"
          className="rounded-xl bg-wood px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-wood-light"
        >
          + New Design
        </Link>
      </header>

      {designs.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-wood-light">
            No designs yet. Create your first one.
          </p>
          <Link
            href="/studio"
            className="rounded-xl bg-wood px-5 py-2.5 text-sm font-medium text-cream hover:bg-wood-light"
          >
            + New Design
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {designs.map((d) => (
            <li
              key={d.id}
              className={`group flex flex-col overflow-hidden rounded-xl border border-wood/[0.08] bg-white transition-shadow hover:shadow-md ${
                pendingId === d.id ? "opacity-60" : ""
              }`}
            >
              <Link
                href={`/studio?id=${encodeURIComponent(d.id)}`}
                className="flex aspect-[4/3] items-center justify-center bg-cream/60"
              >
                {d.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.thumbnail}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <PlaceholderThumb />
                )}
              </Link>
              <div className="flex items-start justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/studio?id=${encodeURIComponent(d.id)}`}
                    className="block truncate text-sm font-medium text-wood hover:text-forest"
                    title={d.name}
                  >
                    {d.name || "Untitled"}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-wood-light/60">
                    {relativeTime(d.updatedAt)}
                  </p>
                </div>
                <DesignMenu
                  onRename={() => handleRename(d.id, d.name)}
                  onDuplicate={() => handleDuplicate(d.id)}
                  onDelete={() => handleDelete(d.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DesignMenu({
  onRename,
  onDuplicate,
  onDelete,
}: {
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Design actions"
        className="rounded-md p-1 text-wood-light hover:bg-wood/[0.04]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden
        >
          <circle cx="3.5" cy="8" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="12.5" cy="8" r="1.4" />
        </svg>
      </button>
      {open ? (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-40 mt-1 min-w-[140px] rounded-xl border border-wood/[0.08] bg-white py-1 text-sm text-wood shadow-xl">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onRename();
              }}
              className="block w-full px-3 py-1.5 text-left hover:bg-wood/[0.04]"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDuplicate();
              }}
              className="block w-full px-3 py-1.5 text-left hover:bg-wood/[0.04]"
            >
              Duplicate
            </button>
            <div className="my-1 h-px bg-wood/[0.06]" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="block w-full px-3 py-1.5 text-left text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function PlaceholderThumb() {
  return (
    <svg
      viewBox="0 0 64 48"
      width="40%"
      height="40%"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="text-wood-light/30"
      aria-hidden
    >
      <rect x="6" y="6" width="32" height="22" rx="2" />
      <circle cx="46" cy="24" r="10" />
      <line x1="14" y1="38" x2="58" y2="38" />
    </svg>
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
