"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface NotificationRow {
  id: string;
  type: string;
  message: string;
  designId: string | null;
  commentId: string | null;
  actorId: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsBellProps {
  hasSession: boolean;
}

export function NotificationsBell({ hasSession }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Light unread polling every 60s.
  useEffect(() => {
    if (!hasSession) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const res = await fetch("/api/notifications?unread=1&limit=1");
        if (!res.ok) return;
        const json = (await res.json()) as { notifications: NotificationRow[] };
        if (cancelled) return;
        setUnreadCount(json.notifications?.length ?? 0);
      } catch {
        /* noop */
      }
    };
    refresh();
    const t = setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [hasSession]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const openPanel = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (res.ok) {
        const json = (await res.json()) as { notifications: NotificationRow[] };
        setItems(json.notifications ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read", { method: "PATCH" });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const onItemClick = async (n: NotificationRow) => {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch(
        () => {},
      );
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
  };

  if (!hasSession) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-wood-light hover:text-forest"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-wood/[0.08] bg-white shadow-xl"
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/40">
              Notifications
            </span>
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] text-wood-light hover:text-forest"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-3 text-sm text-wood-light/60">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-wood-light/60">
                You&apos;re all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-wood/[0.05]">
                {items.map((n) => {
                  const href =
                    n.designId
                      ? `/workbench/${n.designId}`
                      : n.actorId
                        ? `/profile/${n.actorId}`
                        : "/account/notifications";
                  return (
                    <li key={n.id}>
                      <Link
                        href={href}
                        onClick={() => void onItemClick(n)}
                        className={`block px-4 py-2 text-sm hover:bg-wood/[0.04] ${
                          n.read ? "text-wood-light" : "text-wood font-medium"
                        }`}
                      >
                        {n.message}
                        <span className="mt-0.5 block text-[10px] text-wood-light/50">
                          {relativeTime(n.createdAt)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="border-t border-wood/[0.06] px-4 py-2 text-right">
            <Link
              href="/account/notifications"
              onClick={() => setOpen(false)}
              className="text-[11px] text-wood-light hover:text-forest"
            >
              See all →
            </Link>
          </div>
        </div>
      ) : null}
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
  return `${day}d ago`;
}
