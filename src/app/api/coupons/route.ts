import { NextResponse } from "next/server";
import { couponCheckSchema } from "@/lib/validators";
import { jsonError, zodError } from "@/lib/api";
import { describeCoupon, resolveCoupon } from "@/lib/coupons";

// POST /api/coupons — preview a discount code against a cart subtotal.
// Display only: checkout recomputes the discount from database prices.
export async function POST(req: Request) {
  const parsed = couponCheckSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);
  const result = await resolveCoupon(parsed.data.code, parsed.data.subtotalCents);
  if ("error" in result) return jsonError(result.error!, 422);
  return NextResponse.json({
    code: result.coupon.code,
    discountCents: result.discountCents,
    label: describeCoupon(result.coupon),
  });
}
