import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn">New product</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 text-left text-stone-500">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50">
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-brand">{p.name}</Link>
                </td>
                <td className="p-3 text-stone-600">{p.category?.name ?? "—"}</td>
                <td className="p-3">{formatPrice(p.priceCents)}</td>
                <td className={`p-3 ${p.stock <= 5 ? "text-red-600" : ""}`}>{p.stock}</td>
                <td className="p-3">{p.active ? "Active" : <span className="text-stone-400">Hidden</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-center text-stone-500">No products yet.</p>}
      </div>
    </div>
  );
}
