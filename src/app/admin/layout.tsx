import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login?callbackUrl=/admin");

  return (
    <div className="container-page grid gap-8 py-8 md:grid-cols-[200px_1fr]">
      <aside>
        <p className="mb-3 text-xs font-semibold tracking-wider text-stone-500 uppercase">Admin</p>
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm whitespace-nowrap hover:bg-stone-100">
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
