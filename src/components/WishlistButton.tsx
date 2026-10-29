"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeartIcon } from "./icons";
import { useToast } from "./ToastProvider";

type Props = { productId: string; initial: boolean; variant?: "icon" | "button" };

export function WishlistButton({ productId, initial, variant = "icon" }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [wished, setWished] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    const res = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    setBusy(false);
    if (res.status === 401) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!res.ok) return toast("Something went wrong", "error");
    const { wished: next } = await res.json();
    setWished(next);
    toast(next ? "Saved to your wishlist" : "Removed from wishlist");
    router.refresh();
  }

  if (variant === "button") {
    return (
      <button onClick={toggle} disabled={busy} className="btn-outline" aria-pressed={wished}>
        <HeartIcon className={`h-5 w-5 ${wished ? "text-accent" : ""}`} filled={wished} />
        {wished ? "Saved" : "Save"}
      </button>
    );
  }
  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={wished}
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      className="grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110"
    >
      <HeartIcon className={`h-[18px] w-[18px] ${wished ? "text-accent" : "text-ink"}`} filled={wished} />
    </button>
  );
}
