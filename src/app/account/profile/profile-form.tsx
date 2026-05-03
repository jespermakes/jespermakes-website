"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Initial {
  displayName: string;
  bio: string;
  avatarUrl: string;
  website: string;
  location: string;
}

interface ProfileFormProps {
  initial: Initial;
  userId: string;
}

export function ProfileForm({ initial, userId }: ProfileFormProps) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const update = (k: keyof Initial, v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setStatus("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.displayName,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          website: data.website,
          location: data.location,
        }),
      });
      if (res.ok) {
        setStatus("saved");
        router.refresh();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <Field label="Display name" hint="The name shown publicly. Defaults to your account name.">
        <input
          type="text"
          value={data.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          placeholder="WoodworkingDave"
          className="w-full rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
          maxLength={80}
        />
      </Field>
      <Field label="Bio" hint="A short blurb. Up to 500 characters.">
        <textarea
          value={data.bio}
          onChange={(e) => update("bio", e.target.value)}
          rows={4}
          maxLength={500}
          className="w-full rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
        />
        <span className="text-[11px] text-wood-light/50">
          {data.bio.length}/500
        </span>
      </Field>
      <Field label="Avatar URL" hint="Link to a square image. Custom upload coming later.">
        <input
          type="url"
          value={data.avatarUrl}
          onChange={(e) => update("avatarUrl", e.target.value)}
          placeholder="https://…"
          className="w-full rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
          maxLength={200}
        />
      </Field>
      <Field label="Website">
        <input
          type="url"
          value={data.website}
          onChange={(e) => update("website", e.target.value)}
          placeholder="https://yourshop.com"
          className="w-full rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
          maxLength={200}
        />
      </Field>
      <Field label="Location">
        <input
          type="text"
          value={data.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="Århus, Denmark"
          className="w-full rounded-md border border-wood/[0.12] bg-white px-3 py-1.5 text-sm focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest/30"
          maxLength={80}
        />
      </Field>
      <div className="flex items-center justify-between">
        <Link
          href={`/profile/${userId}`}
          className="text-sm text-wood-light underline hover:text-forest"
        >
          View public profile →
        </Link>
        <div className="flex items-center gap-3">
          {status === "saved" ? (
            <span className="text-sm text-forest">Saved ✓</span>
          ) : status === "error" ? (
            <span className="text-sm text-red-700">Save failed</span>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-wood px-4 py-2 text-sm font-medium text-cream hover:bg-wood-light disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-wood-light/60">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-[11px] text-wood-light/60">{hint}</span>
      ) : null}
    </label>
  );
}
