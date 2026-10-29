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
  imageUrl: string;
  stock: number;
  active: boolean;
  featured: boolean;
  categoryId: string | null;
};

const empty: Initial = { name: "", slug: "", description: "", priceCents: 0, imageUrl: "", stock: 0, active: true, featured: false, categoryId: null };

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
    <form onSubmit={onSubmit} className="card grid max-w-2xl gap-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={initial.name} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="slug">Slug <span className="font-normal text-stone-400">(auto if blank)</span></label>
          <input id="slug" name="slug" defaultValue={initial.slug} pattern="[a-z0-9-]*" className="input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={initial.description} required rows={5} className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="price">Price</label>
          <input id="price" name="price" type="number" step="0.01" min="0.5" defaultValue={initial.priceCents ? initial.priceCents / 100 : ""} required className="input" />
        </div>
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
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={initial.active} /> Visible in store</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={initial.featured} /> Featured on home page</label>
      </div>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <div className="flex justify-between">
        <button disabled={saving} className="btn">{saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}</button>
        {isEdit && <button type="button" onClick={onDelete} className="text-sm text-red-600 hover:underline">Delete</button>}
      </div>
    </form>
  );
}
