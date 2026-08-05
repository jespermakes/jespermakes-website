"use client";

import { useState } from "react";

/* Styled for the Rubio-green page (#183029 background): white text, white/10
 * fields, Rubio gold (#fcc52c) for the action and focus states. */

export default function EntryForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      setCode(typeof body.code === "string" ? body.code : null);
      setStatus("done");
    } catch {
      setError("Something went wrong. Try again.");
      setStatus("error");
    }
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked (older browser, insecure context): the code is on
      // screen and in the email, so selecting it by hand still works.
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-white/20 bg-white/10 p-6">
        <p className="font-serif text-2xl text-white mb-2">Your floor is in.</p>
        <p className="text-white/80 text-[15px] leading-relaxed">
          Winners are picked in early September. Until then, do not fix anything.
        </p>

        {code && (
          <div className="mt-5 rounded-lg border border-[#fcc52c]/40 bg-[#fcc52c]/10 p-4">
            <p className="text-white text-[15px] leading-relaxed mb-3">
              Whatever the judges decide, here is something for entering: pay for one Rubio
              Monocoat sample, get two free. Try the oil on a corner of that floor before you
              commit to the whole thing.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <code className="rounded-md bg-[#183029] border border-[#fcc52c]/50 px-3 py-2 font-mono text-[17px] tracking-wide text-[#fcc52c] select-all">
                {code}
              </code>
              <button
                type="button"
                onClick={copyCode}
                className="rounded-md bg-[#fcc52c] px-4 py-2 text-[14px] font-medium text-[#183029] hover:opacity-90"
              >
                {copied ? "Copied" : "Copy code"}
              </button>
            </div>
            <p className="text-white/60 text-[13px] leading-relaxed mt-3">
              Paste it at checkout on{" "}
              <a
                href="https://www.rubiomonocoat.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#fcc52c] underline decoration-[#fcc52c]/40"
              >
                rubiomonocoat.com
              </a>
              . Runs until the end of August. It is in your confirmation email too.
            </p>
          </div>
        )}

        <p className="text-white/60 text-[13px] leading-relaxed mt-4">
          Check your inbox for the confirmation.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#fcc52c]";
  const label = "block text-[13px] font-medium text-white/80 mb-1 mt-4";

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
      <input id="fr-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" required className="block text-[14px] text-white/70 mt-1 file:mr-3 file:rounded-md file:border-0 file:bg-white/15 file:px-3 file:py-1.5 file:text-white file:text-[13px]" />

      <label className="flex items-start gap-2 mt-5 text-[13px] text-white/80 leading-snug">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-[#fcc52c]" />
        <span>
          Rubio Monocoat and Jesper Makes may see my entry (including the photo) and contact me
          about this competition. Required to enter.
        </span>
      </label>

      <label className="flex items-start gap-2 mt-3 text-[13px] text-white/80 leading-snug">
        <input type="checkbox" name="newsletter" className="mt-0.5 accent-[#fcc52c]" />
        <span>
          Also send me The Workshop Letter: about once a month, I run my business in public.
          New subscribers get the free starter kit instantly.
        </span>
      </label>

      {error && <p className="mt-4 text-[14px] text-[#ffb4ab]">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 rounded-md bg-[#fcc52c] px-5 py-2.5 text-[15px] font-medium text-[#183029] hover:opacity-90 disabled:opacity-50"
      >
        {status === "sending" ? "Entering..." : "Enter my floor"}
      </button>
    </form>
  );
}
