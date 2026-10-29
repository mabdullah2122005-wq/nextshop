import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice, shortId } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, status: { not: "PENDING" } },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight">My account</h1>
      <p className="mt-1 text-stone-600">{session.user.name} · {session.user.email}</p>

      <h2 className="mt-10 mb-4 text-xl font-semibold">Order history</h2>
      {orders.length === 0 ? (
        <p className="text-stone-500">You haven’t placed any orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{shortId(o.id)}</p>
                  <p className="text-sm text-stone-500">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="font-semibold">{formatPrice(o.totalCents)}</span>
                </div>
              </div>
              <ul className="mt-3 text-sm text-stone-600">
                {o.items.map((i) => <li key={i.id}>{i.name} × {i.quantity}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
