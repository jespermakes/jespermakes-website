"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
}

export function FollowButton({ userId, initialFollowing }: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/follows/${userId}`, { method: "POST" });
      if (res.status === 401) {
        router.push(`/login?callbackUrl=/profile/${userId}`);
        return;
      }
      if (res.ok) {
        const json = (await res.json()) as { following: boolean };
        setFollowing(json.following);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={following}
      className={`rounded-xl border px-4 py-1.5 text-[12px] font-medium transition-colors ${
        following
          ? "border-wood/[0.12] bg-white text-wood-light hover:border-red-300 hover:text-red-700"
          : "border-wood bg-wood text-cream hover:bg-wood-light"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
