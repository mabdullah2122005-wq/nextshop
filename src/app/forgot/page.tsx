"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: new FormData(e.currentTarget).get("email") }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="container-page flex justify-center py-24">
      <div className="w-full max-w-sm">
        <h1 className="heading text-4xl">Reset password</h1>
        {sent ? (
          <p className="mt-6 rounded-2xl bg-white p-5 text-ink/70">
            If an account exists for that email, we’ve sent a link to reset your password. It’s valid for 1 hour.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <p className="text-ink/60">Enter your email and we’ll send you a reset link.</p>
            <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input" aria-label="Email" />
            <button disabled={loading} className="btn w-full">{loading ? "Sending…" : "Send reset link"}</button>
          </form>
        )}
        <p className="mt-6 text-center text-sm"><Link href="/login" className="text-brand hover:underline">Back to sign in</Link></p>
      </div>
    </div>
  );
}
