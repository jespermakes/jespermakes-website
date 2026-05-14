"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface BottomSheetProps {
  children: ReactNode;
  /** When true, sheet expands to show full content */
  expanded: boolean;
  onToggle: () => void;
  /** Short summary shown in collapsed state */
  peekContent: ReactNode;
}

export function BottomSheet({
  children,
  expanded,
  onToggle,
  peekContent,
}: BottomSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContentHeight(entry.contentRect.height);
    });
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* Backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={onToggle}
          aria-hidden
        />
      )}

      <div
        className="bg-white border-t border-wood/[0.12] rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] transition-[max-height] duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: expanded ? `${contentHeight + 48}px` : "64px",
        }}
      >
        {/* Drag handle + peek bar */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex flex-col items-center px-4 py-3 gap-2"
          aria-label={expanded ? "Collapse controls" : "Expand controls"}
        >
          <div className="w-8 h-1 rounded-full bg-wood/[0.15]" />
          {!expanded && (
            <div className="w-full text-left">{peekContent}</div>
          )}
        </button>

        {/* Full content */}
        <div ref={contentRef} className="px-4 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
