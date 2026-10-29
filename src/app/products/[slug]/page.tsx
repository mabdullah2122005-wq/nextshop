import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";

const getProduct = cache((slug: string) =>
  prisma.product.findFirst({ where: { slug, active: true }, include: { category: true } }),
);

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: [product.imageUrl] },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  return (
    <div className="container-page py-10">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/products" className="hover:text-brand">Shop</Link>
        {product.category && (
          <>
            {" / "}
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand">{product.category.name}</Link>
          </>
        )}
      </nav>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
          <Image src={product.imageUrl} alt={product.name} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-brand">{formatPrice(product.priceCents)}</p>
          <p className="mt-2 text-sm text-stone-500">
            {product.stock > 5 ? "In stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of stock"}
          </p>
          <p className="mt-6 leading-relaxed whitespace-pre-line text-stone-700">{product.description}</p>
          <div className="mt-8">
            <AddToCartButton
              stock={product.stock}
              product={{ productId: product.id, slug: product.slug, name: product.name, priceCents: product.priceCents, imageUrl: product.imageUrl }}
            />
          </div>
          <ul className="mt-8 space-y-1 text-sm text-stone-500">
            <li>✓ Secure checkout with Stripe</li>
            <li>✓ Order confirmation by email</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
