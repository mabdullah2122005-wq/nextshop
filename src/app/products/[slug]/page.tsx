import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWishlistIds } from "@/lib/wishlist";
import { formatDate, formatPrice, formatPriceShort } from "@/lib/format";
import { FREE_SHIPPING_CENTS } from "@/lib/shipping";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import { WishlistButton } from "@/components/WishlistButton";
import { StickyBuyBar } from "@/components/StickyBuyBar";
import { ReturnIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { ReviewForm } from "./ReviewForm";

const getProduct = cache((slug: string) =>
  prisma.product.findFirst({ where: { slug, active: true }, include: { category: true } }),
);

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Not found" };
  return { title: product.name, description: product.description.slice(0, 160), openGraph: { images: [product.imageUrl] } };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();

  const session = await auth();
  const [reviews, related, wished, myReview] = await Promise.all([
    prisma.review.findMany({ where: { productId: product.id }, orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true } } } }),
    prisma.product.findMany({
      where: { active: true, categoryId: product.categoryId, NOT: { id: product.id } },
      take: 4,
      orderBy: { ratingCount: "desc" },
      include: { category: { select: { name: true } } },
    }),
    getWishlistIds(),
    session?.user ? prisma.review.findUnique({ where: { userId_productId: { userId: session.user.id, productId: product.id } } }) : null,
  ]);

  const onSale = product.compareAtCents && product.compareAtCents > product.priceCents;
  const cartProduct = { productId: product.id, slug: product.slug, name: product.name, priceCents: product.priceCents, imageUrl: product.imageUrl };
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));

  // Structured data for Google rich results (price, stock, rating).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageUrl,
    description: product.description,
    offers: {
      "@type": "Offer",
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: process.env.NEXT_PUBLIC_CURRENCY ?? "USD",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.ratingCount > 0 && { aggregateRating: { "@type": "AggregateRating", ratingValue: product.ratingAvg.toFixed(1), reviewCount: product.ratingCount } }),
  };

  return (
    <div className="container-page py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="mb-5 text-sm text-ink/50 sm:mb-8">
        <Link href="/" className="hover:text-ink">Home</Link> / <Link href="/products" className="hover:text-ink">Shop</Link>
        {product.category && <> / <Link href={`/products?category=${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link></>}
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-sand lg:sticky lg:top-28 lg:self-start">
          <Image src={product.imageUrl} alt={product.name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          {onSale && <span className="absolute top-5 left-5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white">Sale</span>}
        </div>

        <div className="lg:py-4">
          {product.category && <p className="eyebrow">{product.category.name}</p>}
          <h1 className="heading mt-2 text-[34px] leading-tight sm:mt-3 sm:text-5xl">{product.name}</h1>
          {product.ratingCount > 0 && (
            <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm hover:underline">
              <StarRating value={product.ratingAvg} /> {product.ratingAvg.toFixed(1)} · {product.ratingCount} review{product.ratingCount === 1 ? "" : "s"}
            </a>
          )}
          <p className="mt-6 flex items-baseline gap-3">
            <span className={`text-3xl font-semibold ${onSale ? "text-accent" : ""}`}>{formatPrice(product.priceCents)}</span>
            {onSale && (
              <>
                <span className="text-lg text-ink/40 line-through">{formatPrice(product.compareAtCents!)}</span>
                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">Save {formatPrice(product.compareAtCents! - product.priceCents)}</span>
              </>
            )}
          </p>
          <p className="mt-6 text-lg leading-relaxed whitespace-pre-line text-ink/70">{product.description}</p>

          <p className={`mt-6 flex items-center gap-2 text-sm font-medium ${product.stock === 0 ? "text-red-600" : product.stock <= 5 ? "text-accent" : "text-brand"}`}>
            <span className={`h-2 w-2 rounded-full ${product.stock === 0 ? "bg-red-600" : product.stock <= 5 ? "bg-accent" : "bg-brand"}`} />
            {product.stock === 0 ? "Out of stock" : product.stock <= 5 ? `Low stock — only ${product.stock} left` : "In stock, ready to ship"}
          </p>

          <div id="buy-box" className="mt-6 space-y-3">
            <AddToCartButton stock={product.stock} product={cartProduct} />
            <WishlistButton productId={product.id} initial={wished.has(product.id)} variant="button" />
          </div>
          <StickyBuyBar product={cartProduct} stock={product.stock} targetId="buy-box" />

          <ul className="mt-10 divide-y divide-ink/8 rounded-2xl border border-ink/8 bg-white text-sm">
            <li className="flex gap-3 p-4"><TruckIcon className="h-5 w-5 text-brand" /> Free shipping on orders over {formatPriceShort(FREE_SHIPPING_CENTS)}</li>
            <li className="flex gap-3 p-4"><ReturnIcon className="h-5 w-5 text-brand" /> Free 30-day returns</li>
            <li className="flex gap-3 p-4"><ShieldIcon className="h-5 w-5 text-brand" /> Secure checkout with Stripe</li>
          </ul>
        </div>
      </div>

      <section id="reviews" className="mt-16 scroll-mt-24 border-t border-ink/8 pt-12 sm:mt-24 sm:pt-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12">
          <div>
            <h2 className="heading text-3xl">Customer reviews</h2>
            {product.ratingCount > 0 ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <span className="heading text-5xl">{product.ratingAvg.toFixed(1)}</span>
                  <div><StarRating value={product.ratingAvg} size="h-5 w-5" /><p className="text-sm text-ink/50">{product.ratingCount} reviews</p></div>
                </div>
                <ul className="mt-6 space-y-2 text-sm">
                  {distribution.map((d) => (
                    <li key={d.star} className="flex items-center gap-3">
                      <span className="w-8">{d.star}★</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
                        <span className="block h-full rounded-full bg-gold" style={{ width: `${reviews.length ? (d.count / reviews.length) * 100 : 0}%` }} />
                      </span>
                      <span className="w-6 text-right text-ink/50">{d.count}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 text-ink/60">No reviews yet — be the first!</p>
            )}
            <div className="mt-8">
              {session?.user ? (
                <ReviewForm slug={product.slug} existing={myReview ? { rating: myReview.rating, title: myReview.title ?? "", body: myReview.body } : null} />
              ) : (
                <Link href={`/login?callbackUrl=/products/${product.slug}%23reviews`} className="btn-outline w-full">Sign in to write a review</Link>
              )}
            </div>
          </div>
          <ul className="divide-y divide-ink/8">
            {reviews.map((r) => (
              <li key={r.id} className="py-6 first:pt-0">
                <div className="flex items-center justify-between gap-4">
                  <StarRating value={r.rating} />
                  <span className="text-xs text-ink/40">{formatDate(r.createdAt)}</span>
                </div>
                {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
                <p className="mt-1 leading-relaxed text-ink/70">{r.body}</p>
                <p className="mt-3 text-sm text-ink/50">{r.user.name ?? "Customer"}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16 sm:mt-24">
          <h2 className="heading mb-6 text-3xl sm:mb-8">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} wished={wished.has(p.id)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
