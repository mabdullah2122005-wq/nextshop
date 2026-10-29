"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";

type Existing = { rating: number; title: string; body: string } | null;

export function ReviewForm({ slug, existing }: { slug: string; existing: Existing }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) {
    return <button onClick={() => setOpen(true)} className="btn-outline w-full">{existing ? "Edit your review" : "Write a review"}</button>;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const res = await fetch(`/api/products/${slug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, title: f.get("title"), body: f.get("body") }),
    });
    setSaving(false);
    if (!res.ok) return setError((await res.json()).error ?? "Could not save review");
    toast("Thanks for your review!");
    setOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <div>
        <p className="label">Your rating</p>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
              className={`text-3xl leading-none transition ${(hover || rating) >= i ? "text-gold" : "text-ink/15"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="title" className="label">Title <span className="font-normal text-ink/40">(optional)</span></label>
        <input id="title" name="title" defaultValue={existing?.title} maxLength={120} className="input" />
      </div>
      <div>
        <label htmlFor="body" className="label">Review</label>
        <textarea id="body" name="body" defaultValue={existing?.body} required minLength={10} rows={4} className="input" />
      </div>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button disabled={saving} className="btn flex-1">{saving ? "Saving…" : "Submit review"}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}
