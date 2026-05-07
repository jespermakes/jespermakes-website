"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface CommentRow {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  parentId: string | null;
  createdAt: string;
}

interface CommentsSectionProps {
  designId: string;
  isLoggedIn: boolean;
  currentUserId: string | null;
}

export function CommentsSection({
  designId,
  isLoggedIn,
  currentUserId,
}: CommentsSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [replyParent, setReplyParent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/workbench/designs/${designId}/comments`,
        );
        if (!res.ok) return;
        const json = (await res.json()) as { comments: CommentRow[] };
        if (!cancelled) setComments(json.comments ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [designId]);

  const tree = useMemo(() => buildTree(comments), [comments]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/workbench/${designId}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/workbench/designs/${designId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, parentId: replyParent }),
        },
      );
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(json?.error ?? "Couldn't post comment.");
        return;
      }
      const json = (await res.json()) as { comment: CommentRow };
      setComments((prev) => [...prev, json.comment]);
      setDraft("");
      setReplyParent(null);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`/api/workbench/comments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      /* noop */
    }
  };

  const total = comments.length;
  return (
    <section className="mt-12 border-t border-wood/[0.06] pt-8">
      <h2 className="font-serif text-xl text-wood">
        Comments {total > 0 ? `(${total})` : ""}
      </h2>
      {loading ? (
        <p className="mt-4 text-sm text-wood-light/60">Loading…</p>
      ) : tree.length === 0 ? (
        <p className="mt-4 text-sm text-wood-light/60">
          No comments yet. Be the first.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-5">
          {tree.map((c) => (
            <li key={c.row.id}>
              <Comment
                row={c.row}
                replies={c.replies}
                isOwner={c.row.authorId === currentUserId}
                ownerOf={(id) =>
                  comments.find((x) => x.id === id)?.authorId ===
                  currentUserId
                }
                onReply={(id) => {
                  setReplyParent(id);
                  setDraft("");
                }}
                onDelete={remove}
              />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 flex flex-col gap-2">
        {replyParent ? (
          <p className="text-[12px] text-wood-light/70">
            Replying to a comment.{" "}
            <button
              type="button"
              onClick={() => setReplyParent(null)}
              className="underline hover:text-wood"
            >
              Cancel
            </button>
          </p>
        ) : null}
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            isLoggedIn
              ? "Write a comment…"
              : "Sign in to leave a comment."
          }
          rows={3}
          maxLength={2000}
          disabled={!isLoggedIn || busy}
          className="w-full rounded-md border border-wood/[0.12] bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30 disabled:opacity-60"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-wood-light/60">
            {draft.length}/2000
          </span>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !draft.trim() || !isLoggedIn}
            className="rounded-xl bg-wood px-4 py-1.5 text-sm font-medium text-cream hover:bg-wood-light disabled:opacity-60"
          >
            {busy ? "Posting…" : replyParent ? "Reply" : "Post"}
          </button>
        </div>
        {error ? (
          <p className="text-[12px] text-red-700">{error}</p>
        ) : null}
        {!isLoggedIn ? (
          <p className="text-[11px] text-wood-light/60">
            <Link
              href={`/login?callbackUrl=/workbench/${designId}`}
              className="underline hover:text-wood"
            >
              Sign in
            </Link>{" "}
            to leave a comment.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Comment({
  row,
  replies,
  isOwner,
  ownerOf,
  onReply,
  onDelete,
}: {
  row: CommentRow;
  replies: CommentRow[];
  isOwner: boolean;
  ownerOf: (id: string) => boolean;
  onReply: (parentId: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <CommentBody row={row} isOwner={isOwner} onReply={onReply} onDelete={onDelete} />
      {replies.length > 0 ? (
        <ul className="mt-3 ml-6 flex flex-col gap-3 border-l border-wood/[0.08] pl-4">
          {replies.map((r) => (
            <li key={r.id}>
              <CommentBody
                row={r}
                isOwner={ownerOf(r.id)}
                onReply={onReply}
                onDelete={onDelete}
                isReply
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CommentBody({
  row,
  isOwner,
  onReply,
  onDelete,
  isReply,
}: {
  row: CommentRow;
  isOwner: boolean;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  isReply?: boolean;
}) {
  return (
    <div>
      <p className="text-[13px] text-wood-light/80">
        <Link
          href={`/profile/${row.authorId}`}
          className="font-medium text-wood hover:text-forest"
        >
          {row.authorName}
        </Link>{" "}
        · <span>{relativeTime(row.createdAt)}</span>
      </p>
      <p className="mt-1 whitespace-pre-line text-sm text-wood">
        {row.content}
      </p>
      <div className="mt-1.5 flex gap-3 text-[11px] text-wood-light/60">
        {!isReply ? (
          <button
            type="button"
            onClick={() => onReply(row.id)}
            className="hover:text-wood"
          >
            Reply
          </button>
        ) : null}
        {isOwner ? (
          <button
            type="button"
            onClick={() => onDelete(row.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}

function buildTree(rows: CommentRow[]) {
  const top = rows.filter((c) => !c.parentId);
  return top.map((row) => ({
    row,
    replies: rows
      .filter((c) => c.parentId === row.id)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
  }));
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
