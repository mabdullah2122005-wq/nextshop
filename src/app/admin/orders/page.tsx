import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { OrderStatusSelect } from "./OrderStatusSelect";

export const metadata = { title: "Orders" };

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Orders</h1>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/orders" className={`rounded-full px-3 py-1 ${!status ? "bg-brand text-white" : "bg-stone-100"}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`rounded-full px-3 py-1 ${status === s ? "bg-brand text-white" : "bg-stone-100"}`}>
            {s}
          </Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 text-left text-stone-500">
            <tr>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Items</th>
              <th className="p-3 font-medium">Total</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 align-top">
            {orders.map((o) => {
              const addr = o.shippingAddress as Record<string, string | null> | null;
              return (
                <tr key={o.id}>
                  <td className="p-3 font-mono">{shortId(o.id)}</td>
                  <td className="p-3 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  <td className="p-3">
                    <p>{o.shippingName ?? "—"}</p>
                    <p className="text-stone-500">{o.email}</p>
                    {addr && (
                      <p className="mt-1 text-xs text-stone-500">
                        {[addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="p-3">{o.items.map((i) => <p key={i.id}>{i.name} × {i.quantity}</p>)}</td>
                  <td className="p-3 font-medium">{formatPrice(o.totalCents)}</td>
                  <td className="p-3"><OrderStatusSelect id={o.id} status={o.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-center text-stone-500">No orders.</p>}
      </div>
    </div>
  );
}
