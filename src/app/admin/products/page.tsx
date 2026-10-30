import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { StarRating } from "@/components/StarRating";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: [{ active: "desc" }, { createdAt: "desc" }], include: { category: true } });
  const stockClass = (n: number) => (n === 0 ? "text-red-600" : n <= 5 ? "text-accent" : "");
  const badges = (p: (typeof products)[number]) => (
    <>
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.active ? "bg-green-50 text-green-700" : "bg-ink/5 text-ink/50"}`}>{p.active ? "Live" : "Hidden"}</span>
      {p.featured && <span className="ml-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">Featured</span>}
    </>
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading text-3xl sm:text-4xl">Products</h1>
          <p className="mt-1 text-ink/60">{products.filter((p) => p.active).length} live · {products.filter((p) => !p.active).length} hidden</p>
        </div>
        <Link href="/admin/products/new" className="btn">+ New product</Link>
      </div>

      {/* Phones: compact list */}
      <ul className="card divide-y divide-ink/5 lg:hidden">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 p-3 active:bg-cream">
              <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                <Image src={p.imageUrl} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{p.name}</span>
                <span className="block text-sm">
                  {formatPrice(p.priceCents)} · <span className={stockClass(p.stock)}>{p.stock} in stock</span>
                </span>
                <span className="mt-1 block">{badges(p)}</span>
              </span>
              <span className="text-ink/30" aria-hidden>›</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="card hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/8 text-left text-ink/50">
            <tr>
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Rating</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-cream/60">
                <td className="p-4">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 font-medium hover:text-brand">
                    <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-sand">
                      <Image src={p.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    {p.name}
                  </Link>
                </td>
                <td className="p-4 text-ink/60">{p.category?.name ?? "—"}</td>
                <td className="p-4 whitespace-nowrap">
                  {formatPrice(p.priceCents)}
                  {p.compareAtCents && p.compareAtCents > p.priceCents && <span className="ml-2 text-xs text-ink/40 line-through">{formatPrice(p.compareAtCents)}</span>}
                </td>
                <td className={`p-4 font-medium ${stockClass(p.stock)}`}>{p.stock}</td>
                <td className="p-4">{p.ratingCount ? <StarRating value={p.ratingAvg} count={p.ratingCount} size="h-3.5 w-3.5" /> : <span className="text-ink/30">—</span>}</td>
                <td className="p-4 whitespace-nowrap">{badges(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <p className="card p-8 text-center text-ink/50">No products yet.</p>}
    </div>
  );
}
