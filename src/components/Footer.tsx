import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="container-page flex flex-col gap-2 py-8 text-sm text-stone-500 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_STORE_NAME ?? "NextShop"}. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/products" className="hover:text-brand">Shop</Link>
          <Link href="/account" className="hover:text-brand">My orders</Link>
        </div>
      </div>
    </footer>
  );
}
