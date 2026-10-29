"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, subtotalCents, setQuantity, remove, ready } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  if (!ready) return <div className="container-page py-10 text-stone-500">Loading cart…</div>;

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Link href="/products" className="btn mt-6">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="card divide-y divide-stone-200">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <Link href={`/products/${item.slug}`} className="font-medium hover:text-brand">{item.name}</Link>
                  <p className="text-sm text-stone-500">{formatPrice(item.priceCents)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                    className="input w-20"
                    aria-label={`Quantity of ${item.name}`}
                  />
                  <span className="w-20 text-right font-medium">{formatPrice(item.priceCents * item.quantity)}</span>
                  <button onClick={() => remove(item.productId)} className="text-sm text-stone-500 hover:text-red-600">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="card h-fit p-5">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotalCents)}</span>
          </div>
          <p className="mt-2 text-xs text-stone-500">Shipping address is collected at checkout.</p>
          {error && <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
          <button onClick={checkout} disabled={loading} className="btn mt-5 w-full">
            {loading ? "Redirecting…" : "Checkout securely"}
          </button>
        </aside>
      </div>
    </div>
  );
}
