"use client";

import { useState } from "react";

export function ChangePasswordForm({
  hasExistingPassword,
}: {
  hasExistingPassword: boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirm) {
      setError("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: hasExistingPassword ? currentPassword : undefined,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
          Password updated successfully.
        </div>
      )}

      {hasExistingPassword && (
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current password"
          required
          className="w-full px-4 py-2.5 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest text-sm"
        />
      )}

      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password (min. 8 characters)"
        required
        minLength={8}
        className="w-full px-4 py-2.5 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest text-sm"
      />

      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm new password"
        required
        minLength={8}
        className="w-full px-4 py-2.5 rounded-lg border border-wood/20 bg-white text-wood placeholder:text-wood-light/40 focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest text-sm"
      />

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 rounded-lg bg-wood text-cream font-medium hover:bg-wood/90 transition-colors text-sm disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : hasExistingPassword
          ? "Change password"
          : "Set password"}
      </button>
    </form>
  );
}
