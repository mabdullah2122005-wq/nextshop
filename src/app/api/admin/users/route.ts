import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/api";

// GET /api/admin/users — user list (password hashes are never selected).
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } },
  });
  return NextResponse.json(users);
}
