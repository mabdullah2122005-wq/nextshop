const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "USD";

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(d));
}

export function shortId(id: string) {
  return `#${id.slice(-8).toUpperCase()}`;
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
