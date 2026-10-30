import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { OrderStatusSelect } from "./OrderStatusSelect";

export const metadata = { title: "Orders" };

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const LABELS: Record<OrderStatus, string> = { PENDING: "Pending", PAID: "To ship", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled" };

const customerEmail = (e: string) => (e === "pending@checkout" ? "Guest · checkout not completed" : e);

function address(a: unknown) {
  const addr = a as Record<string, string | null> | null;
  return addr ? [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(", ") : "";
}

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const [orders, counts] = await Promise.all([
    prisma.order.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" }, take: 100, include: { items: true } }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s?: OrderStatus) => (s ? counts.find((c) => c.status === s)?._count ?? 0 : counts.reduce((n, c) => n + c._count, 0));

  return (
    <div>
      <h1 className="heading text-3xl sm:text-4xl">Orders</h1>
      <div className="-mx-4 mt-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 text-sm [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {[undefined, ...STATUSES].map((s) => (
          <Link
            key={s ?? "ALL"}
            href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
            className={`shrink-0 rounded-full px-4 py-2 whitespace-nowrap ${status === s ? "bg-brand text-white" : "bg-white hover:bg-cream"}`}
          >
            {s ? LABELS[s] : "All"} <span className="opacity-60">{count(s)}</span>
          </Link>
        ))}
      </div>

      {orders.length === 0 && <div className="card p-10 text-center text-ink/50">No orders here.</div>}

      {/* Phones: one card per order */}
      <ul className="space-y-3 lg:hidden">
        {orders.map((o) => (
          <li key={o.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono font-semibold">{shortId(o.id)}</p>
                <p className="text-xs text-ink/50">{formatDate(o.createdAt)}</p>
              </div>
              <p className="text-lg font-semibold">{formatPrice(o.totalCents)}</p>
            </div>
            <div className="mt-3 text-sm">
              <p className="font-medium">{o.shippingName ?? "—"}</p>
              <p className="break-all text-ink/60">{customerEmail(o.email)}</p>
              {address(o.shippingAddress) && <p className="mt-1 text-xs text-ink/50">{address(o.shippingAddress)}</p>}
            </div>
            <ul className="mt-3 border-t border-ink/8 pt-3 text-sm text-ink/70">
              {o.items.map((i) => <li key={i.id}>{i.name} × {i.quantity}</li>)}
            </ul>
            <div className="mt-3"><OrderStatusSelect id={o.id} status={o.status} full /></div>
          </li>
        ))}
      </ul>

      {/* Larger screens: table */}
      {orders.length > 0 && (
        <div className="card hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/8 text-left text-ink/50">
              <tr>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 align-top">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="p-4">
                    <p className="font-mono font-semibold">{shortId(o.id)}</p>
                    <p className="text-xs text-ink/50">{formatDate(o.createdAt)}</p>
                  </td>
                  <td className="max-w-64 p-4">
                    <p>{o.shippingName ?? "—"}</p>
                    <p className="break-all text-ink/50">{customerEmail(o.email)}</p>
                    {address(o.shippingAddress) && <p className="mt-1 text-xs text-ink/50">{address(o.shippingAddress)}</p>}
                  </td>
                  <td className="p-4">{o.items.map((i) => <p key={i.id}>{i.name} × {i.quantity}</p>)}</td>
                  <td className="p-4 font-medium">{formatPrice(o.totalCents)}</td>
                  <td className="p-4"><OrderStatusSelect id={o.id} status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
