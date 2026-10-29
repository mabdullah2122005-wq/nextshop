export function StarRating({ value, size = "h-4 w-4", count }: { value: number; size?: string; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex text-gold" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, value - (i - 1)));
          return (
            <span key={i} className={`relative ${size}`}>
              <svg viewBox="0 0 20 20" className={`absolute inset-0 ${size} text-ink/15`} fill="currentColor" aria-hidden><path d="m10 1.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5Z" /></svg>
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <svg viewBox="0 0 20 20" className={size} fill="currentColor" aria-hidden><path d="m10 1.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5Z" /></svg>
              </span>
            </span>
          );
        })}
      </span>
      {count !== undefined && <span className="text-xs text-ink/50">({count})</span>}
    </span>
  );
}
