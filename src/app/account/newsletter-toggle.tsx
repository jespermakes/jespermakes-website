"use client";

import { useState } from "react";

export function NewsletterToggle({
  initialSubscribed,
}: {
  initialSubscribed: boolean;
}) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribed: !subscribed }),
      });
      if (res.ok) {
        setSubscribed(!subscribed);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-3 group"
    >
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          subscribed ? "bg-forest" : "bg-wood/20"
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            subscribed ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-sm text-wood-light group-hover:text-wood transition-colors">
        {loading
          ? "Updating..."
          : subscribed
          ? "Subscribed"
          : "Not subscribed"}
      </span>
    </button>
  );
}
