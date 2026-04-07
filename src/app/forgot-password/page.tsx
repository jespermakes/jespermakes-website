"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="mb-6 text-amber text-4xl">&#9993;</div>
        <h1 className="font-serif text-3xl text-wood mb-4">Check your email</h1>
        <p className="text-wood-light leading-relaxed">
          If an account exists for <strong className="text-wood">{email}</strong>,
          we sent a password reset link. Check your inbox (and spam folder).
        </p>
        <Link
          href="/login"
          className="inline-block mt-8 text-amber hover:text-amber-dark underline text-sm"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-serif text-3xl text-wood mb-2 text-center">
        Forgot your password?
      </h1>
      <p className="text-wood-light text-center mb-8">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-amber text-white font-medium hover:bg-amber-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="text-wood-light/60 text-sm text-center mt-6">
        <Link href="/login" className="text-amber hover:text-amber-dark underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
