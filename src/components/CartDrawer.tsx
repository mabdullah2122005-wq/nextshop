"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { FreeShippingBar } from "./FreeShippingBar";
import { CloseIcon, BagIcon } from "./icons";
import { useOverlay } from "./useOverlay";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotalCents, setQuantity, remove } = useCart();
  useOverlay(isOpen, closeCart);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button className="animate-fade absolute inset-0 h-full w-full bg-ink/50" onClick={closeCart} aria-label="Close cart" tabIndex={-1} />
      <aside className="animate-drawer absolute top-0 right-0 flex h-dvh w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/8 px-5 sm:px-6">
          <h2 className="heading text-2xl">Your cart</h2>
          <button onClick={closeCart} className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream" aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-cream p-5"><BagIcon className="h-8 w-8 text-ink/60" /></div>
            <p className="text-ink/60">Your cart is empty.</p>
            <Link href="/products" onClick={closeCart} className="btn">Start shopping</Link>
          </div>
        ) : (
          <>
            <div className="shrink-0 border-b border-ink/8 px-5 py-4 sm:px-6"><FreeShippingBar subtotalCents={subtotalCents} /></div>
            <ul className="flex-1 divide-y divide-ink/8 overflow-y-auto overscroll-contain px-5 sm:px-6">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-5">
                  <Link href={`/products/${item.slug}`} onClick={closeCart} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                    <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link href={`/products/${item.slug}`} onClick={closeCart} className="font-medium leading-snug hover:text-brand">{item.name}</Link>
                      <span className="shrink-0 font-medium">{formatPrice(item.priceCents * item.quantity)}</span>
                    </div>
                    <p className="text-sm text-ink/50">{formatPrice(item.priceCents)} each</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-ink/15">
                        <button onClick={() => setQuantity(item.productId, item.quantity - 1)} className="grid h-9 w-9 place-items-center text-lg" aria-label={`Decrease ${item.name}`}>−</button>
                        <span className="w-6 text-center text-sm" aria-live="polite">{item.quantity}</span>
                        <button onClick={() => setQuantity(item.productId, item.quantity + 1)} className="grid h-9 w-9 place-items-center text-lg" aria-label={`Increase ${item.name}`}>+</button>
                      </div>
                      <button onClick={() => remove(item.productId)} className="px-1 py-2 text-sm text-ink/50 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="shrink-0 border-t border-ink/8 bg-cream/60 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              <div className="flex justify-between text-base">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotalCents)}</span>
              </div>
              <p className="mt-1 text-xs text-ink/50">Discount codes and shipping are applied at checkout.</p>
              <Link href="/cart" onClick={closeCart} className="btn mt-4 w-full">View cart & checkout</Link>
              <button onClick={closeCart} className="mt-1 w-full py-3 text-sm text-ink/60 hover:text-ink">Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
