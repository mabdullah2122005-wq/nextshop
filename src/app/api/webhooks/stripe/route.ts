import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendOrderConfirmation } from "@/lib/email";

// POST /api/webhooks/stripe — source of truth for payment status.
// Configure in Stripe Dashboard → Developers → Webhooks with event:
//   checkout.session.completed, checkout.session.expired
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCompleted(event.data.object);
  } else if (event.type === "checkout.session.expired") {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) await prisma.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
  }

  return NextResponse.json({ received: true });
}

async function handleCompleted(s: Stripe.Checkout.Session) {
  const orderId = s.metadata?.orderId;
  if (!orderId || s.payment_status !== "paid") return;

  const shipping = s.collected_information?.shipping_details;

  // Idempotent: only the first delivery of this event moves PENDING → PAID and decrements stock.
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: {
        status: "PAID",
        email: s.customer_details?.email ?? undefined,
        shippingName: shipping?.name ?? s.customer_details?.name ?? null,
        shippingAddress: shipping?.address ? { ...shipping.address } : undefined,
      },
    });
    if (updated.count === 0) return null;

    const o = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
    for (const item of o.items) {
      if (item.productId) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      }
    }
    return o;
  });

  if (order) await sendOrderConfirmation(order);
}
