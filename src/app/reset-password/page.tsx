"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-wood mb-4">Invalid link</h1>
        <p className="text-wood-light mb-6">
          This reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-amber hover:text-amber-dark underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-amber" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl text-wood mb-4">Password updated</h1>
        <p className="text-wood-light mb-6">
          Your password has been reset. You can now sign in.
        </p>
        <Link
          href="/login"
          className="inline-block bg-amber text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-dark transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-serif text-3xl text-wood mb-2 text-center">
        Set a new password
      </h1>
      <p className="text-wood-light text-center mb-8">
        Choose a new password for your account.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm text-wood-light mb-1">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full px-4 py-3 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm text-wood-light mb-1">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            className="w-full px-4 py-3 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-amber text-white font-medium hover:bg-amber-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-6 py-24 text-center text-wood-light">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
