import { prisma } from "@/lib/prisma";
import { describeCoupon } from "@/lib/coupons";
import { formatDate, formatPrice } from "@/lib/format";
import { CouponForm } from "./CouponForm";
import { CouponActions } from "./CouponActions";

export const metadata = { title: "Discounts" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading text-4xl">Discount codes</h1>
        <p className="mt-1 text-ink/60">Codes are validated on the server and applied to Stripe Checkout automatically.</p>
      </div>
      <CouponForm />
      <div className="card overflow-x-auto">
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
            {coupons.map((c) => {
              const expired = c.expiresAt && c.expiresAt < now;
              const exhausted = c.maxUses !== null && c.usedCount >= c.maxUses;
              const status = !c.active ? "Disabled" : expired ? "Expired" : exhausted ? "Used up" : "Active";
              return (
                <tr key={c.id}>
                  <td className="p-4 font-mono font-semibold">{c.code}</td>
                  <td className="p-4">{describeCoupon(c)}</td>
                  <td className="p-4">{c.minOrderCents ? formatPrice(c.minOrderCents) : "—"}</td>
                  <td className="p-4">{c.usedCount}{c.maxUses !== null && ` / ${c.maxUses}`}</td>
                  <td className="p-4">{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status === "Active" ? "bg-green-50 text-green-700" : "bg-ink/5 text-ink/50"}`}>{status}</span>
                  </td>
                  <td className="p-4 text-right"><CouponActions id={c.id} active={c.active} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="p-8 text-center text-ink/50">No discount codes yet.</p>}
      </div>
    </div>
  );
}
