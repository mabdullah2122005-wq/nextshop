import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <section className="bg-brand text-white">
        <div className="container-page grid gap-6 py-20 sm:py-28">
          <p className="text-sm tracking-widest text-white/70 uppercase">New season</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Well-made essentials for everyday life.</h1>
          <p className="max-w-xl text-white/80">Thoughtfully designed products, fair prices and fast, tracked delivery.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="btn bg-accent hover:bg-accent/90">Shop now</Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-page mt-12">
          <h2 className="mb-4 text-xl font-semibold">Shop by category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link key={c.id} href={`/products?category=${c.slug}`} className="btn-outline">{c.name}</Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Featured</h2>
          <Link href="/products" className="text-sm text-brand hover:underline">View all →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-stone-500">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </>
  );
}
