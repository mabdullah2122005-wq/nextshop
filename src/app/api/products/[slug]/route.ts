import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api";

// GET /api/products/:slug — public product detail.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: { category: { select: { name: true, slug: true } } },
  });
  if (!product) return jsonError("Not found", 404);
  return NextResponse.json(product);
}
