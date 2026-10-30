"use client";

import { useCart } from "./CartProvider";
import { BagIcon } from "./icons";

export function CartLink() {
  const { count, openCart } = useCart();
  return (
    <button onClick={openCart} className="relative -mr-2 grid h-11 w-11 place-items-center rounded-full hover:bg-cream" aria-label={`Open cart, ${count} items`}>
      <BagIcon className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
