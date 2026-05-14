"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type SaveStatus =
  | "never-saved"
  | "dirty"
  | "saving"
  | "saved"
  | "error";

interface LampDesignerTopBarProps {
  designName: string;
  onRenameCommit: (name: string) => void;
  saveStatus: SaveStatus;
  isLoggedIn: boolean;
  userInitial?: string | null;
  onSave: () => void;
  onNewDesign: () => void;
  onOpenDesigns: () => void;
}

export function LampDesignerTopBar({
  designName,
  onRenameCommit,
  saveStatus,
  isLoggedIn,
  userInitial,
  onSave,
  onNewDesign,
  onOpenDesigns,
}: LampDesignerTopBarProps) {
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
        className="flex items-center gap-2 text-wood hover:text-forest"
        aria-label="Back to Jesper Makes"
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className="shrink-0">
          <path d="M1 15V1h3v14H1Zm5-3V1h3v11H6Zm5-3V1h3v8h-3Z" fill="currentColor" opacity="0.7" />
          <path d="M0 14.5h16" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        </svg>
        <span className="text-[12px] font-semibold tracking-tight whitespace-nowrap">Cone Lamp Designer</span>
      </Link>

      <button
        type="button"
        onClick={onNewDesign}
        className="rounded-md px-2 py-0.5 text-[12px] text-wood-light hover:bg-wood/[0.04]"
        title="New design"
      >
        New
      </button>
      <button
        type="button"
        onClick={onOpenDesigns}
        className="rounded-md px-2 py-0.5 text-[12px] text-wood-light hover:bg-wood/[0.04]"
        title="Open saved design"
      >
        Open&hellip;
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
          {userInitial ?? "\u00B7"}
        </span>
      ) : (
        <Link
          href="/login?callbackUrl=/cone-lamp"
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
      text = "Saving\u2026";
      break;
    case "saved":
      text = "Saved";
      className = "text-forest";
      break;
    case "error":
      text = "Save failed";
      className = "text-red-600";
      break;
  }
  return <span className={`text-[11px] ${className}`}>{text}</span>;
}
