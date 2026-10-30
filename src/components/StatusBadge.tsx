const styles: Record<string, string> = {
  PENDING: "bg-cream text-ink/70",
  PAID: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-amber-50 text-amber-800",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.PENDING}`}>{status}</span>;
}
