"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./CartProvider";

export function AddToCartButton({ product, stock }: { product: Omit<CartItem, "quantity">; stock: number }) {
  const { add, items } = useCart();
  const [qty, setQty] = useState(1);

  if (stock === 0) return <button className="btn w-full" disabled>Sold out</button>;

  const inCart = items.find((i) => i.productId === product.productId)?.quantity ?? 0;
  const max = Math.max(0, Math.min(stock, 99) - inCart);

  return (
    <div className="flex gap-3">
      <div className="flex items-center rounded-full border border-ink/15 bg-white">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-11 place-items-center text-lg" aria-label="Decrease quantity">−</button>
        <span className="w-6 text-center font-medium" aria-live="polite">{qty}</span>
        <button onClick={() => setQty((q) => Math.min(Math.max(1, max), q + 1))} className="grid h-12 w-11 place-items-center text-lg" aria-label="Increase quantity">+</button>
      </div>
      <button
        className="btn flex-1"
        disabled={max === 0}
        onClick={() => {
          add(product, Math.min(qty, max)); // opens the cart drawer, which is the confirmation
          setQty(1);
        }}
      >
        {max === 0 ? "Max quantity in cart" : "Add to cart"}
      </button>
    </div>
  );
}
