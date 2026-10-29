"use client";

import Link from "next/link";
import { useState } from "react";

export function ResetForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) return <p className="mt-6 text-red-600">This link is missing its token. Please request a new one.</p>;
  if (done) {
    return (
      <div className="mt-6 space-y-4">
        <p className="rounded-2xl bg-white p-5 text-ink/70">Your password has been updated.</p>
        <Link href="/login" className="btn w-full">Sign in</Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) return setError("Passwords don’t match");
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: f.get("password") }),
    });
    setLoading(false);
    if (!res.ok) return setError((await res.json()).error ?? "Could not reset password");
    setDone(true);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="label">New password</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
      </div>
      <div>
        <label htmlFor="confirm" className="label">Confirm password</label>
        <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="btn w-full">{loading ? "Saving…" : "Update password"}</button>
    </form>
  );
}
