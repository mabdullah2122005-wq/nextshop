"use client";

import { useEffect, useState } from "react";
import { useCart, type CartItem } from "./CartProvider";
import { formatPrice } from "@/lib/format";

// Mobile-only bar that appears once the main "Add to cart" box has scrolled out of view.
export function StickyBuyBar({ product, stock, targetId }: { product: Omit<CartItem, "quantity">; stock: number; targetId: string }) {
  const { add } = useCart();
  const [show, setShow] = useState(false);

  // A scroll check (not IntersectionObserver): jumps such as #reviews links skip straight past
  // the buy box without it ever intersecting, which an observer would not report.
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setShow(el.getBoundingClientRect().bottom < 0));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  if (stock === 0) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-ink/8 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur transition-transform duration-300 lg:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
      aria-hidden={!show}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="text-sm font-semibold text-brand">{formatPrice(product.priceCents)}</p>
        </div>
        <button onClick={() => add(product, 1)} tabIndex={show ? 0 : -1} className="btn shrink-0 px-7">Add to cart</button>
      </div>
    </div>
  );
}
