"use client";

import { useState } from "react";

export function NewsletterInlineForm({ buttonLabel, placeholder }: { buttonLabel: string; placeholder: string }) {
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
        body: JSON.stringify({ email }),
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
      <div className="bg-forest/20 border border-forest/30 rounded-xl px-8 py-6">
        <p className="font-serif text-wood text-xl mb-1">You&apos;re in.</p>
        <p className="text-wood-light/60 text-sm">Next time something is worth sharing, you&apos;ll get it.</p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          className="flex-1 bg-white/60 border border-wood/15 text-wood placeholder-wood/30 rounded-lg px-4 py-3 focus:outline-none focus:border-forest transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-forest hover:bg-forest-dark disabled:opacity-60 text-cream px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          {status === "loading" ? "Signing up\u2026" : buttonLabel}
        </button>
      </form>
      {status === "error" && (
        <p className="text-red-600 text-sm mt-3">Something went wrong — try again.</p>
      )}
    </>
  );
}
