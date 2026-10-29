"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./CartProvider";

export function AddToCartButton({ product, stock }: { product: Omit<CartItem, "quantity">; stock: number }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (stock === 0) return <button className="btn w-full sm:w-auto" disabled>Sold out</button>;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="sr-only" htmlFor="qty">Quantity</label>
      <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input w-20">
        {Array.from({ length: Math.min(stock, 10) }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
      <button
        className="btn"
        onClick={() => {
          add(product, qty);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
      >
        {added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
