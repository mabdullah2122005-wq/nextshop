"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Category = { id: string; name: string };
type Initial = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  compareAtCents: number | null;
  imageUrl: string;
  stock: number;
  active: boolean;
  featured: boolean;
  categoryId: string | null;
};

const empty: Initial = { name: "", slug: "", description: "", priceCents: 0, compareAtCents: null, imageUrl: "", stock: 0, active: true, featured: false, categoryId: null };

export function ProductForm({ categories, initial = empty }: { categories: Category[]; initial?: Initial }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial.id);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const body = {
      name: f.get("name"),
      slug: f.get("slug"),
      description: f.get("description"),
      priceCents: Math.round(Number(f.get("price")) * 100),
      compareAtCents: f.get("compareAt") ? Math.round(Number(f.get("compareAt")) * 100) : null,
      imageUrl: f.get("imageUrl"),
      stock: Number(f.get("stock")),
      active: f.get("active") === "on",
      featured: f.get("featured") === "on",
      categoryId: f.get("categoryId") || null,
    };
    const res = await fetch(isEdit ? `/api/admin/products/${initial.id}` : "/api/admin/products", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Save failed");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function onDelete() {
    if (!initial.id || !confirm("Delete this product? Products with orders will be hidden instead.")) return;
    await fetch(`/api/admin/products/${initial.id}`, { method: "DELETE" });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card grid max-w-2xl gap-4 p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={initial.name} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="slug">Slug <span className="font-normal text-ink/40">(auto if blank)</span></label>
          <input id="slug" name="slug" defaultValue={initial.slug} pattern="[a-z0-9-]*" className="input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={initial.description} required rows={5} className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="price">Price</label>
          <input id="price" name="price" type="number" step="0.01" min="0.5" defaultValue={initial.priceCents ? initial.priceCents / 100 : ""} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="compareAt">Compare-at price <span className="font-normal text-ink/40">(optional, shows as sale)</span></label>
          <input id="compareAt" name="compareAt" type="number" step="0.01" min="0" defaultValue={initial.compareAtCents ? initial.compareAtCents / 100 : ""} className="input" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="stock">Stock</label>
          <input id="stock" name="stock" type="number" min="0" defaultValue={initial.stock} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" defaultValue={initial.categoryId ?? ""} className="input">
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="imageUrl">Image URL</label>
        <input id="imageUrl" name="imageUrl" type="url" defaultValue={initial.imageUrl} required className="input" />
      </div>
      <div className="flex flex-col gap-1 text-sm sm:flex-row sm:gap-6">
        <label className="flex items-center gap-3 py-2"><input type="checkbox" name="active" defaultChecked={initial.active} className="h-5 w-5 accent-brand" /> Visible in store</label>
        <label className="flex items-center gap-3 py-2"><input type="checkbox" name="featured" defaultChecked={initial.featured} className="h-5 w-5 accent-brand" /> Featured on home page</label>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isEdit && <button type="button" onClick={onDelete} className="rounded-full py-3 text-sm text-red-600 hover:bg-red-50 sm:order-2 sm:px-4">Delete product</button>}
        <button disabled={saving} className="btn sm:order-1">{saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}</button>
      </div>
    </form>
  );
}
