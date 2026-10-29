import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validators";
import { jsonError, zodError } from "@/lib/api";

type Ctx = { params: Promise<{ slug: string }> };

// GET /api/products/:slug/reviews — latest reviews for a product.
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const reviews = await prisma.review.findMany({
    where: { product: { slug } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, rating: true, title: true, body: true, createdAt: true, user: { select: { name: true } } },
  });
  return NextResponse.json(reviews);
}

// POST /api/products/:slug/reviews — create or update the signed-in user's review.
export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session?.user) return jsonError("Please sign in to leave a review", 401);
  const { slug } = await params;

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);

  const product = await prisma.product.findFirst({ where: { slug, active: true }, select: { id: true } });
  if (!product) return jsonError("Not found", 404);

  const data = { rating: parsed.data.rating, title: parsed.data.title || null, body: parsed.data.body };
  const review = await prisma.$transaction(async (tx) => {
    const r = await tx.review.upsert({
      where: { userId_productId: { userId: session.user.id, productId: product.id } },
      update: data,
      create: { ...data, userId: session.user.id, productId: product.id },
    });
    const agg = await tx.review.aggregate({ where: { productId: product.id }, _avg: { rating: true }, _count: true });
    await tx.product.update({ where: { id: product.id }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });
    return r;
  });

  return NextResponse.json(review, { status: 201 });
}
