"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { FreeShippingBar } from "./FreeShippingBar";
import { CloseIcon, BagIcon } from "./icons";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { isOpen, closeCart, items, subtotalCents, setQuantity, remove } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button className="animate-fade absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={closeCart} aria-label="Close cart" />
      <aside className="animate-drawer absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
          <h2 className="heading text-xl">Your cart</h2>
          <button onClick={closeCart} className="rounded-full p-2 hover:bg-cream" aria-label="Close"><CloseIcon /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-cream p-5"><BagIcon className="h-8 w-8 text-ink/60" /></div>
            <p className="text-ink/60">Your cart is empty.</p>
            <Link href="/products" onClick={closeCart} className="btn">Start shopping</Link>
          </div>
        ) : (
          <>
            <div className="border-b border-ink/8 px-6 py-4"><FreeShippingBar subtotalCents={subtotalCents} /></div>
            <ul className="flex-1 divide-y divide-ink/8 overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-5">
                  <Link href={`/products/${item.slug}`} onClick={closeCart} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                    <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link href={`/products/${item.slug}`} onClick={closeCart} className="font-medium hover:text-brand">{item.name}</Link>
                      <span className="font-medium">{formatPrice(item.priceCents * item.quantity)}</span>
                    </div>
                    <p className="text-sm text-ink/50">{formatPrice(item.priceCents)} each</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-ink/15">
                        <button onClick={() => setQuantity(item.productId, item.quantity - 1)} className="px-3 py-1 text-lg leading-none" aria-label="Decrease quantity">−</button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => setQuantity(item.productId, item.quantity + 1)} className="px-3 py-1 text-lg leading-none" aria-label="Increase quantity">+</button>
                      </div>
                      <button onClick={() => remove(item.productId)} className="text-xs text-ink/50 underline-offset-2 hover:text-red-600 hover:underline">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-ink/8 bg-cream/50 px-6 py-5">
              <div className="flex justify-between text-base">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotalCents)}</span>
              </div>
              <p className="mt-1 text-xs text-ink/50">Discount codes and shipping are applied at checkout.</p>
              <Link href="/cart" onClick={closeCart} className="btn mt-4 w-full">View cart & checkout</Link>
              <button onClick={closeCart} className="mt-2 w-full py-2 text-sm text-ink/60 hover:text-ink">Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
