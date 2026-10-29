import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata = { title: "My orders" };

const steps = ["PAID", "SHIPPED", "DELIVERED"];

export default async function AccountPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id, status: { not: "PENDING" } },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <div className="card flex flex-col items-center p-16 text-center">
        <p className="heading text-2xl">No orders yet</p>
        <p className="mt-2 text-ink/60">When you place an order it will appear here.</p>
        <Link href="/products" className="btn mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => {
        const step = steps.indexOf(o.status);
        return (
          <li key={o.id} className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Order {shortId(o.id)}</p>
                <p className="text-sm text-ink/50">Placed {formatDate(o.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <span className="text-lg font-semibold">{formatPrice(o.totalCents)}</span>
              </div>
            </div>
            {o.status !== "CANCELLED" && (
              <ol className="mt-5 grid grid-cols-3 gap-2 text-xs">
                {["Paid", "Shipped", "Delivered"].map((label, i) => (
                  <li key={label}>
                    <div className={`h-1.5 rounded-full ${i <= step ? "bg-brand" : "bg-sand"}`} />
                    <p className={`mt-1.5 ${i <= step ? "font-medium text-brand" : "text-ink/40"}`}>{label}</p>
                  </li>
                ))}
              </ol>
            )}
            <ul className="mt-5 space-y-1 border-t border-ink/8 pt-4 text-sm text-ink/70">
              {o.items.map((i) => (
                <li key={i.id} className="flex justify-between"><span>{i.name} × {i.quantity}</span><span>{formatPrice(i.priceCents * i.quantity)}</span></li>
              ))}
              {o.discountCents > 0 && <li className="flex justify-between text-brand"><span>Discount ({o.couponCode})</span><span>−{formatPrice(o.discountCents)}</span></li>}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
