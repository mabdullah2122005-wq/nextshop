import { auth } from "@/auth";
import { prisma } from "./prisma";

// Product ids the current visitor has wishlisted (empty set for guests).
export async function getWishlistIds() {
  const session = await auth();
  if (!session?.user) return new Set<string>();
  const items = await prisma.wishlistItem.findMany({ where: { userId: session.user.id }, select: { productId: true } });
  return new Set(items.map((i) => i.productId));
}
