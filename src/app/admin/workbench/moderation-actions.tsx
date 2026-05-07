"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ModerationActionsProps {
  designId: string;
}

export function ModerationActions({ designId }: ModerationActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const act = async (action: "approve" | "remove" | "ban_author") => {
    if (busy) return;
    if (
      action === "ban_author" &&
      !window.confirm(
        "Remove every design from this author? This is hard to undo.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/workbench/${designId}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => act("approve")}
        disabled={busy}
        className="rounded-md border border-forest/40 bg-forest/[0.06] px-3 py-1 text-[12px] text-forest hover:bg-forest/[0.12]"
      >
        Approve
      </button>
      <button
        type="button"
        onClick={() => act("remove")}
        disabled={busy}
        className="rounded-md border border-red-200 bg-red-50/70 px-3 py-1 text-[12px] text-red-700 hover:border-red-400"
      >
        Remove
      </button>
      <button
        type="button"
        onClick={() => act("ban_author")}
        disabled={busy}
        className="rounded-md border border-red-300 bg-red-100/70 px-3 py-1 text-[12px] text-red-800 hover:border-red-500"
      >
        Ban author
      </button>
    </div>
  );
}
