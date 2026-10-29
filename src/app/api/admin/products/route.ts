import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";
import { jsonError, requireAdminApi, zodError } from "@/lib/api";
import { slugify } from "@/lib/format";

// GET /api/admin/products — all products including inactive.
export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } });
  return NextResponse.json(products);
}

// POST /api/admin/products — create a product.
export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);

  const data = { ...parsed.data, slug: parsed.data.slug || slugify(parsed.data.name), categoryId: parsed.data.categoryId || null };
  if (await prisma.product.findUnique({ where: { slug: data.slug } })) return jsonError("Slug already in use", 409);

  const product = await prisma.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}
