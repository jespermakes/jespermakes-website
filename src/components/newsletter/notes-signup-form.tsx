"use client";

import { useState } from "react";

// One signup form for every placement on the site. The `source` prop is
// stored per subscriber so we can see which placement actually converts.
// Keep values in sync with PUBLIC_SOURCES in /api/newsletter/subscribe.
export type NotesSignupSource =
  | "newsletter_page"
  | "homepage"
  | "site_footer"
  | "blog_post"
  | "tools_page";

export function NotesSignupForm({
  source,
  variant = "band",
  dark = false,
  buttonLabel = "Subscribe",
  placeholder = "your@email.com",
}: {
  source: NotesSignupSource;
  variant?: "hero" | "band";
  dark?: boolean;
  buttonLabel?: string;
  placeholder?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`rounded-xl border px-6 py-5 ${
          dark ? "bg-cream/10 border-cream/20" : "bg-forest/10 border-forest/30"
        }`}
      >
        <p className={`font-serif text-xl mb-1 ${dark ? "text-cream" : "text-wood"}`}>
          You&apos;re in.
        </p>
        <p className={`text-sm ${dark ? "text-cream/60" : "text-wood-light/60"}`}>
          If the first letter lands in spam, drag it out. After that they behave.
        </p>
      </div>
    );
  }

  const sizeCls = variant === "hero" ? "px-5 py-4 text-base" : "px-4 py-3 text-sm";
  const inputCls = dark
    ? "bg-cream/10 border-cream/20 text-cream placeholder-cream/40 focus:border-cream/50"
    : "bg-white border-wood/15 text-wood placeholder-wood/30 focus:border-forest";
  const buttonCls = dark
    ? "bg-cream text-wood hover:bg-cream/90"
    : "bg-forest text-cream hover:bg-forest-dark";

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          aria-label="Email address"
          className={`flex-1 min-w-0 border rounded-lg focus:outline-none transition-colors ${sizeCls} ${inputCls}`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${sizeCls} ${buttonCls}`}
        >
          {status === "loading" ? "Signing up…" : buttonLabel}
        </button>
      </form>
      {status === "error" && (
        <p className={`text-sm mt-3 ${dark ? "text-red-300" : "text-red-600"}`}>
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
}
