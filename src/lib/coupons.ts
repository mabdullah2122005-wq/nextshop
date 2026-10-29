import type { Coupon } from "@prisma/client";
import { prisma } from "./prisma";
import { formatPrice } from "./format";

export function discountFor(coupon: Pick<Coupon, "kind" | "value">, subtotalCents: number) {
  const raw = coupon.kind === "PERCENT" ? Math.round((subtotalCents * coupon.value) / 100) : coupon.value;
  return Math.min(raw, subtotalCents);
}

// Looks up a code and checks it applies to this subtotal. Always computed server-side.
export async function resolveCoupon(code: string, subtotalCents: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.active) return { error: "This code isn't valid" } as const;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: "This code has expired" } as const;
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { error: "This code has reached its usage limit" } as const;
  if (subtotalCents < coupon.minOrderCents) {
    return { error: `Spend ${formatPrice(coupon.minOrderCents)} or more to use this code` } as const;
  }
  return { coupon, discountCents: discountFor(coupon, subtotalCents) } as const;
}

export function describeCoupon(c: Pick<Coupon, "kind" | "value">) {
  return c.kind === "PERCENT" ? `${c.value}% off` : `${formatPrice(c.value)} off`;
}
