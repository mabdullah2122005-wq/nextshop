import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { couponSchema } from "@/lib/validators";
import { jsonError, requireAdminApi, zodError } from "@/lib/api";

// GET /api/admin/coupons — all discount codes.
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  return NextResponse.json(await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }));
}

// POST /api/admin/coupons — create a discount code.
export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const parsed = couponSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);
  if (await prisma.coupon.findUnique({ where: { code: parsed.data.code } })) return jsonError("That code already exists", 409);
  return NextResponse.json(await prisma.coupon.create({ data: parsed.data }), { status: 201 });
}
