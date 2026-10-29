"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="relative rounded-lg bg-brand px-3 py-1.5 text-white hover:bg-brand-dark" aria-label={`Cart, ${count} items`}>
      Cart
      {count > 0 && (
        <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-semibold">
          {count}
        </span>
      )}
    </Link>
  );
}
