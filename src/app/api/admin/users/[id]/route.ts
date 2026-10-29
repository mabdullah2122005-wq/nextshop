import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userRoleSchema } from "@/lib/validators";
import { jsonError, requireAdminApi, zodError } from "@/lib/api";

// PATCH /api/admin/users/:id — promote/demote a user.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const { id } = await params;

  const parsed = userRoleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);
  if (id === guard.session.user.id) return jsonError("You cannot change your own role", 400);

  const user = await prisma.user
    .update({ where: { id }, data: { role: parsed.data.role }, select: { id: true, role: true } })
    .catch(() => null);
  if (!user) return jsonError("Not found", 404);
  return NextResponse.json(user);
}
