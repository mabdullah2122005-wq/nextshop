import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { wishlistSchema } from "@/lib/validators";
import { jsonError, zodError } from "@/lib/api";

// GET /api/wishlist — product ids in the signed-in user's wishlist.
export async function GET() {
  const session = await auth();
  if (!session?.user) return jsonError("Unauthorized", 401);
  const items = await prisma.wishlistItem.findMany({ where: { userId: session.user.id }, select: { productId: true } });
  return NextResponse.json(items.map((i) => i.productId));
}

// POST /api/wishlist — toggle a product; returns { wished }.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return jsonError("Please sign in to save favourites", 401);
  const parsed = wishlistSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return zodError(parsed.error);

  const key = { userId_productId: { userId: session.user.id, productId: parsed.data.productId } };
  const existing = await prisma.wishlistItem.findUnique({ where: key });
  if (existing) {
    await prisma.wishlistItem.delete({ where: key });
    return NextResponse.json({ wished: false });
  }
  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } });
  if (!product) return jsonError("Not found", 404);
  await prisma.wishlistItem.create({ data: { userId: session.user.id, productId: product.id } });
  return NextResponse.json({ wished: true });
}
