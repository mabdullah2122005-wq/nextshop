import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, requireAdminApi, zodError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/coupons/:id — enable/disable a code.
export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const { id } = await params;
  const parsed = z.object({ active: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);
  const coupon = await prisma.coupon.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!coupon) return jsonError("Not found", 404);
  return NextResponse.json(coupon);
}

// DELETE /api/admin/coupons/:id
export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const { id } = await params;
  await prisma.coupon.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ deleted: true });
}
