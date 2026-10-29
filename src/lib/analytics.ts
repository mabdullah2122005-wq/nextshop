import { prisma } from "./prisma";

const PAID_STATUSES = ["PAID", "SHIPPED", "DELIVERED"] as const;

// Aggregates used by the admin dashboard and GET /api/admin/stats.
export async function getStoreStats(days = 14) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const [revenue, paidOrders, pendingOrders, customers, lowStock, recentPaid, topItems, subscribers, recentOrders] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: { in: [...PAID_STATUSES] } } }),
    prisma.order.count({ where: { status: { in: [...PAID_STATUSES] } } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.findMany({ where: { active: true, stock: { lte: 5 } }, select: { id: true, name: true, stock: true }, take: 10 }),
    prisma.order.findMany({
      where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: since } },
      select: { createdAt: true, totalCents: true },
    }),
    prisma.orderItem.groupBy({
      by: ["name"],
      where: { order: { status: { in: [...PAID_STATUSES] } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.newsletterSubscriber.count(),
    prisma.order.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, totalCents: true, status: true, createdAt: true },
    }),
  ]);

  const daily = Array.from({ length: days }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return { date: d.toISOString().slice(0, 10), revenueCents: 0, orders: 0 };
  });
  for (const o of recentPaid) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    const bucket = daily.find((b) => b.date === key);
    if (bucket) {
      bucket.revenueCents += o.totalCents;
      bucket.orders += 1;
    }
  }

  const revenueCents = revenue._sum.totalCents ?? 0;
  return {
    revenueCents,
    paidOrders,
    awaitingFulfilment: pendingOrders,
    customers,
    subscribers,
    recentOrders,
    averageOrderCents: paidOrders ? Math.round(revenueCents / paidOrders) : 0,
    lowStock,
    daily,
    topProducts: topItems.map((t) => ({ name: t.name, quantity: t._sum.quantity ?? 0 })),
  };
}
