import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { StarRating } from "./StarRating";
import { WishlistButton } from "./WishlistButton";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    compareAtCents?: number | null;
    imageUrl: string;
    stock: number;
    ratingAvg?: number;
    ratingCount?: number;
    category?: { name: string } | null;
  };
  wished?: boolean;
  priority?: boolean;
};

export function ProductCard({ product, wished = false, priority = false }: Props) {
  const onSale = product.compareAtCents && product.compareAtCents > product.priceCents;
  const pctOff = onSale ? Math.round((1 - product.priceCents / product.compareAtCents!) * 100) : 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {onSale && <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">−{pctOff}%</span>}
          {product.stock === 0 ? (
            <span className="rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-white">Sold out</span>
          ) : product.stock <= 5 ? (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink">Only {product.stock} left</span>
          ) : null}
        </div>
        <div className="absolute top-3 right-3"><WishlistButton productId={product.id} initial={wished} /></div>
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          <span className="block rounded-full bg-white/95 py-2.5 text-center text-sm font-medium shadow-sm backdrop-blur">View product</span>
        </div>
      </div>
      <div className="mt-3 space-y-1 px-0.5">
        {product.category && <p className="text-xs tracking-wide text-ink/50 uppercase">{product.category.name}</p>}
        <h3 className="font-medium leading-snug group-hover:text-brand">{product.name}</h3>
        {!!product.ratingCount && <StarRating value={product.ratingAvg ?? 0} count={product.ratingCount} size="h-3.5 w-3.5" />}
        <p className="flex items-baseline gap-2">
          <span className={`font-semibold ${onSale ? "text-accent" : ""}`}>{formatPrice(product.priceCents)}</span>
          {onSale && <span className="text-sm text-ink/40 line-through">{formatPrice(product.compareAtCents!)}</span>}
        </p>
      </div>
    </Link>
  );
}
