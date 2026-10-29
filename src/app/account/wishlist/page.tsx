import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session!.user.id, product: { active: true } },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { category: { select: { name: true } } } } },
  });

  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center p-16 text-center">
        <p className="heading text-2xl">Your wishlist is empty</p>
        <p className="mt-2 text-ink/60">Tap the ♡ on any product to save it for later.</p>
        <Link href="/products" className="btn mt-6">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {items.map((i) => <ProductCard key={i.productId} product={i.product} wished />)}
    </div>
  );
}
