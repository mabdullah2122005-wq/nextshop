import { prisma } from "@/lib/prisma";
import { describeCoupon } from "@/lib/coupons";
import { formatDate, formatPrice } from "@/lib/format";
import { CouponForm } from "./CouponForm";
import { CouponActions } from "./CouponActions";

export const metadata = { title: "Discounts" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();
  const rows = coupons.map((c) => {
    const expired = c.expiresAt && c.expiresAt < now;
    const exhausted = c.maxUses !== null && c.usedCount >= c.maxUses;
    return { ...c, status: !c.active ? "Disabled" : expired ? "Expired" : exhausted ? "Used up" : "Active" };
  });
  const badge = (status: string) => (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "Active" ? "bg-green-50 text-green-700" : "bg-ink/5 text-ink/50"}`}>{status}</span>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading text-3xl sm:text-4xl">Discount codes</h1>
        <p className="mt-1 text-ink/60">Codes are checked on the server and applied to Stripe Checkout automatically.</p>
      </div>
      <CouponForm />

      {rows.length === 0 && <p className="card p-8 text-center text-ink/50">No discount codes yet.</p>}

      <ul className="space-y-3 lg:hidden">
        {rows.map((c) => (
          <li key={c.id} className="card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-lg font-semibold">{c.code}</p>
              {badge(c.status)}
            </div>
            <p className="mt-1 text-sm">
              {describeCoupon(c)}
              {c.minOrderCents > 0 && <> · min. {formatPrice(c.minOrderCents)}</>}
            </p>
            <p className="text-xs text-ink/50">
              Used {c.usedCount}{c.maxUses !== null && ` / ${c.maxUses}`} · {c.expiresAt ? `Expires ${formatDate(c.expiresAt)}` : "Never expires"}
            </p>
            <div className="mt-3 border-t border-ink/8 pt-2"><CouponActions id={c.id} active={c.active} /></div>
          </li>
        ))}
      </ul>

      {rows.length > 0 && (
        <div className="card hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/8 text-left text-ink/50">
              <tr>
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Discount</th>
                <th className="p-4 font-medium">Min. order</th>
                <th className="p-4 font-medium">Used</th>
                <th className="p-4 font-medium">Expires</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="p-4 font-mono font-semibold">{c.code}</td>
                  <td className="p-4">{describeCoupon(c)}</td>
                  <td className="p-4">{c.minOrderCents ? formatPrice(c.minOrderCents) : "—"}</td>
                  <td className="p-4">{c.usedCount}{c.maxUses !== null && ` / ${c.maxUses}`}</td>
                  <td className="p-4">{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</td>
                  <td className="p-4">{badge(c.status)}</td>
                  <td className="p-4"><CouponActions id={c.id} active={c.active} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
