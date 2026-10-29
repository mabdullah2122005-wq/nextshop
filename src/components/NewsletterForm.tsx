"use client";

import { useState } from "react";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const email = new FormData(e.currentTarget).get("email");
    const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setState(res.ok ? "done" : "error");
  }

  if (state === "done") return <p className={dark ? "text-white" : "text-brand"}>Thanks! You’re on the list. ✓</p>;

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
      <input
        name="email"
        type="email"
        required
        placeholder="Your email address"
        aria-label="Email address"
        className={`flex-1 rounded-full px-5 py-3 text-sm outline-none ${dark ? "bg-white/10 text-white placeholder:text-white/50 focus:bg-white/15" : "border border-ink/15 bg-white"}`}
      />
      <button disabled={state === "loading"} className={dark ? "btn-light" : "btn"}>{state === "loading" ? "…" : "Subscribe"}</button>
      {state === "error" && <span className="sr-only">Please enter a valid email</span>}
    </form>
  );
}
