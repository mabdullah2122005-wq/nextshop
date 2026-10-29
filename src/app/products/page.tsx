import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getWishlistIds } from "@/lib/wishlist";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = { title: "Shop" };

const PAGE_SIZE = 12;
const SORTS = [
  ["featured", "Featured"],
  ["new", "Newest"],
  ["rating", "Top rated"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
] as const;

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim() : "");
  const q = str("q");
  const category = str("category");
  const sale = str("sale") === "1";
  const inStock = str("stock") === "1";
  const sort = str("sort") || "featured";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(q && { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }),
    ...(category && { category: { slug: category } }),
    ...(sale && { compareAtCents: { not: null } }),
    ...(inStock && { stock: { gt: 0 } }),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "price-asc" ? [{ priceCents: "asc" }]
    : sort === "price-desc" ? [{ priceCents: "desc" }]
    : sort === "new" ? [{ createdAt: "desc" }]
    : sort === "rating" ? [{ ratingAvg: "desc" }, { ratingCount: "desc" }]
    : [{ featured: "desc" }, { ratingCount: "desc" }];

  const [products, total, categories, wished] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { category: { select: { name: true } } } }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getWishlistIds(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCategory = categories.find((c) => c.slug === category);

  const href = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    const current: Record<string, string> = { q, category, sort: sort === "featured" ? "" : sort, sale: sale ? "1" : "", stock: inStock ? "1" : "" };
    for (const [k, v] of Object.entries({ ...current, ...overrides })) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/products?${s}` : "/products";
  };

  const title = q ? `Results for “${q}”` : sale ? "Sale" : activeCategory?.name ?? "Shop all";

  return (
    <div className="container-page py-12">
      <div className="mb-10 border-b border-ink/8 pb-8">
        <nav className="mb-3 text-sm text-ink/50"><Link href="/" className="hover:text-ink">Home</Link> / <span>Shop</span></nav>
        <h1 className="heading text-5xl">{title}</h1>
        <p className="mt-2 text-ink/60">{total} product{total === 1 ? "" : "s"}</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-8 text-sm">
          <form action="/products" className="lg:hidden">
            <input name="q" defaultValue={q} placeholder="Search…" className="input" />
          </form>
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-ink/50 uppercase">Category</p>
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              <li><Link href={href({ category: "", page: "" })} className={`block rounded-full px-3 py-1.5 lg:rounded-lg ${!category ? "bg-ink text-white" : "bg-white hover:bg-sand lg:bg-transparent"}`}>All</Link></li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={href({ category: c.slug, page: "" })} className={`block rounded-full px-3 py-1.5 lg:rounded-lg ${category === c.slug ? "bg-ink text-white" : "bg-white hover:bg-sand lg:bg-transparent"}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-ink/50 uppercase">Filter</p>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              <Link href={href({ sale: sale ? "" : "1", page: "" })} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${sale ? "font-medium text-accent" : "hover:bg-sand"}`}>
                <span className={`grid h-4 w-4 place-items-center rounded border ${sale ? "border-accent bg-accent text-white" : "border-ink/30"}`}>{sale && "✓"}</span> On sale
              </Link>
              <Link href={href({ stock: inStock ? "" : "1", page: "" })} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${inStock ? "font-medium text-brand" : "hover:bg-sand"}`}>
                <span className={`grid h-4 w-4 place-items-center rounded border ${inStock ? "border-brand bg-brand text-white" : "border-ink/30"}`}>{inStock && "✓"}</span> In stock only
              </Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.15em] text-ink/50 uppercase">Sort by</p>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {SORTS.map(([value, label]) => (
                <Link key={value} href={href({ sort: value === "featured" ? "" : value, page: "" })} className={`rounded-lg px-3 py-1.5 ${sort === value ? "bg-sand font-medium" : "hover:bg-sand"}`}>{label}</Link>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {products.length === 0 ? (
            <div className="card flex flex-col items-center p-16 text-center">
              <p className="heading text-2xl">Nothing found</p>
              <p className="mt-2 text-ink/60">Try a different search or clear your filters.</p>
              <Link href="/products" className="btn mt-6">Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              {products.map((p, i) => <ProductCard key={p.id} product={p} wished={wished.has(p.id)} priority={i < 3} />)}
            </div>
          )}

          {pages > 1 && (
            <nav className="mt-14 flex justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={href({ page: n === 1 ? "" : String(n) })}
                  aria-current={n === page ? "page" : undefined}
                  className={`grid h-10 w-10 place-items-center rounded-full text-sm ${n === page ? "bg-ink text-white" : "bg-white hover:bg-sand"}`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
