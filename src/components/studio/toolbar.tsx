"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Tool } from "@/lib/studio/types";
import {
  PROFILE_LABELS,
  type ExportProfile,
} from "@/lib/studio/export-profiles";

interface ToolbarProps {
  activeTool: Tool;
  /**
   * When true, all drawing tool buttons render grayed-out and are not
   * clickable. Used for Plan and Review modes.
   */
  drawingDisabled?: boolean;
  onSelectTool: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportProfile: (profile: ExportProfile) => void;
  onSaveToFile: () => void;
  onImport: () => void;
  onBooleanUnion: () => void;
  onBooleanDifference: () => void;
  onBooleanIntersection: () => void;
  onShowHelp: () => void;
  canBoolean: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

interface ToolDef {
  tool: Tool;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const TOOLS: ToolDef[] = [
  {
    tool: "select",
    label: "Select",
    shortcut: "V",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <path
          d="M3 2 L3 13 L6 10 L8 14 L10 13 L8 9 L13 9 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="0.5"
        />
      </svg>
    ),
  },
  {
    tool: "pen",
    label: "Pen",
    shortcut: "P",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <path
          d="M2 14 C 5 12 9 4 14 2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="2" cy="14" r="1.4" fill="currentColor" />
        <circle cx="14" cy="2" r="1.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    tool: "rectangle",
    label: "Rectangle",
    shortcut: "R",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <rect
          x="2.5"
          y="3.5"
          width="11"
          height="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
  {
    tool: "circle",
    label: "Circle",
    shortcut: "C",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <circle
          cx="8"
          cy="8"
          r="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
  {
    tool: "line",
    label: "Line",
    shortcut: "L",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <line
          x1="3"
          y1="13"
          x2="13"
          y2="3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    tool: "arc",
    label: "Arc",
    shortcut: "A",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <path
          d="M3 12 A 7 7 0 0 1 13 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    tool: "polygon",
    label: "Polygon",
    shortcut: "G",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <polygon
          points="8,2 13.6,5.5 13.6,11.5 8,15 2.4,11.5 2.4,5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    tool: "text",
    label: "Text",
    shortcut: "T",
    icon: (
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <text
          x="8"
          y="11.5"
          fontSize="11"
          fontFamily="Inter, sans-serif"
          fontWeight="600"
          textAnchor="middle"
          fill="currentColor"
        >
          A
        </text>
      </svg>
    ),
  },
];

function ToolButton({
  active,
  disabled,
  label,
  shortcut,
  showBadge,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  shortcut?: string;
  /** Render the shortcut letter as a small persistent badge. */
  showBadge?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={shortcut ? `${label} (${shortcut})` : label}
      className={[
        "group relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
        active ? "bg-white/20 text-cream" : "text-cream/80 hover:bg-white/10 hover:text-cream",
        disabled ? "opacity-30 cursor-not-allowed hover:bg-transparent" : "",
      ].join(" ")}
    >
      {children}
      {showBadge && shortcut ? (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0.5 right-0.5 flex h-3 min-w-[12px] items-center justify-center rounded-sm bg-white/15 px-0.5 font-mono text-[8px] leading-none text-cream/70"
        >
          {shortcut}
        </span>
      ) : null}
      <span
        className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-wood-light px-2 py-1 text-[11px] font-medium text-cream opacity-0 shadow-md transition-opacity group-hover:opacity-100"
        role="tooltip"
      >
        {label}
        {shortcut ? (
          <span className="ml-2 opacity-60">{shortcut}</span>
        ) : null}
      </span>
    </button>
  );
}

function Separator() {
  return <div className="my-1 h-px w-6 bg-cream/15" />;
}

const PROFILE_ORDER: ExportProfile[] = [
  "generic",
  "shaper-origin",
  "laser",
  "cnc-router",
];

function ExportButton({
  onExportProfile,
  onSaveToFile,
}: {
  onExportProfile: (p: ExportProfile) => void;
  onSaveToFile: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <ToolButton label="Export" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path
            d="M8 2 L8 10 M5 7 L8 10 L11 7"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 12 L13 12 L13 14 L3 14 Z"
            fill="currentColor"
          />
        </svg>
      </ToolButton>
      {open ? (
        <div
          role="menu"
          className="absolute left-12 bottom-0 z-40 min-w-[200px] rounded-xl border border-wood/[0.08] bg-white py-1 text-sm text-wood shadow-xl"
        >
          <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/40">
            Export as…
          </div>
          {PROFILE_ORDER.map((p) => (
            <button
              key={p}
              type="button"
              role="menuitem"
              onClick={() => {
                onExportProfile(p);
                setOpen(false);
              }}
              className="block w-full px-4 py-1.5 text-left transition-colors hover:bg-wood/[0.04]"
            >
              {PROFILE_LABELS[p]}
            </button>
          ))}
          <div className="my-1 h-px bg-wood/[0.06]" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onSaveToFile();
              setOpen(false);
            }}
            className="block w-full px-4 py-1.5 text-left transition-colors hover:bg-wood/[0.04]"
          >
            Save to file (.jm)
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function Toolbar({
  activeTool,
  drawingDisabled,
  onSelectTool,
  onUndo,
  onRedo,
  onExportProfile,
  onSaveToFile,
  onImport,
  onBooleanUnion,
  onBooleanDifference,
  onBooleanIntersection,
  onShowHelp,
  canBoolean,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div className="flex h-full w-12 flex-col items-center gap-1 overflow-y-auto rounded-r-xl bg-wood py-3 text-cream">
      <Link
        href="/"
        aria-label="Back to Jesper Makes"
        className="group relative mb-1 flex h-9 w-9 items-center justify-center rounded-lg text-cream/80 transition-colors hover:bg-white/10 hover:text-cream"
      >
        <span className="font-serif text-lg leading-none">JM</span>
        <span
          className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-wood-light px-2 py-1 text-[11px] font-medium text-cream opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          role="tooltip"
        >
          Jesper Makes
        </span>
      </Link>
      <Separator />
      {TOOLS.map((t) => {
        const isSelect = t.tool === "select";
        const disabled = drawingDisabled && !isSelect;
        return (
          <ToolButton
            key={t.tool}
            active={activeTool === t.tool}
            label={t.label}
            shortcut={t.shortcut}
            showBadge
            disabled={disabled}
            onClick={() => onSelectTool(t.tool)}
          >
            {t.icon}
          </ToolButton>
        );
      })}
      <Separator />
      <ToolButton
        label="Union"
        disabled={!canBoolean}
        onClick={onBooleanUnion}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path
            d="M3 6 A 3 3 0 1 0 9 6 A 3 3 0 1 0 3 6 M7 10 A 3 3 0 1 0 13 10 A 3 3 0 1 0 7 10"
            fill="currentColor"
            fillRule="evenodd"
            opacity={0.3}
          />
          <path
            d="M3 6 A 3 3 0 1 1 9 6 A 3 3 0 1 1 3 6 Z M7 10 A 3 3 0 1 1 13 10 A 3 3 0 1 1 7 10 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      </ToolButton>
      <ToolButton
        label="Difference"
        disabled={!canBoolean}
        onClick={onBooleanDifference}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <defs>
            <mask id="diff-mask">
              <rect width="16" height="16" fill="white" />
              <circle cx="10" cy="10" r="3" fill="black" />
            </mask>
          </defs>
          <circle
            cx="6"
            cy="6"
            r="3"
            fill="currentColor"
            fillOpacity={0.45}
            mask="url(#diff-mask)"
          />
          <circle
            cx="6"
            cy="6"
            r="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle
            cx="10"
            cy="10"
            r="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
          />
        </svg>
      </ToolButton>
      <ToolButton
        label="Intersection"
        disabled={!canBoolean}
        onClick={onBooleanIntersection}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <defs>
            <clipPath id="int-clip-a">
              <circle cx="6" cy="8" r="3.4" />
            </clipPath>
          </defs>
          <circle
            cx="10"
            cy="8"
            r="3.4"
            fill="currentColor"
            fillOpacity={0.5}
            clipPath="url(#int-clip-a)"
          />
          <circle
            cx="6"
            cy="8"
            r="3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle
            cx="10"
            cy="8"
            r="3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      </ToolButton>
      <Separator />
      <ToolButton
        label="Undo"
        shortcut="Ctrl+Z"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path
            d="M3 7 L6 4 L6 6 C 9.5 6 12 8 12 11 L 10 11 C 10 9 8.5 8 6 8 L 6 10 Z"
            fill="currentColor"
          />
        </svg>
      </ToolButton>
      <ToolButton
        label="Redo"
        shortcut="Ctrl+Shift+Z"
        disabled={!canRedo}
        onClick={onRedo}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path
            d="M13 7 L10 4 L10 6 C 6.5 6 4 8 4 11 L 6 11 C 6 9 7.5 8 10 8 L 10 10 Z"
            fill="currentColor"
          />
        </svg>
      </ToolButton>
      <div className="flex-1" />
      <ToolButton label="Import SVG" onClick={onImport}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <path
            d="M8 14 L8 6 M5 9 L8 6 L11 9"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M3 2 L13 2 L13 4 L3 4 Z" fill="currentColor" />
        </svg>
      </ToolButton>
      <ExportButton
        onExportProfile={onExportProfile}
        onSaveToFile={onSaveToFile}
      />
      <ToolButton label="Help" shortcut="?" onClick={onShowHelp}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
          <text
            x="8"
            y="11.5"
            fontSize="11"
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            textAnchor="middle"
            fill="currentColor"
          >
            ?
          </text>
        </svg>
      </ToolButton>
    </div>
  );
}
