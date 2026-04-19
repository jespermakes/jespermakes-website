"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto sign in after successful signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created! Please sign in.");
        setLoading(false);
        return;
      }

      window.location.href = "/account";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-serif text-3xl text-wood mb-2 text-center">
        Create an account
      </h1>
      <p className="text-wood-light text-center mb-8">
        Track your purchases and download your files anytime.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-wood-light mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest"
          />
        </div>

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
            className="w-full px-4 py-3 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest"
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full px-4 py-3 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-forest text-white font-medium hover:bg-forest-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-wood-light/60 text-sm text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-forest hover:text-forest-dark underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
