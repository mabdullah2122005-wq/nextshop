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
  const activeFilters = (sale ? 1 : 0) + (inStock ? 1 : 0) + (sort !== "featured" ? 1 : 0);

  const filterLinks = (
    <>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-[0.15em] text-ink/50 uppercase">Filter</p>
        <div className="flex flex-col gap-1">
          <Link href={href({ sale: sale ? "" : "1", page: "" })} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${sale ? "font-medium text-accent" : "hover:bg-sand"}`}>
            <span className={`grid h-5 w-5 place-items-center rounded border text-xs ${sale ? "border-accent bg-accent text-white" : "border-ink/30 bg-white"}`}>{sale && "✓"}</span> On sale
          </Link>
          <Link href={href({ stock: inStock ? "" : "1", page: "" })} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${inStock ? "font-medium text-brand" : "hover:bg-sand"}`}>
            <span className={`grid h-5 w-5 place-items-center rounded border text-xs ${inStock ? "border-brand bg-brand text-white" : "border-ink/30 bg-white"}`}>{inStock && "✓"}</span> In stock only
          </Link>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-[0.15em] text-ink/50 uppercase">Sort by</p>
        <div className="flex flex-col gap-1">
          {SORTS.map(([value, label]) => (
            <Link key={value} href={href({ sort: value === "featured" ? "" : value, page: "" })} className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${sort === value ? "bg-sand font-medium" : "hover:bg-sand"}`}>
              {label} {sort === value && <span aria-hidden>✓</span>}
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  const categoryLinks = [{ slug: "", name: "All" }, ...categories].map((c) => (
    <Link
      key={c.slug || "all"}
      href={href({ category: c.slug, page: "" })}
      aria-current={category === c.slug ? "page" : undefined}
      className={`shrink-0 rounded-full px-4 py-2 text-sm whitespace-nowrap lg:rounded-lg lg:px-3 ${category === c.slug ? "bg-ink text-white" : "bg-white hover:bg-sand lg:bg-transparent"}`}
    >
      {c.name}
    </Link>
  ));

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 border-b border-ink/8 pb-6 sm:mb-10 sm:pb-8">
        <nav className="mb-2 text-sm text-ink/50"><Link href="/" className="hover:text-ink">Home</Link> / <span>Shop</span></nav>
        <h1 className="heading text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-2 text-ink/60">{total} product{total === 1 ? "" : "s"}</p>
      </div>

      {/* Mobile: scrollable category chips + collapsible filter/sort panel */}
      <div className="mb-6 space-y-3 lg:hidden">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6">{categoryLinks}</div>
        <details className="group rounded-2xl border border-ink/10 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium">
            <span>Filter & sort{activeFilters > 0 && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">{activeFilters}</span>}</span>
            <span className="text-lg text-ink/50 transition group-open:rotate-45" aria-hidden>+</span>
          </summary>
          <div className="grid gap-5 border-t border-ink/8 p-4 text-sm sm:grid-cols-2">{filterLinks}</div>
        </details>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden space-y-8 text-sm lg:block">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.15em] text-ink/50 uppercase">Category</p>
            <div className="flex flex-col gap-1">{categoryLinks}</div>
          </div>
          {filterLinks}
        </aside>

        <div>
          {products.length === 0 ? (
            <div className="card flex flex-col items-center p-16 text-center">
              <p className="heading text-2xl">Nothing found</p>
              <p className="mt-2 text-ink/60">Try a different search or clear your filters.</p>
              <Link href="/products" className="btn mt-6">Clear filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3">
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
