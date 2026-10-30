"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoxIcon, ChartIcon, TagIcon, UsersIcon, BagIcon } from "@/components/icons";

const nav = [
  { href: "/admin", label: "Dashboard", icon: ChartIcon },
  { href: "/admin/orders", label: "Orders", icon: BagIcon },
  { href: "/admin/products", label: "Products", icon: BoxIcon },
  { href: "/admin/coupons", label: "Discounts", icon: TagIcon },
  { href: "/admin/users", label: "Customers", icon: UsersIcon },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:flex-col" aria-label="Admin">
      {nav.map((n) => {
        const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm whitespace-nowrap transition ${active ? "bg-brand text-white" : "text-ink/70 hover:bg-white"}`}
          >
            <n.icon className="h-[18px] w-[18px]" /> {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
