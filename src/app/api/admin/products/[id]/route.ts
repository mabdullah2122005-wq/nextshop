import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { jsonError, requireAdminApi, zodError } from "@/lib/api";
import { slugify } from "@/lib/format";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/products/:id — update a product.
export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const { id } = await params;

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);

  const data = { ...parsed.data, slug: parsed.data.slug || slugify(parsed.data.name), categoryId: parsed.data.categoryId || null };
  const clash = await prisma.product.findFirst({ where: { slug: data.slug, NOT: { id } } });
  if (clash) return jsonError("Slug already in use", 409);

  const product = await prisma.product.update({ where: { id }, data }).catch(() => null);
  if (!product) return jsonError("Not found", 404);
  return NextResponse.json(product);
}

// DELETE /api/admin/products/:id — products with order history are archived instead of deleted.
export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const { id } = await params;

  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (used > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ archived: true });
  }
  await prisma.product.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ deleted: true });
}
