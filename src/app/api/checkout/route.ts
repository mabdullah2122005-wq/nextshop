import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validators";
import { jsonError, zodError } from "@/lib/api";
import { resolveCoupon } from "@/lib/coupons";

// POST /api/checkout — creates a PENDING order and a Stripe Checkout Session.
// Prices and discounts always come from the database, never from the client.
export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) return jsonError("Online payments aren't enabled yet. Please check back soon.", 503);

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);

  const session = await auth();
  const quantities = new Map<string, number>();
  for (const i of parsed.data.items) quantities.set(i.productId, (quantities.get(i.productId) ?? 0) + i.quantity);

  const products = await prisma.product.findMany({ where: { id: { in: [...quantities.keys()] }, active: true } });
  if (products.length !== quantities.size) return jsonError("Some items are no longer available", 409);

  for (const p of products) {
    if (p.stock < quantities.get(p.id)!) return jsonError(`Only ${p.stock} left of "${p.name}"`, 409);
  }

  const lines = products.map((p) => ({ product: p, quantity: quantities.get(p.id)! }));
  const subtotalCents = lines.reduce((sum, l) => sum + l.product.priceCents * l.quantity, 0);

  let discountCents = 0;
  let couponCode: string | null = null;
  if (parsed.data.couponCode) {
    const result = await resolveCoupon(parsed.data.couponCode, subtotalCents);
    if ("error" in result) return jsonError(result.error!, 422);
    discountCents = result.discountCents;
    couponCode = result.coupon.code;
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const currency = (process.env.NEXT_PUBLIC_CURRENCY ?? "USD").toLowerCase();

  const order = await prisma.order.create({
    data: {
      userId: session?.user?.id,
      email: session?.user?.email ?? "pending@checkout",
      subtotalCents,
      discountCents,
      totalCents: subtotalCents - discountCents,
      couponCode,
      items: {
        create: lines.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          priceCents: l.product.priceCents,
          quantity: l.quantity,
        })),
      },
    },
  });

  try {
    const stripe = getStripe();
    // A one-off Stripe coupon mirrors our server-computed discount exactly.
    const discounts = discountCents
      ? [{ coupon: (await stripe.coupons.create({ amount_off: discountCents, currency, duration: "once", name: couponCode! })).id }]
      : undefined;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session?.user?.email ?? undefined,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR"] },
      discounts,
      line_items: lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency,
          unit_amount: l.product.priceCents,
          product_data: { name: l.product.name, images: [l.product.imageUrl] },
        },
      })),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkout.id } });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("[checkout] stripe error", err);
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    return jsonError("Payment provider error, please try again", 502);
  }
}
