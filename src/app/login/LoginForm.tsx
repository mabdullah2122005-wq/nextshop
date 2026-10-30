"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/account";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    // Only allow same-site redirects.
    router.push(callbackUrl.startsWith("/") ? callbackUrl : "/account");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">Password</label>
          <Link href="/forgot" className="mb-1.5 text-xs text-ink/60 hover:text-brand">Forgot password?</Link>
        </div>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <button disabled={loading} className="btn w-full">{loading ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-sm text-ink/60">
        New here? <Link href="/register" className="text-brand hover:underline">Create an account</Link>
      </p>
    </form>
  );
}
