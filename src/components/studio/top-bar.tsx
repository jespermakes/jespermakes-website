"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { StudioMode } from "@/lib/studio/types";

export type SaveStatus =
  | "never-saved"
  | "dirty"
  | "saving"
  | "saved"
  | "error";

interface TopBarProps {
  designName: string;
  onRenameCommit: (name: string) => void;
  saveStatus: SaveStatus;
  isLoggedIn: boolean;
  userInitial?: string | null;
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  onSave: () => void;
  onNewDesign: () => void;
  onOpenDesigns: () => void;
}

const MODE_TABS: { mode: StudioMode; label: string; shortcut: string }[] = [
  { mode: "design", label: "Design", shortcut: "1" },
  { mode: "plan", label: "Plan", shortcut: "2" },
  { mode: "review", label: "Review", shortcut: "3" },
];

export function TopBar({
  designName,
  onRenameCommit,
  saveStatus,
  isLoggedIn,
  userInitial,
  mode,
  onModeChange,
  onSave,
  onNewDesign,
  onOpenDesigns,
}: TopBarProps) {
  const [draftName, setDraftName] = useState(designName);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editing) setDraftName(designName);
  }, [designName, editing]);

  const commit = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== designName) {
      onRenameCommit(trimmed);
    } else {
      setDraftName(designName);
    }
    setEditing(false);
  };

  return (
    <div className="flex h-10 shrink-0 items-center gap-3 border-b border-wood/[0.08] bg-white px-3 text-sm text-wood">
      <Link
        href="/"
        className="flex items-center gap-2 font-serif text-wood hover:text-forest"
        aria-label="Back to Jesper Makes"
      >
        <Image
          src="/logo.png"
          alt=""
          width={24}
          height={24}
          className="rounded-full"
        />
      </Link>
      <button
        type="button"
        onClick={onNewDesign}
        className="rounded-md px-2 py-0.5 text-[12px] text-wood-light hover:bg-wood/[0.04]"
        title="New design (Ctrl+N)"
      >
        New
      </button>
      <button
        type="button"
        onClick={onOpenDesigns}
        className="rounded-md px-2 py-0.5 text-[12px] text-wood-light hover:bg-wood/[0.04]"
        title="My designs"
      >
        Open…
      </button>
      <div className="ml-2 flex flex-1 items-center gap-3">
        {editing ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraftName(designName);
                setEditing(false);
              }
            }}
            autoFocus
            className="rounded-md border border-wood/[0.12] bg-white px-2 py-0.5 text-sm focus:border-forest focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="rounded-md px-2 py-0.5 text-sm font-medium text-wood hover:bg-wood/[0.04]"
            title="Rename design"
          >
            {designName}
          </button>
        )}
        <SaveStatusLabel status={saveStatus} isLoggedIn={isLoggedIn} />
      </div>
      <div
        role="tablist"
        aria-label="Studio mode"
        className="mr-2 flex items-center gap-0.5 rounded-md bg-cream/60 p-0.5"
      >
        {MODE_TABS.map((t) => {
          const active = mode === t.mode;
          return (
            <button
              key={t.mode}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onModeChange(t.mode)}
              title={`${t.label} (${t.shortcut})`}
              className={`rounded px-3 py-1 text-[12px] font-medium transition-colors ${
                active
                  ? "bg-wood text-cream shadow-sm"
                  : "text-wood-light hover:text-wood"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onSave}
        className={`rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
          saveStatus === "never-saved" || saveStatus === "dirty"
            ? "bg-wood text-cream hover:bg-wood-light"
            : "border border-wood/[0.12] text-wood-light hover:bg-wood/[0.04]"
        }`}
        title="Save (Ctrl+S)"
      >
        Save
      </button>
      {isLoggedIn ? (
        <span
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-forest/10 text-[12px] font-bold text-forest"
          aria-label="Signed in"
        >
          {userInitial ?? "·"}
        </span>
      ) : (
        <Link
          href="/login?callbackUrl=/studio"
          className="ml-1 text-[12px] text-forest hover:text-forest-dark"
        >
          Sign in to save
        </Link>
      )}
    </div>
  );
}

function SaveStatusLabel({
  status,
  isLoggedIn,
}: {
  status: SaveStatus;
  isLoggedIn: boolean;
}) {
  let text = "";
  let className = "text-wood-light/50";
  switch (status) {
    case "never-saved":
      text = isLoggedIn ? "Not saved yet" : "Local design";
      break;
    case "dirty":
      text = "Unsaved changes";
      className = "text-amber-700";
      break;
    case "saving":
      text = "Saving…";
      break;
    case "saved":
      text = "Saved ✓";
      className = "text-forest";
      break;
    case "error":
      text = "Save failed";
      className = "text-red-600";
      break;
  }
  return <span className={`text-[11px] ${className}`}>{text}</span>;
}
