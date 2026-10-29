import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type Props = {
  product: { slug: string; name: string; priceCents: number; imageUrl: string; stock: number; category?: { name: string } | null };
};

export function ProductCard({ product }: Props) {
  return (
    <Link href={`/products/${product.slug}`} className="group card overflow-hidden transition hover:shadow-md">
      <div className="relative aspect-square bg-stone-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 rounded bg-stone-900/80 px-2 py-0.5 text-xs text-white">Sold out</span>
        )}
      </div>
      <div className="p-3">
        {product.category && <p className="text-xs text-stone-500">{product.category.name}</p>}
        <h3 className="truncate font-medium">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-brand">{formatPrice(product.priceCents)}</p>
      </div>
    </Link>
  );
}
