import Link from "next/link";
import { getStoreStats } from "@/lib/analytics";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata = { title: "Admin dashboard" };

export default async function AdminDashboard() {
  const stats = await getStoreStats(14);
  const max = Math.max(1, ...stats.daily.map((d) => d.revenueCents));
  const last14 = stats.daily.reduce((s, d) => s + d.revenueCents, 0);

  const tiles = [
    { label: "Total revenue", value: formatPrice(stats.revenueCents), sub: `${formatPrice(last14)} last 14 days` },
    { label: "Paid orders", value: stats.paidOrders.toLocaleString(), sub: `${stats.awaitingFulfilment} awaiting shipment` },
    { label: "Avg. order value", value: formatPrice(stats.averageOrderCents), sub: "across paid orders" },
    { label: "Customers", value: stats.customers.toLocaleString(), sub: `${stats.subscribers} newsletter subscribers` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading text-4xl">Dashboard</h1>
          <p className="mt-1 text-ink/60">Here’s how your store is doing.</p>
        </div>
        <Link href="/admin/products/new" className="btn">+ Add product</Link>
      </div>

      {stats.awaitingFulfilment > 0 && (
        <Link href="/admin/orders?status=PAID" className="flex items-center justify-between rounded-2xl bg-accent/10 p-4 text-sm font-medium text-accent">
          <span>📦 {stats.awaitingFulfilment} paid order{stats.awaitingFulfilment === 1 ? "" : "s"} waiting to be shipped</span>
          <span>Fulfil now →</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="card p-5">
            <p className="text-sm text-ink/55">{t.label}</p>
            <p className="heading mt-2 text-3xl">{t.value}</p>
            <p className="mt-1 text-xs text-ink/45">{t.sub}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Revenue · last 14 days</h2>
          <span className="text-sm text-ink/50">{formatPrice(last14)}</span>
        </div>
        <div className="mt-8 flex h-56 items-end gap-1.5" role="img" aria-label="Daily revenue bar chart">
          {stats.daily.map((d) => (
            <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
              <div className="rounded-t-md bg-brand/75 transition group-hover:bg-brand" style={{ height: `${Math.max(2, (d.revenueCents / max) * 100)}%` }} />
              <span className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs whitespace-nowrap text-white group-hover:block">
                {d.date.slice(5)} · {formatPrice(d.revenueCents)} · {d.orders} orders
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink/45">
          <span>{stats.daily[0]?.date.slice(5)}</span>
          <span>Today</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand hover:underline">View all</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-ink/50">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/8 text-sm">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{shortId(o.id)}</p>
                    <p className="truncate text-ink/50">{o.email} · {formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3"><StatusBadge status={o.status} /><span className="font-medium">{formatPrice(o.totalCents)}</span></div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-semibold">Top products</h2>
            {stats.topProducts.length === 0 ? (
              <p className="mt-3 text-sm text-ink/50">No sales yet.</p>
            ) : (
              <ol className="mt-4 space-y-3 text-sm">
                {stats.topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-sand text-xs font-semibold">{i + 1}</span>
                    <span className="flex-1">{p.name}</span>
                    <span className="text-ink/50">{p.quantity} sold</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="card p-6">
            <h2 className="font-semibold">Low stock</h2>
            {stats.lowStock.length === 0 ? (
              <p className="mt-3 text-sm text-ink/50">All products are well stocked. ✓</p>
            ) : (
              <ul className="mt-4 space-y-2.5 text-sm">
                {stats.lowStock.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <Link href={`/admin/products/${p.id}`} className="hover:text-brand">{p.name}</Link>
                    <span className={`font-medium ${p.stock === 0 ? "text-red-600" : "text-accent"}`}>{p.stock === 0 ? "Sold out" : `${p.stock} left`}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
