"use client";

import { useState } from "react";

export default function EntryForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/competition/floor", { method: "POST", body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Something went wrong. Try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-wood-light/20 bg-white/60 p-6">
        <p className="font-serif text-2xl text-wood mb-2">Your floor is in.</p>
        <p className="text-wood-light/80 text-[15px] leading-relaxed">
          Check your inbox: the confirmation is on its way, and it has something extra in it.
          Winners are picked in early September. Until then, do not fix anything.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-md border border-wood-light/25 bg-white/80 px-3 py-2 text-[15px] text-wood placeholder:text-wood-light/40 focus:outline-none focus:border-wood-light/60";
  const label = "block text-[13px] font-medium text-wood-light/80 mb-1 mt-4";

  return (
    <form onSubmit={onSubmit} className="max-w-[560px]">
      <label className={label} htmlFor="fr-name">Name</label>
      <input id="fr-name" name="name" required maxLength={120} className={field} />

      <label className={label} htmlFor="fr-email">Email</label>
      <input id="fr-email" name="email" type="email" required maxLength={320} className={field} />

      <label className={label} htmlFor="fr-country">Country</label>
      <input id="fr-country" name="country" required maxLength={60} className={field} placeholder="Denmark, UK, Belgium, ..." />

      <label className={label} htmlFor="fr-story">What has this floor survived? (optional, but stories win)</label>
      <textarea id="fr-story" name="floorStory" rows={4} maxLength={2000} className={field} />

      <label className={label} htmlFor="fr-photo">A photo of the floor (JPEG/PNG/WebP/HEIC, max 8MB)</label>
      <input id="fr-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" required className="block text-[14px] text-wood-light/80 mt-1" />

      <label className="flex items-start gap-2 mt-5 text-[13px] text-wood-light/80 leading-snug">
        <input type="checkbox" name="consent" required className="mt-0.5" />
        <span>
          Rubio Monocoat and Jesper Makes may see my entry (including the photo) and contact me
          about this competition. Required to enter.
        </span>
      </label>

      <label className="flex items-start gap-2 mt-3 text-[13px] text-wood-light/80 leading-snug">
        <input type="checkbox" name="newsletter" className="mt-0.5" />
        <span>
          Also send me The Workshop Letter: about once a month, I run my business in public.
          New subscribers get the free starter kit instantly.
        </span>
      </label>

      {error && <p className="mt-4 text-[14px] text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 rounded-md bg-wood px-5 py-2.5 text-[15px] text-white hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Entering..." : "Enter my floor"}
      </button>
    </form>
  );
}
