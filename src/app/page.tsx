import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getWishlistIds } from "@/lib/wishlist";
import { formatPriceShort } from "@/lib/format";
import { FREE_SHIPPING_CENTS } from "@/lib/shipping";
import { ProductCard } from "@/components/ProductCard";
import { HeroSlider, type Slide } from "@/components/HeroSlider";
import { StarRating } from "@/components/StarRating";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ChatIcon, ReturnIcon, ShieldIcon, TruckIcon } from "@/components/icons";

const u = (id: string) => `https://images.unsplash.com/${id}?w=2000&q=80&auto=format&fit=crop`;

const slides: Slide[] = [
  { image: u("photo-1490481651871-ab68de25d43d"), eyebrow: "New season", title: "Well-made essentials.", text: "Thoughtfully designed pieces you’ll reach for every day — built to last, priced fairly.", cta: { label: "Shop apparel", href: "/products?category=apparel" } },
  { image: u("photo-1586023492125-27b2c045efd7"), eyebrow: "Home collection", title: "Make it yours.", text: "Lighting, ceramics and furniture that turn a house into a home.", cta: { label: "Shop home", href: "/products?category=home" } },
  { image: u("photo-1441986300917-64674bd600d8"), eyebrow: "Limited time", title: "Up to 20% off.", text: "Selected favourites, marked down for a short while only.", cta: { label: "Shop the sale", href: "/products?sale=1" } },
];

export default async function HomePage() {
  const productInclude = { category: { select: { name: true } } } as const;
  const [featured, newest, categories, reviews, wished] = await Promise.all([
    prisma.product.findMany({ where: { active: true, featured: true }, take: 8, orderBy: { ratingCount: "desc" }, include: productInclude }),
    prisma.product.findMany({ where: { active: true }, take: 4, orderBy: { createdAt: "desc" }, include: productInclude }),
    prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: { where: { active: true } } } } } }),
    prisma.review.findMany({ where: { rating: { gte: 4 } }, take: 3, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } }, product: { select: { name: true, slug: true } } } }),
    getWishlistIds(),
  ]);

  const perks = [
    { icon: TruckIcon, title: "Free shipping", text: `On orders over ${formatPriceShort(FREE_SHIPPING_CENTS)}` },
    { icon: ReturnIcon, title: "30-day returns", text: "Hassle-free" },
    { icon: ShieldIcon, title: "Secure checkout", text: "Powered by Stripe" },
    { icon: ChatIcon, title: "Real support", text: "7 days a week" },
  ];

  return (
    <>
      <HeroSlider slides={slides} />

      <section className="border-b border-ink/8 bg-white">
        <div className="container-page grid grid-cols-2 gap-x-4 gap-y-5 py-6 sm:py-8 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex items-center gap-3">
              <p.icon className="h-6 w-6 shrink-0 text-brand sm:h-7 sm:w-7" />
              <div>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-ink/55">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-14 sm:mt-20">
        <div className="mb-8 text-center">
          <p className="eyebrow">Collections</p>
          <h2 className="heading mt-2 text-3xl sm:text-4xl">Shop by category</h2>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="group relative aspect-[4/5] w-[78%] shrink-0 snap-start overflow-hidden rounded-3xl bg-sand sm:aspect-[3/4] sm:w-auto">
              {c.imageUrl && <Image src={c.imageUrl} alt={c.name} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="heading text-3xl">{c.name}</h3>
                <p className="mt-1 text-sm text-white/80">{c._count.products} products · Shop now →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page mt-16 sm:mt-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Customer favourites</p>
            <h2 className="heading mt-2 text-3xl sm:text-4xl">Best sellers</h2>
          </div>
          <Link href="/products" className="hidden text-sm font-medium underline-offset-4 hover:underline sm:block">View all products →</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} wished={wished.has(p.id)} />)}
        </div>
      </section>

      <section className="mt-16 bg-sand/60 sm:mt-24">
        <div className="container-page grid grid-cols-1 items-center gap-8 py-14 sm:py-20 lg:grid-cols-2 lg:gap-10">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={u("photo-1513694203232-719a280e022f")} alt="A calm, well-furnished living space" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="lg:pl-8">
            <p className="eyebrow">Our story</p>
            <h2 className="heading mt-3 text-3xl leading-tight sm:text-5xl">Fewer, better things.</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/70">
              We work directly with small workshops to make everyday products that are designed to be used, repaired and loved for years —
              not replaced next season. No middlemen, no inflated mark-ups.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-ink/10 pt-8">
              {[["100%", "ethically made"], ["0", "plastic in packaging"], ["30", "day free returns"]].map(([n, l]) => (
                <div key={l}><p className="heading text-3xl text-brand">{n}</p><p className="text-sm text-ink/60">{l}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-16 sm:mt-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Just landed</p>
            <h2 className="heading mt-2 text-3xl sm:text-4xl">New arrivals</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-4">
          {newest.map((p) => <ProductCard key={p.id} product={p} wished={wished.has(p.id)} />)}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="container-page mt-16 sm:mt-24">
          <div className="mb-8 text-center">
            <p className="eyebrow">Reviews</p>
            <h2 className="heading mt-2 text-3xl sm:text-4xl">Loved by our customers</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.id} className="card flex flex-col p-7">
                <StarRating value={r.rating} />
                {r.title && <p className="heading mt-4 text-xl">“{r.title}”</p>}
                <blockquote className="mt-2 flex-1 leading-relaxed text-ink/70">{r.body}</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-medium">{r.user.name ?? "Customer"}</span>
                  <span className="text-ink/50"> on </span>
                  <Link href={`/products/${r.product.slug}`} className="text-brand hover:underline">{r.product.name}</Link>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="container-page mt-16 sm:mt-24">
        <div className="flex flex-col items-center rounded-3xl bg-brand px-5 py-12 text-center text-white sm:px-6 sm:py-16">
          <p className="text-xs font-semibold tracking-[0.25em] text-white/60 uppercase">Newsletter</p>
          <h2 className="heading mt-3 text-3xl sm:text-4xl">Get 10% off your first order</h2>
          <p className="mt-3 max-w-md text-white/70">New arrivals, restocks and members-only offers. No spam, unsubscribe anytime.</p>
          <div className="mt-8 flex w-full justify-center"><NewsletterForm dark /></div>
        </div>
      </section>
    </>
  );
}
