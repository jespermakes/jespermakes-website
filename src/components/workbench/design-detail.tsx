"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { downloadDesignFile } from "@/lib/studio/file-format";
import type { StudioDesignFile } from "@/lib/studio/file-format";
import { trackStudio } from "@/lib/studio-track";

export interface WorkbenchDesignDetail {
  id: string;
  name: string;
  description: string;
  authorName: string;
  authorId: string;
  tags: string[];
  category: string;
  thumbnail: string | null;
  data: StudioDesignFile;
  downloadCount: number;
  likeCount: number;
  remixCount: number;
  remixOfId: string | null;
  remixOfName: string | null;
  remixOfAuthorName: string | null;
  publishedAt: string;
}

interface DesignDetailProps {
  design: WorkbenchDesignDetail;
  isLoggedIn: boolean;
  isAuthor: boolean;
  initialLiked: boolean;
}

const STORAGE_KEY = "workbench_open_in_studio";

export function DesignDetail({
  design,
  isLoggedIn,
  isAuthor,
  initialLiked,
}: DesignDetailProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(design.likeCount);
  const [busy, setBusy] = useState(false);

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/workbench/${design.id}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/workbench/designs/${design.id}/like`, {
        method: "POST",
      });
      if (res.ok) {
        const json = (await res.json()) as { liked: boolean; likeCount: number };
        setLiked(json.liked);
        setLikeCount(json.likeCount);
        if (json.liked) {
          trackStudio({
            eventType: "workbench_like",
            designId: design.id,
          });
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const handleOpenInStudio = () => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          designId: design.id,
          name: design.name,
          data: design.data,
          remixOfId: design.id,
        }),
      );
    } catch {
      /* noop */
    }
    router.push("/studio?from=workbench");
  };

  const handleDownload = () => {
    downloadDesignFile(design.data);
    trackStudio({
      eventType: "workbench_download",
      designId: design.id,
      metadata: { format: "jm" },
    });
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove this design from The Workbench?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/workbench/designs/${design.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/workbench");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="grid gap-8 md:grid-cols-[3fr_2fr]">
      <div className="overflow-hidden rounded-2xl border border-wood/[0.08] bg-white">
        <div className="aspect-[4/3] bg-cream/60">
          {design.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={design.thumbnail}
              alt={design.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-wood-light/40">
              No preview
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-serif text-3xl text-wood">{design.name}</h1>
          <p className="mt-1 text-sm text-wood-light">
            by {design.authorName} ·{" "}
            <span className="text-wood-light/70">
              {relativeTime(design.publishedAt)}
            </span>
          </p>
        </div>
        {design.description ? (
          <p className="whitespace-pre-line text-sm text-wood-light">
            {design.description}
          </p>
        ) : null}
        <ul className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <li className="rounded-full bg-forest/[0.08] px-2 py-0.5 font-medium text-forest">
            {design.category}
          </li>
          {design.tags.map((t) => (
            <li
              key={t}
              className="rounded-full bg-cream/70 px-2 py-0.5 text-wood-light/70"
            >
              #{t}
            </li>
          ))}
        </ul>
        <dl className="flex gap-5 text-sm text-wood-light">
          <Stat label="Downloads" value={design.downloadCount} />
          <Stat label="Likes" value={likeCount} />
          {design.remixCount > 0 ? (
            <Stat label="Remixes" value={design.remixCount} />
          ) : null}
          <Stat
            label="Shapes"
            value={Array.isArray(design.data?.shapes) ? design.data.shapes.length : 0}
          />
        </dl>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleLike}
            disabled={busy}
            aria-pressed={liked}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors ${
              liked
                ? "border-red-300 bg-red-50/70 text-red-700"
                : "border-wood/[0.12] bg-white text-wood hover:border-forest/40"
            }`}
          >
            <span aria-hidden>{liked ? "♥" : "♡"}</span>
            {liked ? "Liked" : "Like"}
          </button>
          <button
            type="button"
            onClick={handleOpenInStudio}
            className="rounded-xl bg-wood px-4 py-2 text-sm font-medium text-cream hover:bg-wood-light"
          >
            Open in Studio
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-xl border border-wood/[0.12] bg-white px-4 py-2 text-sm text-wood hover:border-forest/40"
          >
            Download .jm.json
          </button>
        </div>
        {design.remixOfId && design.remixOfName ? (
          <p className="text-[12px] text-wood-light/70">
            Remixed from{" "}
            <Link
              href={`/workbench/${design.remixOfId}`}
              className="font-medium text-wood-light underline hover:text-forest"
            >
              {design.remixOfName}
            </Link>
            {design.remixOfAuthorName
              ? ` by ${design.remixOfAuthorName}`
              : null}
            .
          </p>
        ) : null}
        {isAuthor ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="self-start rounded-xl border border-red-200 bg-red-50/70 px-4 py-1.5 text-[12px] text-red-700 hover:border-red-400"
          >
            Remove from Workbench
          </button>
        ) : isLoggedIn ? (
          <ReportLink designId={design.id} />
        ) : null}
        <p className="mt-4 border-t border-wood/[0.06] pt-3 text-[11px] text-wood-light/60">
          Designs on The Workbench are shared under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-wood"
          >
            CC BY 4.0
          </a>
          . Free to use and modify with attribution.
        </p>
      </div>
    </article>
  );
}

function ReportLink({ designId }: { designId: string }) {
  const [done, setDone] = useState(false);
  const submit = async () => {
    const reason = window.prompt(
      "Why are you reporting this design? (spam / inappropriate / copyright / other)",
      "other",
    );
    if (reason == null) return;
    const res = await fetch(`/api/workbench/designs/${designId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason.trim().toLowerCase() || "other" }),
    });
    if (res.ok) setDone(true);
  };
  if (done) {
    return (
      <p className="text-[11px] text-wood-light/70">
        Thanks — we&apos;ll review it.
      </p>
    );
  }
  return (
    <button
      type="button"
      onClick={submit}
      className="self-start text-[11px] text-wood-light/60 underline hover:text-red-700"
    >
      Report this design
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <dd className="font-mono text-base text-wood">{value}</dd>
      <dt className="text-[11px] uppercase tracking-wide text-wood-light/60">
        {label}
      </dt>
    </div>
  );
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const min = Math.round(diff / 60_000);
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
