"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
} from "react";

interface RichTooltipProps {
  title: string;
  shortcut?: string;
  description: string;
  tip?: string;
  /**
   * The trigger element. Must be a single React element that accepts
   * onMouseEnter / onMouseLeave / onFocus / onBlur. The wrapper preserves
   * any existing handlers.
   */
  children: ReactElement;
}

const SHOW_DELAY_MS = 500;

interface TriggerHandlers {
  onMouseEnter?: (e: ReactMouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: ReactMouseEvent<HTMLElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function RichTooltip({
  title,
  shortcut,
  description,
  tip,
  children,
}: RichTooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, []);

  const showAfterDelay = () => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    showTimerRef.current = setTimeout(() => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({ x: rect.right + 8, y: rect.top + rect.height / 2 });
      setOpen(true);
    }, SHOW_DELAY_MS);
  };

  const hide = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    setOpen(false);
  };

  // Reposition once we know the rendered tooltip size so it doesn't fall off
  // the right edge or below the bottom of the viewport.
  useLayoutEffect(() => {
    if (!open || !pos) return;
    const tip = tooltipRef.current;
    if (!tip) return;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = pos.x;
    let y = pos.y - h / 2;
    if (x + w + 8 > vw) {
      const trigger = triggerRef.current;
      if (trigger) {
        const r = trigger.getBoundingClientRect();
        x = Math.max(8, r.left - 8 - w);
      }
    }
    if (y < 8) y = 8;
    if (y + h + 8 > vh) y = vh - h - 8;
    if (x !== pos.x || y !== pos.y - h / 2) {
      setPos({ x, y: y + h / 2 });
    }
    // We deliberately update pos to the final corrected coordinates; the
    // dependency-array linter would flag pos but adding it loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!isValidElement(children)) {
    return children;
  }

  const childProps =
    (children as ReactElement<TriggerHandlers>).props ?? {};
  const cloned = cloneElement(children as ReactElement<TriggerHandlers>, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
    },
    onMouseEnter: (e: ReactMouseEvent<HTMLElement>) => {
      childProps.onMouseEnter?.(e);
      showAfterDelay();
    },
    onMouseLeave: (e: ReactMouseEvent<HTMLElement>) => {
      childProps.onMouseLeave?.(e);
      hide();
    },
    onFocus: () => {
      childProps.onFocus?.();
      showAfterDelay();
    },
    onBlur: () => {
      childProps.onBlur?.();
      hide();
    },
  } as TriggerHandlers & { ref: (node: HTMLElement | null) => void });

  return (
    <>
      {cloned}
      {open && pos ? (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            transform: "translateY(-50%)",
            zIndex: 60,
            maxWidth: 240,
            pointerEvents: "none",
          }}
          className="rounded-xl bg-wood p-4 text-sm text-cream shadow-2xl"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-semibold text-cream">{title}</span>
            {shortcut ? (
              <kbd className="rounded bg-cream/10 px-1.5 py-0.5 font-mono text-[11px] text-cream/70">
                {shortcut}
              </kbd>
            ) : null}
          </div>
          <p className="mt-1.5 leading-snug text-cream/80">{description}</p>
          {tip ? (
            <p className="mt-2 border-t border-cream/15 pt-2 text-[12px] leading-snug text-cream/60">
              <span className="font-semibold text-cream/70">Tip: </span>
              {tip}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
