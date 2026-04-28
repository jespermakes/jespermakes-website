"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface ContextMenuItem {
  key: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onSelect: () => void;
}

export type ContextMenuItemOrSeparator = ContextMenuItem | { separator: true };

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItemOrSeparator[];
  onClose: () => void;
}

const MENU_PADDING = 6;

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x, y });

  // Reposition once we know the menu size so it doesn't fall off-screen.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { offsetWidth: w, offsetHeight: h } = el;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const px =
      x + w + MENU_PADDING > vw ? Math.max(MENU_PADDING, x - w) : x;
    const py =
      y + h + MENU_PADDING > vh ? Math.max(MENU_PADDING, y - h) : y;
    setPos({ x: px, y: py });
  }, [x, y, items]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => onClose();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    document.addEventListener("wheel", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("wheel", onScroll);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="menu"
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-50 min-w-[200px] rounded-xl border border-wood/[0.08] bg-white py-1 shadow-xl"
    >
      {items.map((it, i) =>
        "separator" in it ? (
          <div
            key={`sep-${i}`}
            className="my-1 h-px bg-wood/[0.06]"
            role="separator"
          />
        ) : (
          <button
            key={it.key}
            type="button"
            role="menuitem"
            disabled={it.disabled}
            onClick={() => {
              if (it.disabled) return;
              it.onSelect();
              onClose();
            }}
            className={`flex w-full items-center justify-between px-4 py-1.5 text-sm transition-colors ${
              it.disabled
                ? "cursor-not-allowed text-wood-light/30"
                : "text-wood hover:bg-wood/[0.04]"
            }`}
          >
            <span>{it.label}</span>
            {it.shortcut ? (
              <span
                className={`ml-6 font-mono text-[11px] ${
                  it.disabled ? "text-wood-light/20" : "text-wood-light/50"
                }`}
              >
                {it.shortcut}
              </span>
            ) : null}
          </button>
        ),
      )}
    </div>
  );
}
