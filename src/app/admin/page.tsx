import Link from "next/link";
import { getStoreStats } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Admin dashboard" };

export default async function AdminDashboard() {
  const stats = await getStoreStats(14);
  const max = Math.max(1, ...stats.daily.map((d) => d.revenueCents));

  const tiles = [
    { label: "Total revenue", value: formatPrice(stats.revenueCents) },
    { label: "Paid orders", value: stats.paidOrders.toLocaleString() },
    { label: "Avg. order value", value: formatPrice(stats.averageOrderCents) },
    { label: "Customers", value: stats.customers.toLocaleString() },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="card p-4">
            <p className="text-sm text-stone-500">{t.label}</p>
            <p className="mt-1 text-2xl font-semibold">{t.value}</p>
          </div>
        ))}
      </div>

      {stats.awaitingFulfilment > 0 && (
        <Link href="/admin/orders?status=PAID" className="block rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          {stats.awaitingFulfilment} paid order{stats.awaitingFulfilment === 1 ? "" : "s"} awaiting shipment →
        </Link>
      )}

      <div className="card p-5">
        <h2 className="font-semibold">Revenue, last 14 days</h2>
        <div className="mt-6 flex h-48 items-end gap-1.5" role="img" aria-label="Daily revenue bar chart">
          {stats.daily.map((d) => (
            <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className="rounded-t bg-brand/80 transition group-hover:bg-brand"
                style={{ height: `${Math.max(2, (d.revenueCents / max) * 100)}%` }}
              />
              <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-stone-900 px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
                {d.date.slice(5)}: {formatPrice(d.revenueCents)} · {d.orders} orders
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-stone-500">
          <span>{stats.daily[0]?.date.slice(5)}</span>
          <span>{stats.daily.at(-1)?.date.slice(5)}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold">Top products</h2>
          {stats.topProducts.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">No sales yet.</p>
          ) : (
            <ol className="mt-3 space-y-2 text-sm">
              {stats.topProducts.map((p) => (
                <li key={p.name} className="flex justify-between"><span>{p.name}</span><span className="text-stone-500">{p.quantity} sold</span></li>
              ))}
            </ol>
          )}
        </div>
        <div className="card p-5">
          <h2 className="font-semibold">Low stock (≤ 5)</h2>
          {stats.lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">All products are well stocked.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <Link href={`/admin/products/${p.id}`} className="hover:text-brand">{p.name}</Link>
                  <span className="text-red-600">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
