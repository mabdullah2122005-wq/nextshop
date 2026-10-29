import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = { title: "Shop" };

const PAGE_SIZE = 12;

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "new";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(q && { name: { contains: q, mode: "insensitive" } }),
    ...(category && { category: { slug: category } }),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc" ? { priceCents: "asc" } : sort === "price-desc" ? { priceCents: "desc" } : { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { category: { select: { name: true } } } }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (overrides: Record<string, string | number>) => {
    const params = new URLSearchParams({ ...(q && { q }), ...(category && { category }), ...(sort !== "new" && { sort }) });
    for (const [k, v] of Object.entries(overrides)) {
      if (v === "" || (k === "page" && v === 1)) params.delete(k);
      else params.set(k, String(v));
    }
    const s = params.toString();
    return s ? `/products?${s}` : "/products";
  };

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/products">
        <input name="q" defaultValue={q} placeholder="Search products…" className="input sm:max-w-xs" />
        <select name="category" defaultValue={category} className="input sm:max-w-48">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select name="sort" defaultValue={sort} className="input sm:max-w-48">
          <option value="new">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
        <button className="btn">Apply</button>
      </form>

      <p className="mt-6 text-sm text-stone-500">{total} product{total === 1 ? "" : "s"}</p>
      {products.length === 0 ? (
        <p className="mt-8 text-stone-500">No products match your filters.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={href({ page: n })}
              className={`grid h-9 w-9 place-items-center rounded-lg border text-sm ${n === page ? "border-brand bg-brand text-white" : "border-stone-300 bg-white"}`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
