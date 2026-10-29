import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderStatusSchema } from "@/lib/validators";
import { jsonError, requireAdminApi, zodError } from "@/lib/api";
import { sendShippingUpdate } from "@/lib/email";

// PATCH /api/admin/orders/:id — change fulfilment status; notifies the customer on ship/deliver.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const { id } = await params;

  const parsed = orderStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);

  const order = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } }).catch(() => null);
  if (!order) return jsonError("Not found", 404);

  if (order.status === "SHIPPED" || order.status === "DELIVERED") {
    await sendShippingUpdate(order.email, order.id, order.status);
  }
  return NextResponse.json(order);
}
