"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";
  const callbackError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Check your credentials and try again.");
        setLoading(false);
        return;
      }

      window.location.href = redirect;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-serif text-3xl text-wood mb-2 text-center">Sign in</h1>
      <p className="text-wood-light text-center mb-8">
        Welcome back. Sign in to access your purchases.
      </p>

      {(error || callbackError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error || "Sign in failed. Please try again."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-wood-light mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-wood-light mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full px-4 py-3 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-amber text-white font-medium hover:bg-amber-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="flex items-center justify-between mt-6">
        <Link
          href="/forgot-password"
          className="text-sm text-wood-light/60 hover:text-amber transition-colors"
        >
          Forgot password?
        </Link>
        <Link
          href="/signup"
          className="text-sm text-amber hover:text-amber-dark underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-6 py-24 text-center text-wood-light">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
