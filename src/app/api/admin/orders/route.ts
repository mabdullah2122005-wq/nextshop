import { NextResponse } from "next/server";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/api";

// GET /api/admin/orders?status= — latest orders.
export async function GET(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const status = new URL(req.url).searchParams.get("status") as OrderStatus | null;
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });
  return NextResponse.json(orders);
}
