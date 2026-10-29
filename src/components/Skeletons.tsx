export function ProductGridSkeleton({ count = 8, cols = "lg:grid-cols-4" }: { count?: number; cols?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 ${cols}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[4/5] rounded-2xl" />
          <div className="skeleton mt-3 h-3 w-16" />
          <div className="skeleton mt-2 h-4 w-3/4" />
          <div className="skeleton mt-2 h-4 w-14" />
        </div>
      ))}
    </div>
  );
}
