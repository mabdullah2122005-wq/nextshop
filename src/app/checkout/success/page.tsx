import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, shortId } from "@/lib/format";
import { ClearCart } from "./ClearCart";

export const metadata = { title: "Order confirmed" };

export default async function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { session_id } = await searchParams;
  const order =
    typeof session_id === "string"
      ? await prisma.order.findUnique({ where: { stripeSessionId: session_id }, include: { items: true } })
      : null;

  return (
    <div className="container-page max-w-xl py-20 text-center">
      <ClearCart />
      <h1 className="text-3xl font-semibold">Thank you!</h1>
      <p className="mt-3 text-stone-600">
        Your payment was received. A confirmation email is on its way.
      </p>
      {order && (
        <div className="card mt-8 p-5 text-left">
          <p className="text-sm text-stone-500">Order {shortId(order.id)}</p>
          <ul className="mt-3 space-y-1 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>{i.name} × {i.quantity}</span>
                <span>{formatPrice(i.priceCents * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-stone-200 pt-3 font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </p>
        </div>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/products" className="btn">Keep shopping</Link>
        <Link href="/account" className="btn-outline">My orders</Link>
      </div>
    </div>
  );
}
