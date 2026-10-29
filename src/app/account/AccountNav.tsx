"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/account", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-2 border-b border-ink/8">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium ${path === t.href ? "border-ink text-ink" : "border-transparent text-ink/50 hover:text-ink"}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
