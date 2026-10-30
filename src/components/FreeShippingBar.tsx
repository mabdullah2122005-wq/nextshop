import { formatPrice, formatPriceShort } from "@/lib/format";
import { FREE_SHIPPING_CENTS } from "@/lib/shipping";

export function FreeShippingBar({ subtotalCents }: { subtotalCents: number }) {
  const remaining = FREE_SHIPPING_CENTS - subtotalCents;
  const pct = Math.min(100, Math.round((subtotalCents / FREE_SHIPPING_CENTS) * 100));
  return (
    <div>
      <p className="text-sm">
        {remaining > 0 ? (
          <>You’re <strong>{formatPrice(remaining)}</strong> away from free shipping</>
        ) : (
          <>🎉 You’ve unlocked <strong>free shipping</strong></>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Free shipping at ${formatPriceShort(FREE_SHIPPING_CENTS)}`}>
        <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
