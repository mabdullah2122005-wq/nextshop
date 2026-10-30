"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { FreeShippingBar } from "@/components/FreeShippingBar";
import { ShieldIcon, TagIcon } from "@/components/icons";
import { formatPrice } from "@/lib/format";

type Applied = { code: string; discountCents: number; label: string };

export default function CartPage() {
  const { items, subtotalCents, setQuantity, remove, ready } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<Applied | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function applyCoupon(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = String(new FormData(e.currentTarget).get("code") ?? "");
    setChecking(true);
    setCouponError(null);
    const res = await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, subtotalCents }) });
    const data = await res.json();
    setChecking(false);
    if (!res.ok) {
      setCoupon(null);
      setCouponError(data.error);
      return;
    }
    setCoupon(data);
  }

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })), couponCode: coupon?.code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="container-page py-12">
        <div className="skeleton h-12 w-48" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]"><div className="skeleton h-72" /><div className="skeleton h-72" /></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-28 text-center">
        <h1 className="heading text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-ink/60">Looks like you haven’t added anything yet.</p>
        <Link href="/products" className="btn mt-8">Continue shopping</Link>
      </div>
    );
  }

  // Re-validate the preview if the cart changed since the code was applied.
  const discount = coupon ? Math.min(coupon.discountCents, subtotalCents) : 0;

  return (
    <div className="container-page py-12">
      <h1 className="heading text-4xl sm:text-5xl">Cart</h1>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
        <ul className="divide-y divide-ink/8 border-y border-ink/8">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-5 py-6">
              <Link href={`/products/${item.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-sand sm:h-32 sm:w-28">
                <Image src={item.imageUrl} alt={item.name} fill sizes="112px" className="object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/products/${item.slug}`} className="font-medium leading-snug hover:text-brand sm:text-lg">{item.name}</Link>
                    <p className="text-sm text-ink/50">{formatPrice(item.priceCents)}</p>
                  </div>
                  <p className="shrink-0 font-medium sm:text-lg">{formatPrice(item.priceCents * item.quantity)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border border-ink/15 bg-white">
                    <button onClick={() => { setQuantity(item.productId, item.quantity - 1); setCoupon(null); }} className="grid h-10 w-10 place-items-center text-lg" aria-label={`Decrease ${item.name}`}>−</button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button onClick={() => { setQuantity(item.productId, item.quantity + 1); setCoupon(null); }} className="grid h-10 w-10 place-items-center text-lg" aria-label={`Increase ${item.name}`}>+</button>
                  </div>
                  <button onClick={() => { remove(item.productId); setCoupon(null); }} className="px-1 py-2 text-sm text-ink/50 hover:text-red-600">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit space-y-5 p-6 lg:sticky lg:top-28">
          <FreeShippingBar subtotalCents={subtotalCents} />

          <form onSubmit={applyCoupon} className="border-t border-ink/8 pt-5">
            <label htmlFor="code" className="label flex items-center gap-1.5"><TagIcon /> Discount code</label>
            <div className="flex gap-2">
              <input id="code" name="code" placeholder="e.g. WELCOME10" autoCapitalize="characters" className="input min-w-0 uppercase placeholder:normal-case" defaultValue={coupon?.code} />
              <button disabled={checking} className="btn-outline px-5">{checking ? "…" : "Apply"}</button>
            </div>
            {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
            {coupon && <p className="mt-2 text-sm text-brand">✓ {coupon.code} applied — {coupon.label}</p>}
          </form>

          <dl className="space-y-2 border-t border-ink/8 pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd>{formatPrice(subtotalCents)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-brand"><dt>Discount ({coupon!.code})</dt><dd>−{formatPrice(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink/60">Shipping</dt><dd className="text-ink/60">Calculated at checkout</dd></div>
            <div className="flex justify-between border-t border-ink/8 pt-3 text-lg font-semibold"><dt>Total</dt><dd>{formatPrice(subtotalCents - discount)}</dd></div>
          </dl>

          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button onClick={checkout} disabled={loading} className="btn w-full py-4 text-base">
            {loading ? "Redirecting to secure checkout…" : "Checkout"}
          </button>
          <p className="flex items-center justify-center gap-2 text-xs text-ink/50"><ShieldIcon className="h-4 w-4" /> Secure checkout powered by Stripe</p>
        </aside>
      </div>
    </div>
  );
}
