import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login?callbackUrl=/admin");

  return (
    <div className="bg-sand/40">
      {/* minmax(0,1fr) stops wide tables from stretching the page on phones; tables scroll inside their card instead. */}
      <div className="container-page grid grid-cols-1 gap-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 hidden px-3 text-xs font-semibold tracking-[0.2em] text-ink/40 uppercase lg:block">Admin</p>
          <AdminNav />
          <Link href="/" className="mt-6 hidden px-3 text-sm text-ink/50 hover:text-ink lg:block">← View store</Link>
        </aside>
        <section className="min-w-0 pb-12">{children}</section>
      </div>
    </div>
  );
}
