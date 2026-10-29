export default function Loading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
    </div>
  );
}
