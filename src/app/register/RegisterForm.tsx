"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Registration failed");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="name" className="label">Name</label>
        <input id="name" name="name" required autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
        <p className="mt-1 text-xs text-ink/50">At least 8 characters.</p>
      </div>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="btn w-full">{loading ? "Creating…" : "Create account"}</button>
      <p className="text-center text-sm text-ink/60">
        Have an account? <Link href="/login" className="text-brand hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
